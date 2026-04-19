/**
 * YARAÏ — server.js
 * Backend : paiement (Stripe + PayDunya) + base de données (Prisma/PostgreSQL)
 */

const express            = require("express");
const axios              = require("axios");
const jwt                = require("jsonwebtoken");
const bcrypt             = require("bcryptjs");
const { Pool }           = require("pg");
const { PrismaPg }       = require("@prisma/adapter-pg");
const { PrismaClient }   = require("@prisma/client");
require("dotenv").config();

const app     = express();
const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// Servir les fichiers statiques du frontend (même serveur = pas de CORS)
app.use(express.static(__dirname));
app.use(express.json());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PAYDUNYA_BASE = process.env.PAYDUNYA_MODE === "test"
  ? "https://app.paydunya.com/sandbox-api/v1"
  : "https://app.paydunya.com/api/v1";

const paydunyaHeaders = {
  "PAYDUNYA-MASTER-KEY":  process.env.PAYDUNYA_MASTER_KEY,
  "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
  "PAYDUNYA-TOKEN":       process.env.PAYDUNYA_TOKEN,
  "Content-Type": "application/json",
};

/* ══════════════════════════════════════════════════════════════
   STOCK
══════════════════════════════════════════════════════════════ */

// GET /api/stock?productId=skirt-safia
// Retourne le stock disponible pour un produit (toutes variantes + tailles)
app.get("/api/stock", async (req, res) => {
  try {
    const { productId } = req.query;
    const where = productId ? { productId } : {};
    const stocks = await prisma.stock.findMany({ where });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stock/check — vérifie disponibilité avant de payer
// Body: [{ productId, variant, size, qty }]
app.post("/api/stock/check", async (req, res) => {
  try {
    const items = req.body.items;
    const unavailable = [];

    for (const item of items) {
      const stock = await prisma.stock.findUnique({
        where: { productId_variant_size: { productId: item.productId, variant: item.variant, size: item.size } },
      });
      if (!stock || stock.qty < item.qty) {
        unavailable.push({ ...item, available: stock?.qty ?? 0 });
      }
    }

    if (unavailable.length > 0) {
      return res.status(409).json({ ok: false, unavailable });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   STRIPE
══════════════════════════════════════════════════════════════ */

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, orderId, reference, customer_name, customer_email, customer_phone, items } = req.body;

    // Vérifier le stock
    if (items) {
      for (const item of items) {
        const stock = await prisma.stock.findUnique({
          where: { productId_variant_size: { productId: item.productId, variant: item.variant, size: item.size } },
        });
        if (!stock || stock.qty < item.qty) {
          return res.status(409).json({ error: `Stock insuffisant : ${item.productId} / ${item.variant} / ${item.size}` });
        }
      }
    }

    // amount est en euros (ex: 75 = 75€) → Stripe attend des centimes
    const amountCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:        amountCents,
      currency:      "eur",
      description:   "Commande YARAÏ" + (reference ? " — " + reference : ""),
      receipt_email: customer_email,
      metadata: {
        orderId:        String(orderId  || ""),
        reference:      reference       || "",
        customer_name,
        customer_phone: customer_phone  || "",
      },
      automatic_payment_methods: { enabled: true },
    });

    // Associer le paymentIntent à la commande dès maintenant
    if (orderId) {
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data:  { paymentId: paymentIntent.id },
      }).catch(() => {});
    }

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Webhook Stripe — déclenché quand le paiement est confirmé
app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send("Webhook Error: " + err.message);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    await confirmOrder(intent.id, "card", intent.metadata);
  }

  res.json({ received: true });
});

/* ══════════════════════════════════════════════════════════════
   PAYDUNYA — Wave, Orange Money, Free Money
══════════════════════════════════════════════════════════════ */

