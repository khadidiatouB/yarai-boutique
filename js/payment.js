/* ══════════════════════════════════════════════════════════════
   YARAÏ — payment.js
   Stripe (carte / Apple Pay / Google Pay) + PayDunya (Wave / Orange Money)
══════════════════════════════════════════════════════════════ */

/* ── Taux de conversion EUR → XOF (FCFA) ── */
const EUR_TO_XOF = 655.957;

let _config = null;
async function getConfig() {
  if (_config) return _config;
  try {
    _config = await fetch("/api/config").then(r => r.json());
  } catch { _config = {}; }
  return _config;
}

/* ══════════════════════════════════════════════════════════════
   COLLECTE DES INFOS CLIENT (partagé Stripe + PayDunya)
══════════════════════════════════════════════════════════════ */
function collectCustomer() {
  return {
    name:    document.getElementById("co-name")?.value.trim()    || "",
    email:   document.getElementById("co-email")?.value.trim()   || "",
    phone:   document.getElementById("co-phone")?.value.trim()   || "",
    address: document.getElementById("co-address")?.value.trim() || "",
    postal:  document.getElementById("co-postal")?.value.trim()  || "",
    city:    document.getElementById("co-city")?.value.trim()    || "",
    country: document.getElementById("co-country")?.value        || "FR",
  };
}

async function createOrder(customer, paymentMethod, amountEur) {
  const res = await fetch("/api/orders", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        name:    customer.name,
        email:   customer.email,
        phone:   customer.phone,
        address: customer.address + (customer.postal ? ", " + customer.postal : ""),
        city:    customer.city,
        country: customer.country,
      },
      paymentMethod,
      items: cart.map(c => ({
        productId: c.product.id,
        variant:   c.variant.label,
        size:      c.size,
        qty:       c.qty,
        price:     c.product.price,
      })),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erreur création commande");
  }
  return res.json(); // { orderId, reference }
}

/* ══════════════════════════════════════════════════════════════
   STRIPE — Carte, Apple Pay, Google Pay
══════════════════════════════════════════════════════════════ */

let stripe         = null;
let stripeElements = null;
let _pendingIntent = null; // { clientSecret, intentId } — pré-chargé dès la sélection de l'onglet

function resetStripeState() {
  _pendingIntent = null;
  stripeElements = null;
  // `stripe` (l'instance Stripe) est réutilisable, pas besoin de la réinitialiser
}

/* Pré-charge le formulaire Stripe dès que l'onglet carte/wallet est sélectionné,
   pour permettre un paiement en un seul clic sur "Confirmer et payer" */
async function preloadStripeElements() {
  resetStripeState();
  const cfg = await getConfig();
  if (!cfg.stripeKey || cfg.stripeKey.includes("VOTRE")) return;

  const totalAmount = cart.reduce((a, c) => a + c.product.price * c.qty, 0);
  if (!totalAmount) return;

  const mountPoint = document.getElementById("stripe-element");
  if (mountPoint) {
    mountPoint.innerHTML = `<div style="padding:24px;text-align:center;color:var(--muted);font-size:12px;letter-spacing:.5px">Chargement sécurisé…</div>`;
  }

  try {
    const res = await fetch("/api/payment-intent/init", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ amount: totalAmount }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Erreur serveur");
    const { clientSecret, intentId } = await res.json();
    _pendingIntent = { clientSecret, intentId };

    if (!stripe) stripe = Stripe(cfg.stripeKey);

    stripeElements = stripe.elements({
      clientSecret,
      appearance: {
        theme: "flat",
        variables: {
          colorPrimary:        "#0A0A0A",
          colorBackground:     "#FAFAFA",
          colorText:           "#0A0A0A",
          colorDanger:         "#991B1B",
          fontFamily:          "DM Sans, sans-serif",
          fontSizeBase:        "14px",
          borderRadius:        "4px",
          spacingUnit:         "4px",
        },
        rules: {
          ".Input": { border: "1px solid #E8E4DF", boxShadow: "none", padding: "12px 14px" },
          ".Input:focus": { border: "1px solid #0A0A0A", boxShadow: "none" },
          ".Label": { fontWeight: "400", letterSpacing: "1px", textTransform: "uppercase", fontSize: "11px", color: "#6B6B6B" },
        },
      },
    });

    const paymentElement = stripeElements.create("payment");
    if (mountPoint) { mountPoint.innerHTML = ""; paymentElement.mount("#stripe-element"); }

  } catch (err) {
    console.error("Stripe preload error:", err);
    if (mountPoint) {
      mountPoint.innerHTML = `<p style="color:#991B1B;font-size:12px;padding:8px 0">
        Erreur de chargement (${err.message}).
        <button onclick="preloadStripeElements()" style="font-size:11px;text-decoration:underline;background:none;border:none;cursor:pointer;color:#0A0A0A">Réessayer</button>
      </p>`;
    }
  }
}

