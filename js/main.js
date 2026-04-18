/* ══════════════════════════════════════════════════════════════
   YARAÏ — CATALOGUE PRODUITS
   ➜ Modifiez uniquement cette section pour gérer vos produits
══════════════════════════════════════════════════════════════ */

const CATALOGUE = [

  /* ── PRODUIT 1 ── */
  {
    id: "naya-imprime-orange",
    name: "Naya Imprimé",
    cat: "ensemble",
    price: 28500,
    badge: "Nouveau",
    badgeColor: "terra",
    sizes: ["XS", "S", "M", "L"],
    desc: "Ensemble asymétrique en tissu imprimé de motifs calligraphiques. Top à épaule unique avec anneau doré, pantalon large fluide. Un look éditorial, entre tradition et modernité.",
    details: { Matière: "100% Viscose", Origine: "Fait au Sénégal", Entretien: "Lavage à la main", Livraison: "5–7 jours" },
    variants: [
      { label: "Terracotta imprimé", image: "assets/naya.png" },
      { label: "Sable imprimé",      image: "assets/naya_imprim_marrontope.png" },
    ]
  },

     /* ── PRODUIT 2 ── */
  {
    id: "skirt-alya",
    name: "Jupe Alya",
    cat: "jupe",
    price: 12000,
    badge: "Limité",
    badgeColor: "deep",
    sizes: ["S", "M", "L"],
    desc: "Jupe longue asymétrique, esprit côtier et estival. Tombé parfait, Légère et fluide, elle se porte aussi bien en journée qu'en soirée",
    details: { Matière: "Coton ", Origine: "Fait au Sénégal", Entretien: "Lavage à la main", Livraison: "5–7 jours" },
    variants: [
      { label: "Jaune", image: "assets/alya_jaune.png" },
      { label: "Bleu", image: "assets/alya_blue.png" },
      { label: "Terracotta", image: "assets/alya_terracotta.png" },
    ]
  },


  /* ── PRODUIT 3 ── */
  {
    id: "luma",
    name: "Luma",
    cat: "ensemble",
    price: 26000,
    badge: "Limité",
    badgeColor: "deep",
    sizes: ["S", "M", "L"],
    desc: "L'ensemble Luma se distingue par son col drapé enveloppant et son pantalon palazzo à plis. Une pièce architecturale pour femme qui aime affirmer son style.",
    details: { Matière: "Lin & Coton", Origine: "Fait au Sénégal", Entretien: "Lavage à froid", Livraison: "5–7 jours" },
    variants: [
      { label: "Vert",   image: "assets/luma_vert.png" },
      { label: "Marron", image: "assets/luma_marron.png" },
      { label: "Noir",   image: "assets/luma_noir.png" },
    ]
  },

  /* ── PRODUIT 4 ── */
  {
    id: "skirt-solea",
    name: "Jupe Solea",
    cat: "jupe",
    price: 13000,
    badge: "",
    badgeColor: "deep",
    sizes: ["S", "M", "L"],
    desc: "Jupe longue paysanne à taille haute. Tombé parfait, coupe flatteuse qui met en valeur les hanches. Déclinaison en trois coloris intemporels.",
    details: { Matière: "Coton", Origine: "Fait au Sénégal", Entretien: "Lavage délicat", Livraison: "5–7 jours" },
    variants: [
      { label: "Noir",   image: "assets/solea_noir.png" },
      { label: "Marron", image: "assets/solea_marron.png" },
      { label: "Blanc",  image: "assets/solea_blanc.png" },
    ]
  },


  /* ── PRODUIT 5 ── */
  {
    id: "skirt-azura",
    name: "Jupe Azura",
    cat: "jupe",
    price: 13000,
    badge: "Limité",
    badgeColor: "deep",
    sizes: ["S", "M", "L"],
    desc: "Jupe mi-longue aux rayures graphiques, esprit côtier et estival. Légère et fluide, elle se porte aussi bien en journée qu'en soirée.",
    details: { Matière: "Coton tissé", Origine: "Fait au Sénégal", Entretien: "Lavage à la main", Livraison: "5–7 jours" },
    variants: [
      { label: "Rayure Blue", image: "assets/azura.png" },
      { label: "Blanc",       image: "assets/azura_blanc.png" },
    ]
  },

  /* ── PRODUIT 1bis ── */
  {
    id: "naya-marron",
    name: "Naya Uni",
    cat: "ensemble",
    price: 26000,
    badge: "Best-seller",
    badgeColor: "gold",
    sizes: ["S", "M", "L"],
    desc: "La version uni du best-seller Naya. Même silhouette sculpturale, même drapé généreux — dans un coloris épuré qui se porte partout.",
    details: { Matière: "100% Viscose", Origine: "Fait au Sénégal", Entretien: "Lavage à la main", Livraison: "5–7 jours" },
    variants: [
      { label: "Vert uni",   image: "assets/naya_vert.jpg" },
      { label: "Marron uni", image: "assets/Naya_marron.png" },
    ]
  },

  /* ── PRODUIT 6 ── */
  {
    id: "skirt-safia",
    name: "Jupe Safia",
    cat: "jupe",
    price: 15000,
    badge: "Limité",
    badgeColor: "deep",
    sizes: ["S", "M", "L"],
    desc: "Jupe longue à multi-volants qui crée du mouvement à chaque pas, esprit côtier et estival. Légère et fluide, elle se porte aussi bien en journée qu'en soirée.",
    details: { Matière: "Coton tissé", Origine: "Fait au Sénégal", Entretien: "Lavage à la main", Livraison: "5–7 jours" },
    variants: [
      { label: "Imprimé",  image: "assets/safia.png" },
      { label: "Imprimé 2", image: "assets/safia_1.png" },
    ]
  },

   /* ── PRODUIT 7 ── */
  {
    id: "skirt-mira",
    name: "Jupe Mira",
    cat: "jupe",
    price: 10000,
    badge: "Limité",
    badgeColor: "deep",
    sizes: ["S", "M", "L"],
    desc: "Jupe longue sirène, esprit côtier et estival. Tombé parfait, coupe moulante qui met en valeur les hanches.",
    details: { Matière: "Coton tissé", Origine: "Fait au Sénégal", Entretien: "Lavage à la main", Livraison: "5–7 jours" },
    variants: [
      { label: "Marron", image: "assets/mira_marron.png" },
      { label: "Noir", image: "assets/mira_noir.png" },
      { label: "Leopard", image: "assets/mira_leopard.png" },
    ]
  },

  
];