// POST /api/paydunya/create — crée une facture et retourne l'URL de paiement
app.post("/api/paydunya/create", async (req, res) => {
  try {
    const { amount, channel, orderId, reference, customer_name, customer_email, customer_phone, items } = req.body;

    const response = await axios.post(`${PAYDUNYA_BASE}/checkout-invoice/create`, {
      invoice: {
        total_amount: Math.round(amount),
        description:  `Commande YARAÏ — ${reference || ""}`,
        items:        items || [],
      },
      store: {
        name:           "YARAÏ",
        tagline:        "Simplement Belle",
        postal_address: "Dakar, Sénégal",
        phone:          process.env.STORE_PHONE || "",
        website_url:    process.env.FRONTEND_URL || "",
      },
      actions: {
        cancel_url:   `${process.env.FRONTEND_URL || "http://localhost:5500"}/#/checkout`,
        return_url:   `${process.env.FRONTEND_URL || "http://localhost:5500"}/#/confirmation`,
        callback_url: `${process.env.BACKEND_URL  || "http://localhost:3000"}/api/paydunya/notify`,
      },
      custom_data: { orderId, reference, customer_name, customer_email, customer_phone, channel },
    }, { headers: paydunyaHeaders });

    const data = response.data;
    if (data.response_code !== "00") {
      return res.status(400).json({ error: data.response_text || "Échec création facture PayDunya" });
    }

    // Stocker le token PayDunya sur la commande pour retrouver par paymentId
    if (orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { paymentId: data.token } });
    }

    console.log("PayDunya invoice créée:", data.token);
    res.json({ checkout_url: data.response_text, token: data.token });

  } catch (err) {
    console.error("PayDunya create error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/paydunya/verify — vérifie le statut d'un paiement (appelé par le frontend au retour)
app.post("/api/paydunya/verify", async (req, res) => {
  const { token } = req.body;
  try {
    const response = await axios.get(`${PAYDUNYA_BASE}/checkout-invoice/confirm/${token}`, {
      headers: paydunyaHeaders,
    });
    const data = response.data;
    const status = data.status; // "completed" | "pending" | "cancelled"

    if (status === "completed") {
      await confirmOrder(token, "mobile_money", {});
    }

    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/paydunya/notify — webhook IPN (appelé automatiquement par PayDunya)
app.post("/api/paydunya/notify", async (req, res) => {
  const { data } = req.body;
  const token = data?.invoice?.token;
  console.log("PayDunya IPN reçu:", token);
  if (token) await confirmOrder(token, "mobile_money", {});
  res.sendStatus(200);
});

/* ══════════════════════════════════════════════════════════════
   COMMANDES
══════════════════════════════════════════════════════════════ */

// POST /api/orders — créer une commande (avant paiement)
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, paymentMethod } = req.body;
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Upsert client
    const dbCustomer = await prisma.customer.upsert({
      where:  { email: customer.email },
      update: { name: customer.name, phone: customer.phone, city: customer.city, address: customer.address, country: customer.country },
      create: { name: customer.name, email: customer.email, phone: customer.phone, city: customer.city, address: customer.address, country: customer.country },
    });

    // Créer commande
    const reference = "YARAI-" + Date.now().toString(36).toUpperCase();
    const order = await prisma.order.create({
      data: {
        reference,
        total,
        paymentMethod,
        customerId: dbCustomer.id,
        items: {
          create: items.map(i => ({
            productId: i.productId,
            variant:   i.variant,
            size:      i.size,
            qty:       i.qty,
            price:     i.price,
          })),
        },
      },
      include: { items: true },
    });

    res.json({ orderId: order.id, reference: order.reference });
  } catch (err) {
    console.error("Order error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — liste toutes les commandes (admin)
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   FONCTION INTERNE — confirmation de commande
   Appelée par les webhooks Stripe et CinetPay
══════════════════════════════════════════════════════════════ */
async function confirmOrder(paymentId, method, metadata) {
  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ paymentId }, { reference: metadata?.reference }] },
      include: { items: { include: { product: true } }, customer: true },
    });

    if (!order || order.status === "PAID") return;

    await prisma.order.update({
      where: { id: order.id },
      data:  { status: "PAID", paymentId },
    });

    for (const item of order.items) {
      await prisma.stock.updateMany({
        where: { productId: item.productId, variant: item.variant, size: item.size },
        data:  { qty: { decrement: item.qty } },
      });
    }

    // Points fidélité : 1 point par euro dépensé
    const points = Math.floor(order.total);
    await prisma.customer.update({
      where: { id: order.customerId },
      data:  { loyaltyPoints: { increment: points } },
    });
    console.log(`⭐ +${points} points fidélité → client #${order.customerId}`);

    // Envoyer emails (client + admin)
    await sendConfirmationEmail(order);
    await sendAdminNotification(order);

    console.log(`✅ Commande ${order.reference} confirmée — stock mis à jour`);
  } catch (err) {
    console.error("confirmOrder error:", err.message);
  }
}

