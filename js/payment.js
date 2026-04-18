/* ══════════════════════════════════════════════════════════════
   YARAÏ — payment.js
   Stripe (carte/Apple Pay/Google Pay) + PayDunya (Wave, Orange Money)
══════════════════════════════════════════════════════════════ */

const PAYMENT_CONFIG = {
  stripe: {
    publishableKey: "pk_live_VOTRE_CLE_STRIPE_PUBLIQUE",
    // En test : "pk_test_VOTRE_CLE_STRIPE_TEST"
  },
  // En prod : même origine (vide = relatif). En dev local : "http://localhost:3000"
  backendUrl: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "",
  urls: {
    success: window.location.origin + "/#/confirmation",
    cancel:  window.location.origin + "/#/checkout",
  },
};

/* ══════════════════════════════════════════════════════════════
   PAYDUNYA — Wave & Orange Money
   Flux : backend crée la facture → redirection vers PayDunya
         → l'utilisateur paie → retour sur votre site
══════════════════════════════════════════════════════════════ */

async function processPayDunya(amount, name, email, phone, channel) {
  const payBtn = document.getElementById("btnPayFinal");
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Redirection vers le paiement…"; }

  try {
    const coName    = document.getElementById("co-name")?.value.trim()    || name;
    const coEmail   = document.getElementById("co-email")?.value.trim()   || email;
    const coPhone   = document.getElementById("co-phone")?.value.trim()   || phone;
    const coCity    = document.getElementById("co-city")?.value.trim()    || "";
    const coAddress = document.getElementById("co-address")?.value.trim() || "";
    const coCountry = document.getElementById("co-country")?.value        || "SN";

    // 1. Créer la commande en base AVANT le paiement
    const orderRes = await fetch(PAYMENT_CONFIG.backendUrl + "/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { name: coName, email: coEmail, phone: coPhone, city: coCity, address: coAddress, country: coCountry },
        paymentMethod: channel === "WAVE_SN" ? "wave" : "orange",
        items: cart.map(c => ({
          productId: c.product.id,
          variant:   c.variant.label,
          size:      c.size,
          qty:       c.qty,
          price:     c.product.price,
        })),
      }),
    });
    if (!orderRes.ok) throw new Error("Erreur création commande");
    const { orderId, reference } = await orderRes.json();

    // 2. Créer la facture PayDunya
    const res = await fetch(PAYMENT_CONFIG.backendUrl + "/api/paydunya/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        channel,
        orderId,
        reference,
        customer_name:  coName,
        customer_email: coEmail,
        customer_phone: coPhone,
        items: cart.map(c => ({
          name:        c.product.name + " – " + c.variant.label + " / " + c.size,
          qty:         c.qty,
          unit_price:  c.product.price,
          total_price: c.product.price * c.qty,
        })),
      }),
    });

    if (!res.ok) throw new Error("Erreur serveur: " + res.status);
    const data = await res.json();
    if (!data.checkout_url) throw new Error("URL de paiement manquante");

    localStorage.setItem("yarai_pending_tx", JSON.stringify({ token: data.token, orderId, amount }));
    window.location.href = data.checkout_url;

  } catch (err) {
    console.error("PayDunya error:", err);
    showToast("Erreur de connexion au paiement. Réessayez.");
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Confirmer et payer →"; }
  }
}

function processWavePayDunya(amount, name, email, phone) {
  processPayDunya(amount, name, email, phone, "WAVE_SN");
}

function processOrangePayDunya(amount, name, email, phone) {
  processPayDunya(amount, name, email, phone, "ORANGE_MONEY_SN");
}

/* ══════════════════════════════════════════════════════════════
   STRIPE — Carte bancaire, Apple Pay, Google Pay
══════════════════════════════════════════════════════════════ */

let stripe = null;
let stripeElements = null;

async function processStripePayment(amount, name, email) {
  const cfg = PAYMENT_CONFIG.stripe;

  if (cfg.publishableKey.startsWith("pk_live_VOTRE") || cfg.publishableKey.startsWith("pk_test_VOTRE")) {
    simulatePayment("Stripe (Carte / Apple Pay / Google Pay)");
    return;
  }

  const payBtn = document.getElementById("btnPayFinal");
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Connexion au paiement…"; }

  try {
    const res = await fetch(PAYMENT_CONFIG.backendUrl + "/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        customer_name:  name,
        customer_email: email,
        items: cart.map(c => ({
          productId: c.product.id,
          variant:   c.variant.label,
          size:      c.size,
          qty:       c.qty,
        })),
      }),
    });

    if (!res.ok) throw new Error("Erreur serveur: " + res.status);
    const { clientSecret } = await res.json();

    if (!stripe) stripe = Stripe(cfg.publishableKey);

    stripeElements = stripe.elements({
      clientSecret,
      appearance: {
        theme: "flat",
        variables: {
          colorPrimary:    "#C4704A",
          colorBackground: "#FBF6EE",
          fontFamily:      "Outfit, sans-serif",
          borderRadius:    "12px",
        },
      },
    });

    const paymentElement = stripeElements.create("payment");
    const mountPoint = document.getElementById("stripe-element");
    if (mountPoint) { mountPoint.innerHTML = ""; paymentElement.mount("#stripe-element"); }

    if (payBtn) {
      payBtn.disabled  = false;
      payBtn.textContent = "Payer " + fmt(amount) + " →";
      payBtn.onclick   = confirmStripePayment;
    }

  } catch (err) {
    console.error("Stripe error:", err);
    showToast("Erreur de connexion au paiement. Réessayez.");
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Confirmer et payer →"; }
  }
}

async function confirmStripePayment() {
  if (!stripe || !stripeElements) return;
  const payBtn = document.getElementById("btnPayFinal");
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Traitement…"; }

  const { error } = await stripe.confirmPayment({
    elements: stripeElements,
    confirmParams: { return_url: PAYMENT_CONFIG.urls.success },
  });

  if (error) {
    showToast("❌ " + (error.message || "Paiement refusé."));
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Réessayer →"; }
  }
}

/* ══════════════════════════════════════════════════════════════
   SIMULATION (clés non configurées)
══════════════════════════════════════════════════════════════ */
function simulatePayment(method) {
  const payBtn = document.getElementById("btnPayFinal");
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Traitement en cours…"; }
  showToast("🔄 Simulation paiement via " + method);
  setTimeout(() => {
    cart = [];
    renderCart();
    navigate("/confirmation");
  }, 2000);
}

/* ══════════════════════════════════════════════════════════════
   VÉRIFICATION AU RETOUR DE PAYDUNYA
══════════════════════════════════════════════════════════════ */
async function verifyPayDunyaReturn() {
  const pending = localStorage.getItem("yarai_pending_tx");
  if (!pending) return;
  const { token } = JSON.parse(pending);

  try {
    const res = await fetch(PAYMENT_CONFIG.backendUrl + "/api/paydunya/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (data.status === "completed") {
      localStorage.removeItem("yarai_pending_tx");
      cart = [];
      renderCart();
    }
  } catch (e) { /* silencieux */ }
}

if (window.location.hash === "#/confirmation") {
  verifyPayDunyaReturn();
}