async function processStripePayment(amountEur) {
  const cfg    = await getConfig();
  const payBtn = document.getElementById("btnPayFinal");

  if (!cfg.stripeKey || cfg.stripeKey.includes("VOTRE")) {
    simulatePayment("Stripe (mode démo — clé non configurée)");
    return;
  }

  if (!stripeElements || !_pendingIntent) {
    showToast("Le formulaire de paiement se charge encore — patientez un instant et réessayez.");
    return;
  }

  if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Traitement en cours…"; }

  try {
    const customer = collectCustomer();

    /* 1. Créer la commande en base */
    const { orderId, reference } = await createOrder(customer, "card", amountEur);

    /* 2. Attacher la commande à l'intent déjà pré-chargé */
    const patchRes = await fetch(`/api/payment-intent/${_pendingIntent.intentId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        reference,
        customer_email: customer.email,
        customer_name:  customer.name,
        customer_phone: customer.phone,
      }),
    });
    if (!patchRes.ok) {
      const e = await patchRes.json().catch(() => ({}));
      throw new Error(e.error || "Erreur serveur");
    }

    sessionStorage.setItem("yarai_stripe_order", JSON.stringify({ orderId, reference }));

    /* 3. Confirmer le paiement (carte ou Apple/Google Pay saisi dans le formulaire) */
    const { error } = await stripe.confirmPayment({
      elements: stripeElements,
      confirmParams: {
        // Stripe ajoute ?payment_intent=xxx&redirect_status=succeeded avant le #
        return_url: window.location.origin + "/#/confirmation",
      },
    });

    // Seulement atteint en cas d'erreur (succès = redirection)
    if (error) {
      const msg = error.type === "card_error" || error.type === "validation_error"
        ? error.message
        : "Une erreur est survenue. Réessayez.";
      showToast("❌ " + msg);
      if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Confirmer et payer →"; }
    }
  } catch (err) {
    console.error("Stripe error:", err);
    showToast("Erreur : " + err.message);
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Confirmer et payer →"; }
  }
}

/* ── Retour depuis Stripe (appelé sur #/confirmation) ── */
function handleStripeReturn() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("redirect_status");
  const piId   = params.get("payment_intent");
  if (!piId) return; // Pas un retour Stripe

  if (status === "succeeded") {
    cart = [];
    renderCart();
    sessionStorage.removeItem("yarai_stripe_order");
    // Nettoyer l'URL sans recharger
    history.replaceState(null, "", window.location.pathname + "#/confirmation");
    showToast("Paiement confirmé ✓");
  } else if (status === "requires_payment_method") {
    showToast("Paiement refusé — vérifiez vos informations.");
    navigate("/checkout");
  }
}

/* ══════════════════════════════════════════════════════════════
   PAYDUNYA — Wave & Orange Money (montant en XOF)
══════════════════════════════════════════════════════════════ */

async function processPayDunya(amountEur, channel) {
  const payBtn = document.getElementById("btnPayFinal");
  const cfg    = await getConfig();

  if (!cfg.paydunyaReady) {
    simulatePayment(channel === "WAVE_SN" ? "Wave (mode démo — PayDunya non configuré)" : "Orange Money (mode démo — PayDunya non configuré)");
    return;
  }

  if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Redirection vers le paiement…"; }

  try {
    const customer = collectCustomer();
    const amountXof = Math.round(amountEur * EUR_TO_XOF); // EUR → FCFA

    /* 1. Créer la commande */
    const method = channel === "WAVE_SN" ? "wave" : "orange";
    const { orderId, reference } = await createOrder(customer, method, amountEur);

    /* 2. Créer la facture PayDunya */
    const res = await fetch("/api/paydunya/create", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount:         amountXof,
        channel,
        orderId,
        reference,
        customer_name:  customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        items: cart.map(c => ({
          name:        c.product.name + " — " + c.variant.label + " / " + c.size,
          qty:         c.qty,
          unit_price:  Math.round(c.product.price * EUR_TO_XOF),
          total_price: Math.round(c.product.price * c.qty * EUR_TO_XOF),
        })),
      }),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || "Erreur serveur PayDunya");
    }
    const data = await res.json();
    if (!data.checkout_url) throw new Error("URL de paiement manquante");

    localStorage.setItem("yarai_pending_tx", JSON.stringify({ token: data.token, orderId, amountEur }));
    window.location.href = data.checkout_url;

  } catch (err) {
    console.error("PayDunya error:", err);
    showToast("Erreur : " + err.message);
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Confirmer et payer →"; }
  }
}

function processWavePayDunya(amount)  { processPayDunya(amount, "WAVE_SN"); }
function processOrangePayDunya(amount) { processPayDunya(amount, "ORANGE_MONEY_SN"); }

/* ══════════════════════════════════════════════════════════════
   VÉRIFICATION AU RETOUR DE PAYDUNYA
══════════════════════════════════════════════════════════════ */
async function verifyPayDunyaReturn() {
  const pending = localStorage.getItem("yarai_pending_tx");
  if (!pending) return;
  let tx;
  try { tx = JSON.parse(pending); } catch { localStorage.removeItem("yarai_pending_tx"); return; }

  try {
    const res  = await fetch("/api/paydunya/verify", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token: tx.token }),
    });
    const data = await res.json();
    if (data.status === "completed") {
      localStorage.removeItem("yarai_pending_tx");
      cart = [];
      renderCart();
      showToast("Paiement confirmé ✓");
    } else if (data.status === "cancelled") {
      localStorage.removeItem("yarai_pending_tx");
      showToast("Paiement annulé.");
    }
  } catch { /* silencieux — le webhook IPN prendra le relais */ }
}

/* ══════════════════════════════════════════════════════════════
   SIMULATION (clés non configurées)
══════════════════════════════════════════════════════════════ */
function simulatePayment(method) {
  const payBtn = document.getElementById("btnPayFinal");
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Simulation en cours…"; }
  showToast("Mode démo : " + method);
  setTimeout(() => {
    cart = [];
    renderCart();
    navigate("/confirmation");
  }, 1800);
}

/* ── Init sur la page confirmation ── */
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash.startsWith("#/confirmation")) {
    verifyPayDunyaReturn();
  }
});