async function sendConfirmationEmail(order) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fmt = n => parseInt(n).toLocaleString("fr") + " FCFA";

    const itemsHtml = order.items.map(i => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F2E4D0">${i.product.name} — ${i.variant} / ${i.size}</td>
        <td style="padding:10px 0;border-bottom:1px solid #F2E4D0;text-align:right">×${i.qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #F2E4D0;text-align:right">${fmt(i.price * i.qty)}</td>
      </tr>`).join("");

    await resend.emails.send({
      from: "YARAÏ <onboarding@resend.dev>",
      to:   order.customer.email,
      subject: `✅ Commande confirmée — ${order.reference}`,
      html: `
        <div style="font-family:'Outfit',sans-serif;max-width:600px;margin:0 auto;background:#FBF6EE;padding:40px">
          <h1 style="font-size:28px;letter-spacing:8px;color:#C4704A;margin-bottom:4px">YARAÏ</h1>
          <p style="font-size:11px;letter-spacing:2px;color:#957860;text-transform:uppercase;margin-bottom:32px">simplement belle</p>

          <h2 style="font-size:20px;font-weight:400;margin-bottom:8px">Merci pour votre commande, ${order.customer.name.split(" ")[0]} !</h2>
          <p style="color:#957860;margin-bottom:24px">Votre paiement a bien été reçu. Référence : <strong>${order.reference}</strong></p>

          <div style="background:white;border-radius:16px;padding:24px;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <th style="text-align:left;font-size:10px;letter-spacing:2px;color:#957860;text-transform:uppercase;padding-bottom:12px">Article</th>
                <th style="text-align:right;font-size:10px;letter-spacing:2px;color:#957860;text-transform:uppercase;padding-bottom:12px">Qté</th>
                <th style="text-align:right;font-size:10px;letter-spacing:2px;color:#957860;text-transform:uppercase;padding-bottom:12px">Prix</th>
              </tr>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding-top:16px;font-weight:500">Total</td>
                <td style="padding-top:16px;text-align:right;color:#C4704A;font-weight:500">${fmt(order.total)}</td>
              </tr>
            </table>
          </div>

          <p style="font-size:13px;color:#957860;line-height:1.8">
            Notre équipe vous contactera dans les 24h pour organiser la livraison.<br>
            Des questions ? Écrivez-nous à <a href="mailto:contact@yarai.sn" style="color:#C4704A">contact@yarai.sn</a>
          </p>
        </div>
      `,
    });
    console.log(`📧 Email confirmation envoyé à ${order.customer.email}`);
  } catch (err) {
    console.error("Email client error:", err.message);
  }
}

async function sendAdminNotification(order) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return;
  try {
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fmt = n => parseInt(n).toLocaleString("fr") + " FCFA";

    const itemsText = order.items.map(i =>
      `• ${i.product.name} — ${i.variant} / ${i.size} ×${i.qty} = ${fmt(i.price * i.qty)}`
    ).join("\n");

    await resend.emails.send({
      from: "YARAÏ <onboarding@resend.dev>",
      to:   process.env.ADMIN_EMAIL,
      subject: `🛍️ Nouvelle commande ${order.reference} — ${fmt(order.total)}`,
      html: `
        <div style="font-family:'Outfit',sans-serif;max-width:600px;margin:0 auto;background:#FBF6EE;padding:40px">
          <h1 style="font-size:22px;letter-spacing:6px;color:#C4704A;margin-bottom:4px">YARAÏ — Nouvelle commande</h1>
          <h2 style="font-size:18px;font-weight:400;margin-bottom:20px">${order.reference} · ${fmt(order.total)}</h2>

          <div style="background:white;border-radius:16px;padding:24px;margin-bottom:20px">
            <p style="font-size:11px;letter-spacing:2px;color:#957860;text-transform:uppercase;margin-bottom:12px">Client</p>
            <p><strong>${order.customer.name}</strong></p>
            <p style="color:#957860">${order.customer.email}</p>
            <p style="color:#957860">${order.customer.phone || "—"}</p>
            <p style="color:#957860">${order.customer.address || ""} ${order.customer.city || ""} ${order.customer.country || ""}</p>
          </div>

          <div style="background:white;border-radius:16px;padding:24px;margin-bottom:20px">
            <p style="font-size:11px;letter-spacing:2px;color:#957860;text-transform:uppercase;margin-bottom:12px">Articles</p>
            <pre style="font-family:'Outfit',sans-serif;font-size:13px;color:#261A12;white-space:pre-wrap">${itemsText}</pre>
          </div>

          <div style="background:#C4704A;border-radius:16px;padding:20px;text-align:center">
            <p style="color:white;font-size:13px;margin-bottom:12px">Gérer cette commande</p>
            <a href="${process.env.FRONTEND_URL || ""}/admin.html" style="background:white;color:#C4704A;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase">Ouvrir l'admin</a>
          </div>
        </div>
      `,
    });
    console.log(`📧 Notification admin envoyée à ${process.env.ADMIN_EMAIL}`);
  } catch (err) {
    console.error("Email admin error:", err.message);
  }
}

/* ══════════════════════════════════════════════════════════════
   AUTHENTIFICATION CLIENT (JWT)
══════════════════════════════════════════════════════════════ */

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || "yarai_customer_secret";
const FRONTEND_URL        = process.env.FRONTEND_URL || "http://localhost:3000";
const crypto              = require("crypto");

function authCustomer(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Non authentifié" });
  try {
    req.customer = jwt.verify(auth.slice(7), CUSTOMER_JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expirée, veuillez vous reconnecter" });
  }
}

/* ── Envoi email de vérification ── */
async function sendVerificationEmail(customer, token) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Lien de vérification : ${FRONTEND_URL}/#/verify?token=${token}`);
    return; // En dev sans Resend, le lien s'affiche dans la console
  }
  const { Resend } = require("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const verifyUrl = `${FRONTEND_URL}/#/verify?token=${token}`;
  const firstName = customer.name.split(" ")[0];

  await resend.emails.send({
    from:    "YARAÏ <onboarding@resend.dev>",
    to:      customer.email,
    subject: "Vérifiez votre adresse email — YARAÏ",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAFAFA;padding:48px 40px">
        <h1 style="font-family:Georgia,serif;font-size:22px;letter-spacing:8px;color:#0A0A0A;margin:0 0 6px">YARAÏ</h1>
        <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#6B6B6B;margin:0 0 40px">simplement belle</p>

        <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0A0A0A;margin:0 0 12px">
          Bonjour ${firstName},
        </h2>
        <p style="font-size:15px;line-height:1.8;color:#6B6B6B;margin:0 0 32px">
          Merci de vous être inscrite sur YARAÏ.<br>
          Pour activer votre compte, cliquez sur le lien ci-dessous.<br>
          <strong style="color:#0A0A0A">Ce lien expire dans 24 heures.</strong>
        </p>

        <!-- Bouton principal -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
          <tr>
            <td style="background:#0A0A0A;padding:16px 36px;border-radius:4px">
              <a href="${verifyUrl}" style="color:#FFFFFF;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:600">
                Vérifier mon adresse email &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Lien texte de secours -->
        <p style="font-size:13px;color:#6B6B6B;margin:0 0 8px">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
        <p style="font-size:12px;margin:0 0 32px;word-break:break-all">
          <a href="${verifyUrl}" style="color:#0A0A0A">${verifyUrl}</a>
        </p>

        <p style="font-size:12px;color:#6B6B6B;line-height:1.7;margin:0">
          Si vous n'avez pas créé de compte YARAÏ, ignorez cet email.
        </p>

        <hr style="border:none;border-top:1px solid #E8E4DF;margin:36px 0 20px">
        <p style="font-size:11px;color:#6B6B6B;margin:0">© 2025 YARAÏ — Tous droits réservés</p>
      </div>
    `,
  });
  console.log(`📧 Email de vérification envoyé à ${customer.email}`);
}

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Nom, email et mot de passe requis" });
  if (password.length < 8)
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });

  try {
    const existing = await prisma.customer.findUnique({ where: { email } });

    if (existing?.password && existing.verified)
      return res.status(409).json({ error: "Un compte existe déjà avec cet email. Connectez-vous." });

    const hash        = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h

    let customer;
    if (existing) {
      customer = await prisma.customer.update({
        where: { email },
        data: { name, phone: phone || existing.phone, password: hash, verified: false, verifyToken, verifyExpiry },
      });
    } else {
      customer = await prisma.customer.create({
        data: { name, email, phone: phone || null, password: hash, verified: false, verifyToken, verifyExpiry },
      });
    }

    await sendVerificationEmail(customer, verifyToken);

    res.status(201).json({ needsVerification: true, email: customer.email });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Erreur serveur. Réessayez." });
  }
});

// GET /api/auth/verify?token=xxx
app.get("/api/auth/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Token manquant" });

  try {
    const customer = await prisma.customer.findUnique({ where: { verifyToken: token } });

    if (!customer)
      return res.status(400).json({ error: "Lien invalide ou déjà utilisé" });
    if (customer.verifyExpiry < new Date())
      return res.status(400).json({ error: "Lien expiré. Créez à nouveau votre compte." });

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data:  { verified: true, verifyToken: null, verifyExpiry: null },
    });

    const jwtToken = jwt.sign(
      { id: updated.id, email: updated.email, name: updated.name },
      CUSTOMER_JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Réponse JSON (le frontend gère la redirection via hash)
    res.json({
      token: jwtToken,
      customer: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, city: updated.city, address: updated.address, country: updated.country },
    });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/auth/resend — renvoyer l'email de vérification
app.post("/api/auth/resend", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });
  try {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.password) return res.status(404).json({ error: "Compte introuvable" });
    if (customer.verified) return res.status(400).json({ error: "Compte déjà vérifié" });

    const verifyToken  = crypto.randomBytes(32).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.customer.update({ where: { id: customer.id }, data: { verifyToken, verifyExpiry } });
    await sendVerificationEmail({ ...customer, verifyToken }, verifyToken);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });
  try {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.password)
      return res.status(401).json({ error: "Identifiants incorrects" });
    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) return res.status(401).json({ error: "Identifiants incorrects" });
    if (!customer.verified)
      return res.status(403).json({ error: "Vérifiez votre email avant de vous connecter.", needsVerification: true, email });

    const token = jwt.sign({ id: customer.id, email: customer.email, name: customer.name }, CUSTOMER_JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, city: customer.city, address: customer.address, country: customer.country } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", authCustomer, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where:  { id: req.customer.id },
      select: { id: true, name: true, email: true, phone: true, address: true, postalCode: true, city: true, country: true, birthdate: true, loyaltyPoints: true, createdAt: true },
    });
    if (!customer) return res.status(404).json({ error: "Compte introuvable" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/config — clés publiques (Stripe, Google Maps…)
app.get("/api/config", (_req, res) => {
  res.json({
    stripeKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    mapsKey:   process.env.GOOGLE_MAPS_KEY        || "",
  });
});

// PATCH /api/customer/profile — mise à jour du profil
app.patch("/api/customer/profile", authCustomer, async (req, res) => {
  const { name, phone, address, postalCode, city, country, birthdate } = req.body;
  const data = {};
  if (name       !== undefined) data.name       = name;
  if (phone      !== undefined) data.phone      = phone;
  if (address    !== undefined) data.address    = address;
  if (postalCode !== undefined) data.postalCode = postalCode;
  if (city       !== undefined) data.city       = city;
  if (country    !== undefined) data.country    = country;
  if (birthdate  !== undefined) data.birthdate  = birthdate ? new Date(birthdate) : null;
  try {
    const customer = await prisma.customer.update({
      where:  { id: req.customer.id },
      data,
      select: { id:true, name:true, email:true, phone:true, address:true, postalCode:true, city:true, country:true, birthdate:true, loyaltyPoints:true, createdAt:true },
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer/orders — historique des commandes du client connecté
app.get("/api/customer/orders", authCustomer, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where:   { customerId: req.customer.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customer/me — profil complet (avec points + date inscription)
app.get("/api/customer/me", authCustomer, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where:  { id: req.customer.id },
      select: { id:true, name:true, email:true, phone:true, address:true, city:true, country:true, birthdate:true, loyaltyPoints:true, createdAt:true },
    });
    if (!customer) return res.status(404).json({ error: "Compte introuvable" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   AUTHENTIFICATION ADMIN (JWT)
══════════════════════════════════════════════════════════════ */

const JWT_SECRET = process.env.JWT_SECRET || "yarai_dev_secret_change_in_prod";

// Middleware : vérifie le token JWT
function authAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Non autorisé" });
  try {
    req.admin = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

// POST /api/admin/login
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }
    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/setup — créer le premier compte admin (désactivé après usage)
app.post("/api/admin/setup", async (req, res) => {
  const { email, password, secret } = req.body;
  if (secret !== process.env.SETUP_SECRET) return res.status(403).json({ error: "Secret incorrect" });
  try {
    const existing = await prisma.admin.count();
    if (existing > 0) return res.status(400).json({ error: "Admin déjà créé" });
    const hash = await bcrypt.hash(password, 12);
    const admin = await prisma.admin.create({ data: { email, password: hash } });
    res.json({ ok: true, email: admin.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   ROUTES ADMIN PROTÉGÉES
══════════════════════════════════════════════════════════════ */

// GET /api/admin/orders — toutes les commandes
app.get("/api/admin/orders", authAdmin, async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/orders/:id — statut, tracking, notes
app.patch("/api/admin/orders/:id", authAdmin, async (req, res) => {
  const { status, trackingNumber, deliveryNotes } = req.body;
  const data = {};
  if (status        !== undefined) data.status         = status;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
  if (deliveryNotes  !== undefined) data.deliveryNotes  = deliveryNotes;
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stock — tout le stock
app.get("/api/admin/stock", authAdmin, async (_req, res) => {
  try {
    const stocks = await prisma.stock.findMany({ include: { product: true }, orderBy: { productId: "asc" } });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/stock/:id — modifier une quantité
app.patch("/api/admin/stock/:id", authAdmin, async (req, res) => {
  const { qty } = req.body;
  try {
    const stock = await prisma.stock.update({
      where: { id: parseInt(req.params.id) },
      data:  { qty: parseInt(qty) },
    });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/dashboard — stats rapides
app.get("/api/admin/dashboard", authAdmin, async (_req, res) => {
  try {
    const [totalOrders, paidOrders, totalRevenue, lowStock] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
      prisma.stock.findMany({ where: { qty: { lte: 2 } }, include: { product: true } }),
    ]);
    res.json({
      totalOrders,
      paidOrders,
      revenue: totalRevenue._sum.total || 0,
      lowStock,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   HEALTH CHECK
══════════════════════════════════════════════════════════════ */
app.get("/health", (_req, res) => res.json({ status: "YARAÏ server OK" }));

const PORT = process.env.PORT || 3000;

async function migrate() {
  try {
    await pool.query(`ALTER TABLE "Order"    ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT`);
    await pool.query(`ALTER TABLE "Order"    ADD COLUMN IF NOT EXISTS "deliveryNotes"  TEXT`);
    await pool.query(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "birthdate"      TIMESTAMP`);
    await pool.query(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "loyaltyPoints"  INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "postalCode"     TEXT`);
  } catch (e) { console.warn("migrate:", e.message); }
}

migrate().then(() => {
  app.listen(PORT, () => console.log(`✅ YARAÏ server démarré sur http://localhost:${PORT}`));
});