/* ══════════════════════════════════════════════════════════════
   NE PAS MODIFIER EN DESSOUS (sauf si vous savez ce que vous faites)
══════════════════════════════════════════════════════════════ */

/* ── Helpers ── */
const catLabel = cat => ({ ensemble:"Ensemble 2 pièces", top:"Top", pantalon:"Pantalon", jupe:"Jupe", robe:"Robe longue" }[cat] || cat);
const badgeColors = { terra:"#C4704A", gold:"#B8933E", deep:"#261A12" };
const fmt = n => parseInt(n,10).toLocaleString("fr") + " FCFA";

/* ══════════════════════════════════════════════════════════════
   ROUTEUR SPA (hash-based)
══════════════════════════════════════════════════════════════ */
function navigate(path) {
  window.location.hash = path;
}

function handleRoute() {
  const hash = window.location.hash.replace("#","") || "/";
  const pages = ["page-home","page-produit","page-checkout","page-confirmation"];
  pages.forEach(p => document.getElementById(p)?.classList.remove("active"));

  const nav = document.getElementById("navbar");

  if (hash.startsWith("/produit/")) {
    const id = hash.replace("/produit/","");
    document.getElementById("page-produit").classList.add("active");
    nav.className = "scrolled";
    renderPDP(id);
    window.scrollTo(0,0);
  } else if (hash === "/checkout") {
    document.getElementById("page-checkout").classList.add("active");
    nav.className = "scrolled";
    renderCheckout();
    window.scrollTo(0,0);
  } else if (hash === "/confirmation") {
    document.getElementById("page-confirmation").classList.add("active");
    nav.className = "scrolled";
    window.scrollTo(0,0);
  } else {
    document.getElementById("page-home").classList.add("active");
    nav.className = window.scrollY > 50 ? "scrolled" : "";
    window.scrollTo(0,0);
  }
}

window.addEventListener("hashchange", handleRoute);
window.addEventListener("scroll", () => {
  const hash = window.location.hash.replace("#","") || "/";
  if (!hash || hash === "/") {
    document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 50);
  }
});

