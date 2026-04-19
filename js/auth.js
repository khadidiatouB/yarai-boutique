/* ══════════════════════════════════════════════════════════════
   YARAÏ — auth.js
   Authentification client (inscription / connexion / session)
══════════════════════════════════════════════════════════════ */

const AUTH_TOKEN_KEY = "yarai_customer_token";
const AUTH_USER_KEY  = "yarai_customer_data";

let currentUser = null;

/* ── Session ── */
function getToken() { return localStorage.getItem(AUTH_TOKEN_KEY); }

function saveAuth(token, customer) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(customer));
  currentUser = customer;
  updateNavUser();
}

function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  currentUser = null;
  updateNavUser();
}

function loadStoredAuth() {
  const token = getToken();
  const raw   = localStorage.getItem(AUTH_USER_KEY);
  if (token && raw) {
    try { currentUser = JSON.parse(raw); } catch { clearAuth(); }
  }
  updateNavUser();
}

/* ── Nav — affichage utilisateur ── */
function updateNavUser() {
  const el = document.getElementById("navUserArea");
  if (!el) return;
  if (currentUser) {
    const first = currentUser.name.split(" ")[0];
    el.innerHTML = `
      <button class="nav-user-btn" onclick="navigate('/compte')">Bonjour, ${first}</button>
      <button class="nav-user-logout" onclick="logout()">Déconnexion</button>
    `;
  } else {
    el.innerHTML = `<button class="nav-user-btn" onclick="navigate('/auth')">Connexion</button>`;
  }
}

/* ── Déconnexion ── */
function logout() {
  clearAuth();
  showToast("Vous êtes déconnectée");
  navigate("/");
}

/* ── Guard checkout — remplace goToCheckout de main.js ── */
function goToCheckout() {
  if (cart.length === 0) { showToast("Votre panier est vide"); return; }
  toggleCart();
  if (!currentUser) {
    sessionStorage.setItem("yarai_auth_intent", "checkout");
    navigate("/auth");
  } else {
    navigate("/checkout");
  }
}

