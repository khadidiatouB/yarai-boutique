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
    const { amount, customer_name, customer_email, customer_phone, items } = req.body;

    // Vérifier le stock avant de créer le paiement
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount),
      currency: "xof",
      description: "Commande YARAÏ",
      receipt_email: customer_email,
      metadata: { customer_name, customer_phone },
      automatic_payment_methods: { enabled: true },
    });

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
      from: `YARAÏ Notifications <commandes@${process.env.EMAIL_DOMAIN || "yarai.sn"}>`,
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

// PATCH /api/admin/orders/:id — mettre à jour le statut d'une commande
app.patch("/api/admin/orders/:id", authAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data:  { status },
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
app.listen(PORT, () => console.log(`✅ YARAÏ server démarré sur http://localhost:${PORT}`));