/* ══════════════════════════════════════════════════════════════
   CATALOGUE — rendu grille accueil
══════════════════════════════════════════════════════════════ */
function renderCatalogue(filter = "all") {
  const grid = document.getElementById("productsGrid");
  const filtered = filter === "all" ? CATALOGUE : CATALOGUE.filter(p => p.cat === filter);

  grid.innerHTML = filtered.map((p, i) => {
    const v = p.variants[0];
    const badgeStyle = p.badge ? `style="background:${badgeColors[p.badgeColor]||'#C4704A'}"` : "";
    return `
    <div class="product-card reveal" data-cat="${p.cat}" data-id="${p.id}" style="animation-delay:${i*80}ms" onclick="navigate('/produit/${p.id}')">
      <div class="product-visual">
        ${p.badge ? `<div class="product-label-top" ${badgeStyle}>${p.badge}</div>` : ""}
        <button class="product-wishlist" onclick="event.stopPropagation();toggleWish(this)" aria-label="Favori">🤍</button>
        <img src="${v.image}" alt="${p.name}" class="product-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="product-img-fallback" style="display:none"><span>📷</span><small>Bientôt disponible</small></div>
        <div class="product-overlay">
          <button class="btn-cart" onclick="event.stopPropagation();quickAddToCart('${p.id}')">+ Ajouter au panier</button>
        </div>
      </div>
      ${p.variants.length > 1 ? `
      <div class="variant-strip">
        ${p.variants.map((vt,vi) => `<button class="variant-btn ${vi===0?'active':''}" title="${vt.label}" onclick="event.stopPropagation();switchCardVariant(this,'${p.id}',${vi})"></button>`).join("")}
      </div>` : ""}
      <div class="product-info">
        <div class="product-cat">${catLabel(p.cat)}</div>
        <div class="product-name">${p.name}</div>
        <div class="variant-label" id="vlabel-${p.id}">${v.label}</div>
        <div class="product-footer">
          <div class="product-price">${fmt(p.price)}</div>
          <div class="product-sizes">${p.sizes.map(s=>`<div class="size-dot">${s}</div>`).join("")}</div>
        </div>
      </div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".product-card.reveal").forEach((el,i) => {
    setTimeout(() => el.classList.add("visible"), 100 + i*60);
  });
}

function switchCardVariant(btn, id, vi) {
  const p = CATALOGUE.find(x => x.id === id);
  if (!p) return;
  const v = p.variants[vi];
  const card = btn.closest(".product-card");
  const img = card.querySelector(".product-img");
  if (img) { img.src = v.image; img.style.display=""; }
  card.querySelectorAll(".variant-btn").forEach((b,i) => b.classList.toggle("active", i===vi));
  const lbl = document.getElementById("vlabel-"+id);
  if (lbl) lbl.textContent = v.label;
}

function filterProducts(cat, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderCatalogue(cat);
}

function quickAddToCart(id) {
  const p = CATALOGUE.find(x => x.id === id);
  if (!p) return;
  const v = p.variants[0];
  addToCart({ product:p, variant:v, size:p.sizes[0], qty:1 });
  showToast("✓ Ajouté — " + p.name);
}

/* ══════════════════════════════════════════════════════════════
   PAGE DÉTAIL PRODUIT (PDP)
══════════════════════════════════════════════════════════════ */
let pdpState = { variantIdx:0, sizeIdx:null, wished:false };

function renderPDP(id) {
  const p = CATALOGUE.find(x => x.id === id);
  const container = document.getElementById("page-produit");
  if (!p) { container.innerHTML = `<div style="padding:120px 60px;font-size:20px;color:var(--muted)">Produit introuvable. <button onclick="navigate('/')" class="btn-primary" style="margin-left:16px">Retour</button></div>`; return; }

  pdpState = { variantIdx:0, sizeIdx:null, wished:false, productId:id };
  const v = p.variants[0];

  container.innerHTML = `
    <button class="pdp-back" onclick="navigate('/')">Retour à la collection</button>

    <div class="pdp-layout">
      <!-- GALERIE -->
      <div class="pdp-gallery">
        <div class="pdp-main-wrap">
          <img src="${v.image}" alt="${p.name}" class="pdp-main-photo" id="pdpMainPhoto"
               onerror="this.style.display='none';document.getElementById('pdpFallback').style.display='flex'">
          <div class="pdp-fallback-photo" id="pdpFallback" style="display:none">
            <span>📷</span><small>Photo bientôt disponible</small>
          </div>
        </div>
        ${p.variants.length > 1 ? `
        <div class="pdp-thumbs-row" id="pdpThumbs">
          ${p.variants.map((vt,vi) => `
            <img src="${vt.image}" alt="${vt.label}"
              class="pdp-thumb ${vi===0?'active':''}"
              onclick="pdpSelectVariant(${vi})"
              onerror="this.style.display='none'"
            >
          `).join("")}
        </div>` : ""}
      </div>

      <!-- INFOS -->
      <div class="pdp-info-col">
        <div class="pdp-eyebrow">${catLabel(p.cat)}</div>
        <h1 class="pdp-name">${p.name}</h1>
        <div class="pdp-price">${fmt(p.price)}</div>
        <div class="pdp-price-sub">Livraison offerte à partir de 50 000 FCFA</div>

        <div class="pdp-sep"></div>

        <!-- Variantes -->
        ${p.variants.length > 1 ? `
        <div class="pdp-section-label">Coloris — <span id="pdpVLabel" style="color:var(--terra)">${v.label}</span></div>
        <div class="pdp-variants-grid" id="pdpVariantsGrid">
          ${p.variants.map((vt,vi) => `
            <div class="pdp-variant-item ${vi===0?'active':''}" onclick="pdpSelectVariant(${vi})">
              <img src="${vt.image}" alt="${vt.label}" class="pdp-variant-img"
                onerror="this.style.display='none'">
              <span class="pdp-variant-name">${vt.label}</span>
            </div>
          `).join("")}
        </div>` : `<div style="font-size:13px;color:var(--terra);margin-bottom:20px">${v.label}</div>`}

        <!-- Tailles -->
        <div class="pdp-section-label" style="margin-top:4px">Taille</div>
        <div class="pdp-sizes-row" id="pdpSizesRow">
          ${p.sizes.map((s,si) => `<button class="pdp-size-btn" onclick="pdpSelectSize(${si},this)">${s}</button>`).join("")}
        </div>
        <div class="pdp-size-alert" id="pdpSizeAlert">↑ Veuillez sélectionner une taille</div>

        <div class="pdp-sep"></div>

        <!-- Description -->
        <p class="pdp-desc">${p.desc || ""}</p>

        <!-- Détails -->
        <div class="pdp-details">
          ${Object.entries(p.details||{}).map(([k,val]) => `
            <div class="pdp-detail-row">
              <span class="pdp-detail-key">${k}</span>
              <span class="pdp-detail-val">${val}</span>
            </div>
          `).join("")}
        </div>

        <!-- Actions -->
        <div class="pdp-actions">
          <button class="pdp-btn-add" onclick="pdpAddToCart('${id}')">+ Ajouter au panier</button>
          <button class="pdp-btn-wish" id="pdpWishBtn" onclick="pdpToggleWish()">🤍 Ajouter aux favoris</button>
        </div>
      </div>
    </div>

    <!-- PRODUITS SIMILAIRES -->
    <div class="pdp-related">
      <h2>Vous aimerez aussi <em>peut-être</em></h2>
      <div class="related-grid">
        ${CATALOGUE.filter(x => x.id !== id).slice(0,4).map(rp => {
          const rv = rp.variants[0];
          return `
          <div class="product-card" onclick="navigate('/produit/${rp.id}')">
            <div class="product-visual" style="height:280px">
              <img src="${rv.image}" alt="${rp.name}" class="product-img" onerror="this.style.display='none'">
              <div class="product-img-fallback" style="display:none;font-size:24px">📷</div>
            </div>
            <div class="product-info">
              <div class="product-cat">${catLabel(rp.cat)}</div>
              <div class="product-name">${rp.name}</div>
              <div class="product-footer"><div class="product-price">${fmt(rp.price)}</div></div>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

function pdpSelectVariant(vi) {
  const p = CATALOGUE.find(x => x.id === pdpState.productId);
  if (!p) return;
  pdpState.variantIdx = vi;
  const v = p.variants[vi];

  // Photo principale
  const mainPhoto = document.getElementById("pdpMainPhoto");
  if (mainPhoto) {
    mainPhoto.classList.add("switching");
    setTimeout(() => {
      mainPhoto.src = v.image;
      mainPhoto.classList.remove("switching");
      mainPhoto.style.display = "";
      document.getElementById("pdpFallback").style.display = "none";
    }, 200);
  }

  // Label coloris
  const lbl = document.getElementById("pdpVLabel");
  if (lbl) lbl.textContent = v.label;

  // Activer vignette et variante
  document.querySelectorAll(".pdp-thumb").forEach((t,i) => t.classList.toggle("active", i===vi));
  document.querySelectorAll(".pdp-variant-item").forEach((d,i) => d.classList.toggle("active", i===vi));
}

function pdpSelectSize(si, btn) {
  pdpState.sizeIdx = si;
  document.querySelectorAll(".pdp-size-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("pdpSizeAlert").classList.remove("show");
}

function pdpAddToCart(id) {
  if (pdpState.sizeIdx === null) {
    document.getElementById("pdpSizeAlert").classList.add("show");
    document.getElementById("pdpSizesRow").scrollIntoView({ behavior:"smooth", block:"center" });
    return;
  }
  const p = CATALOGUE.find(x => x.id === id);
  if (!p) return;
  const v = p.variants[pdpState.variantIdx];
  const size = p.sizes[pdpState.sizeIdx];
  addToCart({ product:p, variant:v, size, qty:1 });
  showToast("✓ Ajouté — " + p.name + " / " + size);
}

function pdpToggleWish() {
  pdpState.wished = !pdpState.wished;
  const btn = document.getElementById("pdpWishBtn");
  if (btn) {
    btn.textContent = pdpState.wished ? "❤️ Ajouté aux favoris" : "🤍 Ajouter aux favoris";
    btn.classList.toggle("active", pdpState.wished);
    if (pdpState.wished) showToast("💕 Ajouté à vos favoris");
  }
}

/* ══════════════════════════════════════════════════════════════
   PANIER — avec badge et miniatures
══════════════════════════════════════════════════════════════ */
let cart = [];

function toggleCart() {
  document.getElementById("cartDrawer").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("open");
}

function addToCart({ product, variant, size, qty=1 }) {
  const key = `${product.id}|${variant.label}|${size}`;
  const existing = cart.find(c => c.key === key);
  if (existing) { existing.qty += qty; }
  else { cart.push({ key, product, variant, size, qty }); }
  renderCart();
}

function removeFromCart(key) {
  cart = cart.filter(c => c.key !== key);
  renderCart();
}

function changeQty(key, delta) {
  const item = cart.find(c => c.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.key !== key);
  renderCart();
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalQty    = cart.reduce((a,c) => a + c.qty, 0);
  const totalAmount = cart.reduce((a,c) => a + c.product.price * c.qty, 0);

  // Badges
  document.querySelectorAll(".cart-badge").forEach(b => {
    b.textContent = totalQty;
    b.classList.toggle("show", totalQty > 0);
  });

  if (totalEl) totalEl.textContent = fmt(totalAmount);
  if (subtotalEl) subtotalEl.textContent = fmt(totalAmount);

  // Header count
  const countLbl = document.getElementById("cartCountLabel");
  if (countLbl) countLbl.textContent = totalQty > 0 ? `(${totalQty} article${totalQty>1?"s":""})` : "";

  if (!itemsEl) return;
  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><div style="font-size:48px;margin-bottom:16px">🛍️</div>Votre panier est vide.<br><br><button class="btn-primary" onclick="toggleCart();navigate('/')" style="font-size:10px;padding:12px 24px">Découvrir la collection</button></div>`;
    return;
  }
  itemsEl.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="${c.variant.image}" alt="${c.product.name}" class="cart-item-img"
           onerror="this.style.display='none'">
      <div class="cart-item-body">
        <div class="cart-item-name">${c.product.name}</div>
        <div class="cart-item-meta">${c.variant.label} · Taille ${c.size}</div>
        <div class="cart-item-price">${fmt(c.product.price * c.qty)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${c.key}',-1)">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" onclick="changeQty('${c.key}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${c.key}')">✕</button>
    </div>
  `).join("");
}

function goToCheckout() {
  if (cart.length === 0) { showToast("Votre panier est vide !"); return; }
  toggleCart();
  navigate("/checkout");
}

/* ══════════════════════════════════════════════════════════════
   PAGE CHECKOUT — rendu
══════════════════════════════════════════════════════════════ */
let selectedPayMethod = null;

function renderCheckout() {
  if (cart.length === 0) { navigate("/"); return; }
  const totalAmount = cart.reduce((a,c) => a + c.product.price * c.qty, 0);

  // Récap sidebar
  const recapEl = document.getElementById("recapItems");
  if (recapEl) {
    recapEl.innerHTML = cart.map(c => `
      <div class="recap-item">
        <img src="${c.variant.image}" alt="${c.product.name}" class="recap-item-img"
             onerror="this.style.background='var(--blush)'">
        <div>
          <div class="recap-item-name">${c.product.name}</div>
          <div class="recap-item-meta">${c.variant.label} · ${c.size} · ×${c.qty}</div>
        </div>
        <div class="recap-item-price">${fmt(c.product.price * c.qty)}</div>
      </div>`).join("");
  }
  document.querySelectorAll(".recap-total-amount").forEach(el => el.textContent = fmt(totalAmount));
}

function selectPayMethod(method, btn) {
  selectedPayMethod = method;
  document.querySelectorAll(".pay-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  ["card-fields","wave-fields","orange-fields","wallet-fields"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const show = { card:"card-fields", wave:"wave-fields", orange:"orange-fields", wallet:"wallet-fields" }[method];
  if (show) document.getElementById(show).style.display = "block";
  updateCheckoutStep(2);
}

function updateCheckoutStep(step) {
  [1,2,3].forEach(i => {
    const circle = document.getElementById(`cstep${i}`);
    const label  = document.getElementById(`csteplabel${i}`);
    if (!circle) return;
    circle.className = "co-step-circle" + (i < step ? " done" : i===step ? " active" : "");
    if (label) label.className = "co-step-label" + (i===step ? " active" : "");
  });
}

function validateAndPay() {
  const name  = document.getElementById("co-name")?.value.trim();
  const email = document.getElementById("co-email")?.value.trim();
  const phone = document.getElementById("co-phone")?.value.trim();
  if (!name)  { showToast("Entrez votre nom complet"); return; }
  if (!email || !email.includes("@")) { showToast("Email invalide"); return; }
  if (!phone) { showToast("Entrez votre numéro de téléphone"); return; }
  if (!selectedPayMethod) { showToast("Choisissez un mode de paiement"); return; }

  const totalAmount = cart.reduce((a,c) => a + c.product.price * c.qty, 0);

  if (selectedPayMethod === "card") {
    processStripePayment(totalAmount, name, email);
  } else if (selectedPayMethod === "wave") {
    processWavePayDunya(totalAmount, name, email, phone);
  } else if (selectedPayMethod === "orange") {
    processOrangePayDunya(totalAmount, name, email, phone);
  } else if (selectedPayMethod === "wallet") {
    showToast("Redirection vers le paiement…");
    processStripePayment(totalAmount, name, email);
  }
}

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

/* ══════════════════════════════════════════════════════════════
   WISHLIST rapide
══════════════════════════════════════════════════════════════ */
function toggleWish(btn) {
  const w = btn.textContent === "❤️";
  btn.textContent = w ? "🤍" : "❤️";
  if (!w) showToast("💕 Ajouté à vos favoris");
}

/* ══════════════════════════════════════════════════════════════
   NAV MOBILE
══════════════════════════════════════════════════════════════ */
let menuOpen = false;
function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById("navbar").classList.toggle("nav-mobile-open", menuOpen);
}

/* ══════════════════════════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════════════════════════ */
function subscribe() {
  const input = document.getElementById("emailInput");
  if (!input) return;
  if (!input.value.trim().includes("@")) { showToast("Entrez un email valide"); return; }
  input.value = "";
  showToast("🌸 Inscrite à la newsletter YARAÏ !");
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e,i) => {
      if (e.isIntersecting) setTimeout(() => e.target.classList.add("visible"), i*80);
    });
  }, { threshold:.1 });
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  renderCatalogue();
  renderCart();
  handleRoute();
  initReveal();
});