/* ══════════════════════════════════════════════════════════════
   PAGE AUTH — rendu
══════════════════════════════════════════════════════════════ */
function renderAuthPage() {
  const container = document.getElementById("page-auth");
  if (!container) return;

  const intent   = sessionStorage.getItem("yarai_auth_intent") || "";
  const subtitle = intent === "checkout"
    ? "Connectez-vous pour finaliser votre commande"
    : "Accédez à votre espace YARAÏ";

  container.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-brand" onclick="navigate('/')">YARAÏ</div>
      <p class="auth-subtitle">${subtitle}</p>

      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-login"    onclick="switchAuthTab('login')">Se connecter</button>
        <button class="auth-tab"        id="tab-register" onclick="switchAuthTab('register')">Créer un compte</button>
      </div>

      <!-- ─── Connexion ─── -->
      <div id="form-login" class="auth-form">
        <div class="auth-field">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="email@exemple.com" autocomplete="email">
        </div>
        <div class="auth-field">
          <label>Mot de passe</label>
          <div class="auth-pwd-wrap">
            <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password">
            <button class="auth-pwd-toggle" type="button" onclick="togglePwd('login-password',this)">Afficher</button>
          </div>
        </div>
        <div class="auth-error" id="login-error"></div>
        <button class="auth-btn" id="btn-login" onclick="submitLogin()">Se connecter →</button>
        <p class="auth-hint">Pas encore de compte ? <span onclick="switchAuthTab('register')">Créer un compte</span></p>
      </div>

      <!-- ─── Inscription ─── -->
      <div id="form-register" class="auth-form" style="display:none">
        <div class="auth-grid-2">
          <div class="auth-field">
            <label>Prénom &amp; Nom *</label>
            <input type="text" id="reg-name" placeholder="Prénom Nom" autocomplete="name">
          </div>
          <div class="auth-field">
            <label>Téléphone</label>
            <input type="tel" id="reg-phone" placeholder="+33 6 00 00 00 00" autocomplete="tel">
          </div>
        </div>
        <div class="auth-field">
          <label>Email *</label>
          <input type="email" id="reg-email" placeholder="email@exemple.com" autocomplete="email">
        </div>
        <div class="auth-field">
          <label>Mot de passe * <span class="auth-label-hint">(8 caractères min.)</span></label>
          <div class="auth-pwd-wrap">
            <input type="password" id="reg-password" placeholder="••••••••" autocomplete="new-password">
            <button class="auth-pwd-toggle" type="button" onclick="togglePwd('reg-password',this)">Afficher</button>
          </div>
        </div>
        <div class="auth-field">
          <label>Confirmer le mot de passe *</label>
          <input type="password" id="reg-password2" placeholder="••••••••" autocomplete="new-password">
        </div>
        <div class="auth-error" id="register-error"></div>
        <button class="auth-btn" id="btn-register" onclick="submitRegister()">Créer mon compte →</button>
        <p class="auth-hint">Déjà un compte ? <span onclick="switchAuthTab('login')">Se connecter</span></p>
      </div>
    </div>
  `;

  const loginEmailInput = document.getElementById("login-email");
  if (loginEmailInput) loginEmailInput.focus();
}


function switchAuthTab(tab) {
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");
  document.getElementById("form-login").style.display    = tab === "login"    ? "block" : "none";
  document.getElementById("form-register").style.display = tab === "register" ? "block" : "none";
}

function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isText = input.type === "text";
  input.type = isText ? "password" : "text";
  btn.textContent = isText ? "Afficher" : "Masquer";
}

/* ── Connexion ── */
async function submitLogin() {
  const email    = document.getElementById("login-email")?.value.trim();
  const password = document.getElementById("login-password")?.value;
  const errEl    = document.getElementById("login-error");
  const btn      = document.getElementById("btn-login");

  if (!email || !password) { showAuthError(errEl, "Email et mot de passe requis"); return; }

  setAuthLoading(btn, true, "Se connecter →");
  try {
    const res  = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();

    // Compte non vérifié
    if (!res.ok && data.needsVerification) {
      showVerificationPending(data.email);
      return;
    }
    if (!res.ok) { showAuthError(errEl, data.error || "Identifiants incorrects"); return; }

    saveAuth(data.token, data.customer);
    prefillCheckout(data.customer);
    showToast("Bienvenue, " + data.customer.name.split(" ")[0] + " !");
    const intent = sessionStorage.getItem("yarai_auth_intent");
    sessionStorage.removeItem("yarai_auth_intent");
    navigate(intent === "checkout" ? "/checkout" : "/");
  } catch {
    showAuthError(errEl, "Erreur de connexion. Réessayez.");
  } finally {
    setAuthLoading(btn, false, "Se connecter →");
  }
}

/* ── Inscription ── */
async function submitRegister() {
  const name      = document.getElementById("reg-name")?.value.trim();
  const phone     = document.getElementById("reg-phone")?.value.trim();
  const email     = document.getElementById("reg-email")?.value.trim();
  const password  = document.getElementById("reg-password")?.value;
  const password2 = document.getElementById("reg-password2")?.value;
  const errEl     = document.getElementById("register-error");
  const btn       = document.getElementById("btn-register");

  if (!name || !email || !password) {
    showAuthError(errEl, "Veuillez remplir les champs obligatoires (*)"); return;
  }
  if (password.length < 8) {
    showAuthError(errEl, "Le mot de passe doit contenir au moins 8 caractères"); return;
  }
  if (password !== password2) {
    showAuthError(errEl, "Les mots de passe ne correspondent pas"); return;
  }

  setAuthLoading(btn, true, "Créer mon compte →");
  try {
    const res  = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) { showAuthError(errEl, data.error || "Erreur lors de la création du compte"); return; }

    // Le serveur demande une vérification email
    if (data.needsVerification) {
      showVerificationPending(data.email);
      return;
    }

    saveAuth(data.token, data.customer);
    prefillCheckout(data.customer);
    showToast("Compte créé ! Bienvenue, " + data.customer.name.split(" ")[0] + " !");
    const intent = sessionStorage.getItem("yarai_auth_intent");
    sessionStorage.removeItem("yarai_auth_intent");
    navigate(intent === "checkout" ? "/checkout" : "/");
  } catch {
    showAuthError(errEl, "Erreur de connexion. Réessayez.");
  } finally {
    setAuthLoading(btn, false, "Créer mon compte →");
  }
}

/* ── Écran "email envoyé" ── */
function showVerificationPending(email) {
  const container = document.getElementById("page-auth");
  if (!container) return;
  container.innerHTML = `
    <div class="auth-wrap auth-verify-wrap">
      <div class="auth-brand" onclick="navigate('/')">YARAÏ</div>
      <div class="auth-verify-icon">✉</div>
      <h2 class="auth-verify-title">Vérifiez votre email</h2>
      <p class="auth-verify-text">
        Un lien de confirmation a été envoyé à<br>
        <strong>${email}</strong><br><br>
        Cliquez sur le lien dans l'email pour activer votre compte.
        Le lien expire dans <strong>24 heures</strong>.
      </p>
      <div class="auth-verify-steps">
        <div class="auth-verify-step"><span>1</span>Ouvrez votre boîte mail</div>
        <div class="auth-verify-step"><span>2</span>Trouvez l'email de YARAÏ</div>
        <div class="auth-verify-step"><span>3</span>Cliquez sur "Vérifier mon adresse email"</div>
      </div>
      <div class="auth-resend-block">
        <p>Email non reçu ?</p>
        <button class="auth-resend-btn" id="resendBtn" onclick="resendVerification('${email}')">
          Renvoyer l'email
        </button>
      </div>
      <button class="auth-back-link" onclick="renderAuthPage()">← Retour à la connexion</button>
    </div>
  `;
}

/* ── Renvoi email de vérification ── */
async function resendVerification(email) {
  const btn = document.getElementById("resendBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Envoi en cours…"; }
  try {
    const res  = await fetch("/api/auth/resend", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    showToast(res.ok ? "Email renvoyé à " + email : (data.error || "Erreur lors du renvoi"));
  } catch {
    showToast("Erreur réseau. Réessayez.");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Renvoyer l'email"; }
  }
}

/* ── Vérification du token (route #/verify?token=xxx) ── */
async function handleVerifyToken() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const token  = params.get("token");
  const container = document.getElementById("page-auth");
  if (!container) return;

  if (!token) {
    container.innerHTML = `<div class="auth-wrap"><div class="auth-brand" onclick="navigate('/')">YARAÏ</div><p style="text-align:center;color:var(--muted);margin-top:24px">Lien invalide.</p><button class="auth-back-link" onclick="navigate('/auth')">← Retour</button></div>`;
    return;
  }

  container.innerHTML = `<div class="auth-wrap" style="text-align:center"><div class="auth-brand" onclick="navigate('/')">YARAÏ</div><p style="margin-top:32px;color:var(--muted)">Vérification en cours…</p></div>`;

  try {
    const res  = await fetch("/api/auth/verify?token=" + token);
    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = `
        <div class="auth-wrap auth-verify-wrap">
          <div class="auth-brand" onclick="navigate('/')">YARAÏ</div>
          <div class="auth-verify-icon" style="color:#c0392b">✕</div>
          <h2 class="auth-verify-title">Lien invalide</h2>
          <p class="auth-verify-text">${data.error || "Ce lien est invalide ou a expiré."}</p>
          <button class="auth-btn" style="margin-top:24px" onclick="navigate('/auth')">Retourner à la connexion</button>
        </div>`;
      return;
    }

    saveAuth(data.token, data.customer);
    prefillCheckout(data.customer);

    container.innerHTML = `
      <div class="auth-wrap auth-verify-wrap">
        <div class="auth-brand" onclick="navigate('/')">YARAÏ</div>
        <div class="auth-verify-icon" style="color:#27ae60">✓</div>
        <h2 class="auth-verify-title">Email vérifié !</h2>
        <p class="auth-verify-text">
          Bienvenue, <strong>${data.customer.name.split(" ")[0]}</strong>.<br>
          Votre compte YARAÏ est maintenant actif.
        </p>
        <button class="auth-btn" style="margin-top:24px" onclick="redirectAfterVerify()">
          Continuer →
        </button>
      </div>`;

    showToast("Compte vérifié — Bienvenue, " + data.customer.name.split(" ")[0] + " !");
  } catch {
    showToast("Erreur réseau. Réessayez.");
  }
}

function redirectAfterVerify() {
  const intent = sessionStorage.getItem("yarai_auth_intent");
  sessionStorage.removeItem("yarai_auth_intent");
  navigate(intent === "checkout" ? "/checkout" : "/");
}

/* ── Login : gestion compte non vérifié ── */
// (intégré dans submitLogin via data.needsVerification)

/* ── Pré-remplissage checkout ── */
function prefillCheckout(customer) {
  const map = {
    "co-name":    customer.name       || "",
    "co-email":   customer.email      || "",
    "co-phone":   customer.phone      || "",
    "co-address": customer.address    || "",
    "co-postal":  customer.postalCode || "",
    "co-city":    customer.city       || "",
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  if (customer.country) {
    const sel = document.getElementById("co-country");
    if (sel) sel.value = customer.country;
  }
}

/* ── Helpers ── */
function showAuthError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 5000);
}

function setAuthLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading ? "Chargement…" : label;
}

/* ── Entrée clavier (Enter pour soumettre) ── */
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const hash = window.location.hash;
  if (!hash.includes("/auth")) return;
  const loginVisible = document.getElementById("form-login")?.style.display !== "none";
  if (loginVisible) submitLogin();
  else submitRegister();
});

/* ── Init ── */
document.addEventListener("DOMContentLoaded", loadStoredAuth);

/* ══════════════════════════════════════════════════════════════
   PAGE COMPTE CLIENT
══════════════════════════════════════════════════════════════ */

const LOYALTY_TIERS = [
  { name: "Nouvelle cliente", min: 0,    color: "#6B6B6B" },
  { name: "Privilège",        min: 100,  color: "#C8A882" },
  { name: "Prestige",         min: 300,  color: "#9B7E5A" },
  { name: "Or",               min: 700,  color: "#C8A045" },
];

function getLoyaltyTier(pts) {
  let tier = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) { if (pts >= t.min) tier = t; }
  return tier;
}

function getNextTier(pts) {
  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
    if (pts < LOYALTY_TIERS[i].min) return LOYALTY_TIERS[i];
  }
  return null;
}

async function renderComptePage() {
  if (!currentUser) { navigate("/auth"); return; }
  const container = document.getElementById("page-compte");
  if (!container) return;

  container.innerHTML = `<div class="compte-loading">Chargement…</div>`;

  const [profileRes, ordersRes] = await Promise.all([
    fetch("/api/customer/me",     { headers: { Authorization: "Bearer " + getToken() } }),
    fetch("/api/customer/orders", { headers: { Authorization: "Bearer " + getToken() } }),
  ]);

  if (profileRes.status === 401) { clearAuth(); navigate("/auth"); return; }

  const profile = await profileRes.json();
  const orders  = ordersRes.ok ? await ordersRes.json() : [];

  const tier     = getLoyaltyTier(profile.loyaltyPoints);
  const nextTier = getNextTier(profile.loyaltyPoints);
  const ptsToNext = nextTier ? nextTier.min - profile.loyaltyPoints : 0;
  const progress   = nextTier
    ? Math.min(100, Math.round(((profile.loyaltyPoints - (tier.min)) / (nextTier.min - tier.min)) * 100))
    : 100;

  const joinDate = new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const birthVal = profile.birthdate ? new Date(profile.birthdate).toISOString().split("T")[0] : "";

  container.innerHTML = `
    <div class="compte-wrap">

      <!-- ─── En-tête ─── -->
      <div class="compte-header">
        <div class="compte-header-left">
          <div class="compte-avatar">${profile.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1 class="compte-name">${profile.name}</h1>
            <div class="compte-since">Membre depuis ${joinDate}</div>
          </div>
        </div>
        <div class="compte-tier-badge" style="color:${tier.color};border-color:${tier.color}">
          ${tier.name}
        </div>
      </div>

      <!-- ─── Tabs ─── -->
      <div class="compte-tabs">
        <button class="compte-tab active" id="ctab-infos"      onclick="switchCompteTab('infos')">Mes informations</button>
        <button class="compte-tab"        id="ctab-commandes"  onclick="switchCompteTab('commandes')">Commandes <span class="ctab-badge">${orders.length}</span></button>
        <button class="compte-tab"        id="ctab-fidelite"   onclick="switchCompteTab('fidelite')">Fidélité</button>
      </div>

      <!-- ─── INFOS ─── -->
      <div class="compte-panel active" id="cpanel-infos">
        <div class="compte-form-grid">
          <div class="compte-field">
            <label>Prénom &amp; Nom</label>
            <input type="text" id="cp-name" value="${esc(profile.name)}">
          </div>
          <div class="compte-field">
            <label>Email</label>
            <input type="email" id="cp-email" value="${esc(profile.email)}" disabled>
          </div>
          <div class="compte-field">
            <label>Téléphone</label>
            <input type="tel" id="cp-phone" value="${esc(profile.phone||"")}" placeholder="+33 6 00 00 00 00">
          </div>
          <div class="compte-field">
            <label>Date de naissance</label>
            <input type="date" id="cp-birthdate" value="${birthVal}">
          </div>
          <div class="compte-field compte-field-full">
            <label>Adresse</label>
            <div class="co-address-wrap">
              <input type="text" id="cp-address" autocomplete="off" value="${esc(profile.address||"")}" placeholder="Commencez à saisir votre adresse…">
              <div class="co-maps-hint" id="cp-maps-hint"></div>
            </div>
          </div>
          <div class="compte-field">
            <label>Code postal</label>
            <input type="text" id="cp-postal" value="${esc(profile.postalCode||"")}" placeholder="75001">
          </div>
          <div class="compte-field">
            <label>Ville</label>
            <input type="text" id="cp-city" value="${esc(profile.city||"")}" placeholder="Paris">
          </div>
          <div class="compte-field">
            <label>Pays</label>
            <select id="cp-country">
              ${buildCountryOptions(profile.country)}
            </select>
          </div>
        </div>
        <div class="compte-error" id="cp-error"></div>
        <button class="compte-btn" id="cp-save" onclick="saveProfile()">Enregistrer les modifications →</button>
      </div>

      <!-- ─── COMMANDES ─── -->
      <div class="compte-panel" id="cpanel-commandes">
        ${orders.length === 0
          ? `<div class="compte-empty"><div class="compte-empty-icon">◻</div><p>Aucune commande pour le moment</p><button class="compte-btn" onclick="navigate('/')">Découvrir nos jupes →</button></div>`
          : orders.map(o => renderOrderCard(o)).join("")
        }
      </div>

      <!-- ─── FIDÉLITÉ ─── -->
      <div class="compte-panel" id="cpanel-fidelite">
        <div class="loyalty-hero">
          <div class="loyalty-points">${profile.loyaltyPoints}</div>
          <div class="loyalty-points-label">points fidélité</div>
          <div class="loyalty-tier-name" style="color:${tier.color}">${tier.name}</div>
        </div>

        ${nextTier ? `
        <div class="loyalty-progress-wrap">
          <div class="loyalty-progress-track">
            <div class="loyalty-progress-bar" style="width:${progress}%;background:${tier.color}"></div>
          </div>
          <div class="loyalty-progress-labels">
            <span>${tier.name}</span>
            <span style="color:var(--muted)">encore ${ptsToNext} pts pour ${nextTier.name}</span>
          </div>
        </div>` : `<div class="loyalty-max">Vous avez atteint le niveau maximum — merci de votre fidélité ✦</div>`}

        <div class="loyalty-tiers">
          ${LOYALTY_TIERS.map(t => `
            <div class="loyalty-tier-card ${profile.loyaltyPoints >= t.min ? "reached" : ""}">
              <div class="loyalty-tier-dot" style="background:${profile.loyaltyPoints >= t.min ? t.color : "var(--border)"}"></div>
              <div>
                <div class="loyalty-tier-title" style="color:${profile.loyaltyPoints >= t.min ? t.color : "var(--muted)"}">${t.name}</div>
                <div class="loyalty-tier-sub">${t.min === 0 ? "Dès l'inscription" : "À partir de " + t.min + " points"}</div>
              </div>
            </div>`).join("")}
        </div>

        <div class="loyalty-how">
          <div class="loyalty-how-title">Comment gagner des points ?</div>
          <div class="loyalty-how-item"><span class="loyalty-how-icon">✦</span> 1 point par euro dépensé à chaque commande payée</div>
          <div class="loyalty-how-item"><span class="loyalty-how-icon">✦</span> Les points sont crédités automatiquement après paiement</div>
          <div class="loyalty-how-item"><span class="loyalty-how-icon">✦</span> Des avantages exclusifs à chaque palier (bientôt)</div>
        </div>
      </div>

    </div>
  `;

  // Init autocomplete après rendu du DOM
  if (typeof initAddressAutocomplete === "function") {
    initAddressAutocomplete("cp-address", ({ address, city, postalCode, country }) => {
      if (address)    setVal("cp-address", address);
      if (postalCode) setVal("cp-postal",  postalCode);
      if (city)       setVal("cp-city",    city);
      if (country)    setVal("cp-country", country);
    });
  }
}

function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

function renderOrderCard(o) {
  const statusMap = { PENDING:"En attente de paiement", PAID:"Payée", SHIPPED:"Expédiée", DELIVERED:"Livrée", CANCELLED:"Annulée" };
  const steps     = ["PAID","SHIPPED","DELIVERED"];
  const stepIdx   = steps.indexOf(o.status);
  const date      = new Date(o.createdAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
  const total     = Number(o.total).toLocaleString("fr-FR", { style:"currency", currency:"EUR", minimumFractionDigits:0 });

  const statusColor = { PENDING:"#6B6B6B", PAID:"#2D7A4F", SHIPPED:"#1D4ED8", DELIVERED:"#065F46", CANCELLED:"#991B1B" };

  const stepsHtml = o.status !== "CANCELLED" && o.status !== "PENDING" ? `
    <div class="order-steps">
      ${steps.map((s, i) => `
        <div class="order-step ${i <= stepIdx ? "done" : ""}">
          <div class="order-step-dot"></div>
          <div class="order-step-label">${{PAID:"Payée",SHIPPED:"Expédiée",DELIVERED:"Livrée"}[s]}</div>
        </div>
        ${i < steps.length-1 ? `<div class="order-step-line ${i < stepIdx ? "done" : ""}"></div>` : ""}
      `).join("")}
    </div>` : "";

  const trackHtml = o.trackingNumber
    ? `<div class="order-tracking">N° de suivi : <strong>${esc(o.trackingNumber)}</strong></div>` : "";

  return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <div class="order-ref">${esc(o.reference)}</div>
          <div class="order-date">${date}</div>
        </div>
        <div>
          <span class="order-status-badge" style="color:${statusColor[o.status]||"#6B6B6B"};border-color:${statusColor[o.status]||"#6B6B6B"}">${statusMap[o.status]||o.status}</span>
          <div class="order-total">${total}</div>
        </div>
      </div>
      ${stepsHtml}
      ${trackHtml}
      <div class="order-items-list">
        ${o.items.map(i => `<div class="order-item-row"><span>${esc(i.product?.name||i.productId)}</span><span class="order-item-meta">${esc(i.variant)} · ${esc(i.size)} · ×${i.qty}</span><span>${Number(i.price*i.qty).toLocaleString("fr-FR",{style:"currency",currency:"EUR",minimumFractionDigits:0})}</span></div>`).join("")}
      </div>
    </div>`;
}

function switchCompteTab(tab) {
  document.querySelectorAll(".compte-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".compte-panel").forEach(p => p.classList.remove("active"));
  document.getElementById("ctab-"   + tab).classList.add("active");
  document.getElementById("cpanel-" + tab).classList.add("active");
}

async function saveProfile() {
  const btn   = document.getElementById("cp-save");
  const errEl = document.getElementById("cp-error");
  errEl.textContent = "";

  const body = {
    name:       document.getElementById("cp-name")?.value.trim(),
    phone:      document.getElementById("cp-phone")?.value.trim(),
    address:    document.getElementById("cp-address")?.value.trim(),
    postalCode: document.getElementById("cp-postal")?.value.trim(),
    city:       document.getElementById("cp-city")?.value.trim(),
    country:    document.getElementById("cp-country")?.value,
    birthdate:  document.getElementById("cp-birthdate")?.value || null,
  };

  if (!body.name) { errEl.textContent = "Le nom est requis."; return; }

  btn.disabled = true; btn.textContent = "Enregistrement…";
  try {
    const res  = await fetch("/api/customer/profile", {
      method:  "PATCH",
      headers: { "Content-Type":"application/json", Authorization:"Bearer " + getToken() },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || "Erreur serveur."; return; }
    currentUser = { ...currentUser, ...data };
    localStorage.setItem("yarai_customer_data", JSON.stringify(currentUser));
    updateNavUser();
    showToast("Profil mis à jour ✓");
  } catch {
    errEl.textContent = "Erreur réseau. Réessayez.";
  } finally {
    btn.disabled = false; btn.textContent = "Enregistrer les modifications →";
  }
}

function buildCountryOptions(selected) {
  const countries = [
    ["","Choisir un pays"],
    ["FR","France"],["BE","Belgique"],["CH","Suisse"],["LU","Luxembourg"],
    ["CA","Canada"],["MA","Maroc"],["TN","Tunisie"],["DZ","Algérie"],
    ["SN","Sénégal"],["CI","Côte d'Ivoire"],["CM","Cameroun"],["ML","Mali"],
    ["GN","Guinée"],["BF","Burkina Faso"],["NG","Nigeria"],
    ["GB","Royaume-Uni"],["DE","Allemagne"],["ES","Espagne"],["IT","Italie"],
    ["US","États-Unis"],["OTHER","Autre"],
  ];
  return countries.map(([val, label]) =>
    `<option value="${val}" ${val===selected?"selected":""}>${label}</option>`
  ).join("");
}

function esc(str) {
  return String(str||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
