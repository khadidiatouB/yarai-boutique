/* ══════════════════════════════════════════════════════════════
   YARAÏ — CATALOGUE PRODUITS
   ➜ Modifiez uniquement cette section pour gérer vos produits
══════════════════════════════════════════════════════════════ */

const CATALOGUE = [

  /* ── 1 · Jupe Évasée Denim ── */
  {
    id: "jupe-evasee-denim",
    name: "Jupe Évasée Denim",
    cat: "jeans",
    coupe: "Évasée",
    price: 69,
    badge: "",
    sizes: ["XS","S","M","L","XL"],
    variants: [
      { label: "Bleu indigo",  image: "assets/alya_blue.png",       color: "#2B4F8C" },
      { label: "Terracotta",   image: "assets/alya_terracotta.png",  color: "#C4704A" },
      { label: "Soleil",       image: "assets/alya_jaune.png",       color: "#E8C547" },
    ],
    desc: "Une jupe évasée en denim premium qui allie structure et fluidité. La coupe légèrement évasée depuis les hanches offre un tombé élégant, pièce à pièce pensée pour toutes les silhouettes.",
    details: { Matière: "98% Coton, 2% Élasthanne", Longueur: "Midi (env. 70 cm)", Coupe: "Évasée", Livraison: "5–10 jours ouvrés" }
  },

  /* ── 2 · Jupe Droite Jean ── */
  {
    id: "jupe-droite-jean",
    name: "Jupe Droite Jean",
    cat: "jeans",
    coupe: "Droite",
    price: 59,
    badge: "Nouveau",
    sizes: ["XS","S","M","L","XL"],
    variants: [
      { label: "Noir délavé",  image: "assets/mira_noir.png",    color: "#2D2D2D" },
      { label: "Marron tabac", image: "assets/mira_marron.png",  color: "#7A4830" },
    ],
    desc: "La jupe droite, pièce intemporelle réinventée en denim structuré. Coupe nette, longueur midi — une allure sobre et moderne du matin au soir.",
    details: { Matière: "100% Coton", Longueur: "Midi (env. 68 cm)", Coupe: "Droite", Livraison: "5–10 jours ouvrés" }
  },

  /* ── 3 · Jupe Trapèze Rayée ── */
  {
    id: "jupe-trapeze-rayee",
    name: "Jupe Rayée Trapèze",
    cat: "coton-raye",
    coupe: "Trapèze",
    price: 49,
    badge: "",
    sizes: ["XS","S","M","L","XL"],
    variants: [
      { label: "Rayure marine", image: "assets/azura.png",       color: "#1B3A6B" },
      { label: "Blanc optique", image: "assets/azura_blanc.png", color: "#F0EDE8" },
    ],
    desc: "Légère et graphique, cette jupe trapèze en coton rayé capture l'essence de l'été. Des rayures précises, une coupe trapèze qui libère chaque mouvement.",
    details: { Matière: "100% Coton tissé", Longueur: "Mi-longue (env. 72 cm)", Coupe: "Trapèze", Livraison: "5–10 jours ouvrés" }
  },

  /* ── 4 · Jupe Paysanne Coton ── */
  {
    id: "jupe-paysanne-coton",
    name: "Jupe Paysanne Coton",
    cat: "coton-uni",
    coupe: "Paysanne",
    price: 55,
    badge: "Best-seller",
    sizes: ["XS","S","M","L","XL"],
    variants: [
      { label: "Noir",   image: "assets/solea_noir.png",   color: "#1A1A1A" },
      { label: "Écru",   image: "assets/solea_blanc.png",  color: "#F0EDE0" },
      { label: "Marron", image: "assets/solea_marron.png", color: "#7A4830" },
    ],
    desc: "Taille haute, coupe paysanne ample : cette jupe en coton uni épuré sublime toutes les morphologies. Un essentiel de garde-robe à décliner à l'infini.",
    details: { Matière: "100% Coton", Longueur: "Longue (env. 90 cm)", Coupe: "Paysanne", Livraison: "5–10 jours ouvrés" }
  },

  /* ── 5 · Jupe Longue Imprimée ── */
  {
    id: "jupe-imprimee-volants",
    name: "Jupe Longue Imprimée",
    cat: "imprime",
    coupe: "Multi-volant",
    price: 65,
    badge: "",
    sizes: ["XS","S","M","L","XL"],
    variants: [
      { label: "Imprimé fleuri",    image: "assets/safia.png",   color: "#C8956A" },
      { label: "Imprimé graphique", image: "assets/safia_1.png", color: "#8B7355" },
    ],
    desc: "Chaque volant révèle une nouvelle dimension du mouvement. Cette jupe longue imprimée habille avec grâce et se distingue à chaque foulée.",
    details: { Matière: "100% Coton tissé", Longueur: "Longue (env. 100 cm)", Coupe: "Multi-volant", Livraison: "5–10 jours ouvrés" }
  },

  /* ── 6 · Jupe Midi Satin ── */
  {
    id: "jupe-satin-sirene",
    name: "Jupe Midi Satin",
    cat: "satin",
    coupe: "Sirène",
    price: 79,
    badge: "",
    sizes: ["XS","S","M","L","XL"],
    variants: [
      { label: "Noir",    image: "assets/mira_noir.png",    color: "#1A1A1A" },
      { label: "Marron",  image: "assets/mira_marron.png",  color: "#7A4830" },
      { label: "Léopard", image: "assets/mira_leopard.png", color: "#C8A062" },
    ],
    desc: "Silhouette moulante, tombé soyeux : cette jupe satin à coupe sirène est pensée pour les femmes qui aiment affirmer leur présence en toute élégance.",
    details: { Matière: "95% Polyester satiné, 5% Élasthanne", Longueur: "Midi (env. 75 cm)", Coupe: "Sirène", Livraison: "5–10 jours ouvrés" }
  },

  /* ── 7 · Jupe à Pois ── */
  {
    id: "jupe-a-pois",
    name: "Jupe à Pois",
    cat: "imprime",
    coupe: "Évasée",
    price: 59,
    badge: "Nouveau",
    sizes: ["XS","S","M","L","XL"],
    variants: [
      { label: "Beige pois noir", image: "assets/jupe_a_pois_beige.png",  color: "#D4C5A9" },
      { label: "Blanc pois noir", image: "assets/jupe_a_pois_blanc.png",  color: "#F4F0EA" },
    ],
    extraImages: {
      "Beige pois noir": ["assets/jupe_a_pois_beige.png", "assets/jupe_a_pois_beige1.png"],
      "Blanc pois noir": ["assets/jupe_a_pois_blanc.png", "assets/jupe_a_pois_blanc1.png"],
    },
    desc: "Légèreté et caractère : cette jupe évasée à pois en coton imprimé joue la carte du classique revisité. Le motif pois intemporel se décline en deux coloris élégants pour une allure chic et accessible.",
    details: { Matière: "100% Coton imprimé", Longueur: "Midi (env. 72 cm)", Coupe: "Évasée", Livraison: "5–10 jours ouvrés" }
  },

  /* ── 8 · Jupe Rayée Nouée ── */
  {
    id: "jupe-rayee-noeud",
    name: "Jupe Rayée Nouée",
    cat: "coton-raye",
    coupe: "Asymétrique nouée",
    price: 65,
    badge: "Nouveau",
    sizes: ["XS","S","M","L","XL"],
    variants: [
      { label: "Rayure marine", image: "assets/jupe_rayure_noeud.png",   color: "#2C4F8A" },
      { label: "Rayure blanc",  image: "assets/jupe_rayure_noeud_1.png", color: "#E8E0D0" },
    ],
    desc: "Une jupe midi en coton rayé avec un nœud architectural noué sur le côté. La coupe asymétrique crée un tombé fluide et dramatique — une pièce signature qui se distingue à chaque mouvement.",
    details: { Matière: "100% Coton popeline", Longueur: "Midi asymétrique (env. 75–95 cm)", Coupe: "Asymétrique nouée", Livraison: "5–10 jours ouvrés" }
  },

];

/* ══════════════════════════════════════════════════════════════
   NE PAS MODIFIER EN DESSOUS (sauf si vous savez ce que vous faites)
══════════════════════════════════════════════════════════════ */

/* ── Helpers ── */
const catLabel = cat => ({
  "jeans":       "Jeans",
  "coton-raye":  "Coton rayuré",
  "coton-uni":   "Coton uni",
  "imprime":     "Imprimé",
  "satin":       "Satin",
}[cat] || cat);

const badgeColors = { default:"#0A0A0A", "Best-seller":"#C8A882", "Nouveau":"#0A0A0A", "Limité":"#0A0A0A" };

const fmt = n => Number(n).toLocaleString("fr-FR", {
  style: "currency", currency: "EUR",
  minimumFractionDigits: 0, maximumFractionDigits: 0
});

/* ══════════════════════════════════════════════════════════════
   ROUTEUR SPA (hash-based)
══════════════════════════════════════════════════════════════ */
function navigate(path) {
  window.location.hash = path;
}

function handleRoute() {
  const hash = window.location.hash.replace("#","") || "/";
  const pages = ["page-home","page-produit","page-checkout","page-confirmation","page-mentions","page-livraisons","page-auth","page-compte"];
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
    // Retour depuis Stripe (les params sont dans window.location.search)
    handleStripeReturn();
  } else if (hash.startsWith("/verify")) {
    document.getElementById("page-auth").classList.add("active");
    nav.className = "scrolled";
    if (typeof handleVerifyToken === "function") handleVerifyToken();
    window.scrollTo(0,0);
  } else if (hash === "/auth") {
    document.getElementById("page-auth").classList.add("active");
    nav.className = "scrolled";
    if (typeof renderAuthPage === "function") renderAuthPage();
    window.scrollTo(0,0);
  } else if (hash === "/compte") {
    document.getElementById("page-compte").classList.add("active");
    nav.className = "scrolled";
    if (typeof renderComptePage === "function") renderComptePage();
    window.scrollTo(0,0);
  } else if (hash === "/mentions-legales") {
    document.getElementById("page-mentions").classList.add("active");
    nav.className = "scrolled";
    window.scrollTo(0,0);
  } else if (hash === "/livraisons-retours") {
    document.getElementById("page-livraisons").classList.add("active");
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
    const badgeColor = badgeColors[p.badge] || "#0A0A0A";
    return `
    <div class="product-card reveal" data-cat="${p.cat}" data-id="${p.id}"
         style="animation-delay:${i*60}ms" onclick="navigate('/produit/${p.id}')">
      <div class="product-visual">
        ${p.badge ? `<div class="product-label-top" style="background:${badgeColor}">${p.badge}</div>` : ""}
        <button class="product-wishlist" onclick="event.stopPropagation();toggleWish(this)" aria-label="Favori">🤍</button>
        <img src="${v.image}" alt="${p.name}" class="product-img"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="product-img-fallback" style="display:none"><span>📷</span><small>Photo à venir</small></div>
        <div class="product-overlay">
          <button class="btn-cart" onclick="event.stopPropagation();navigate('/produit/${p.id}')">Voir le produit</button>
        </div>
      </div>
      ${p.variants.length > 1 ? `
      <div class="variant-strip">
        ${p.variants.map((vt,vi) => `<button class="variant-btn ${vi===0?'active':''}" title="${vt.label}" style="background:${vt.color||'#E8E4DF'}" onclick="event.stopPropagation();switchCardVariant(this,'${p.id}',${vi})"></button>`).join("")}
      </div>` : ""}
      <div class="product-info">
        <div class="product-cat">${catLabel(p.cat)}${p.coupe ? " · " + p.coupe : ""}</div>
        <div class="product-name">${p.name}</div>
        <div class="variant-label" id="vlabel-${p.id}">${v.label}</div>
        <div class="product-footer">
          <div class="product-price">${fmt(p.price)}</div>
          <div class="product-sizes">${p.sizes.slice(0,4).map(s=>`<div class="size-dot">${s}</div>`).join("")}</div>
        </div>
      </div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".product-card.reveal").forEach((el,i) => {
    setTimeout(() => el.classList.add("visible"), 80 + i*50);
  });
}

function switchCardVariant(btn, id, vi) {
  const p = CATALOGUE.find(x => x.id === id);
  if (!p) return;
  const v = p.variants[vi];
  const card = btn.closest(".product-card");
  const img = card.querySelector(".product-img");
  if (img) { img.src = v.image; img.style.display = ""; }
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
  if (!p) {
    container.innerHTML = `<div style="padding:120px 60px;font-size:18px;color:var(--muted)">Produit introuvable. <button onclick="navigate('/')" class="btn-primary" style="margin-left:16px">Retour</button></div>`;
    return;
  }

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
              onerror="this.style.display='none'">
          `).join("")}
        </div>` : ""}
      </div>

      <!-- INFOS -->
      <div class="pdp-info-col">
        <div class="pdp-eyebrow">${catLabel(p.cat)}${p.coupe ? " · Coupe " + p.coupe : ""}</div>
        <h1 class="pdp-name">${p.name}</h1>
        <div class="pdp-price">${fmt(p.price)}</div>
        <div class="pdp-price-sub">Livraison internationale · Retours sous 30 jours</div>

        <div class="pdp-sep"></div>

        <!-- Variantes -->
        ${p.variants.length > 1 ? `
        <div class="pdp-section-label">Coloris — <span id="pdpVLabel" style="color:var(--accent)">${v.label}</span></div>
        <div class="pdp-variants-grid" id="pdpVariantsGrid">
          ${p.variants.map((vt,vi) => `
            <div class="pdp-variant-item ${vi===0?'active':''}" onclick="pdpSelectVariant(${vi})">
              <img src="${vt.image}" alt="${vt.label}" class="pdp-variant-img"
                onerror="this.style.display='none'">
              <span class="pdp-variant-name">${vt.label}</span>
            </div>
          `).join("")}
        </div>` : `<div style="font-size:12px;color:var(--muted);margin-bottom:20px;letter-spacing:1px">${v.label}</div>`}

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
          <button class="pdp-btn-add" onclick="pdpAddToCart('${id}')">Ajouter au panier</button>
          <button class="pdp-btn-wish" id="pdpWishBtn" onclick="pdpToggleWish()">♡ Ajouter aux favoris</button>
        </div>
      </div>
    </div>

    <!-- PRODUITS SIMILAIRES -->
    <div class="pdp-related">
      <h2>Vous aimerez aussi <em>peut-être</em></h2>
      <div class="related-grid">
        ${CATALOGUE.filter(x => x.cat === p.cat && x.id !== id).concat(CATALOGUE.filter(x => x.cat !== p.cat && x.id !== id)).slice(0,4).map(rp => {
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

  const mainPhoto = document.getElementById("pdpMainPhoto");
  if (mainPhoto) {
    mainPhoto.classList.add("switching");
    setTimeout(() => {
      mainPhoto.src = v.image;
      mainPhoto.classList.remove("switching");
      mainPhoto.style.display = "";
      const fb = document.getElementById("pdpFallback");
      if (fb) fb.style.display = "none";
    }, 200);
  }

  const lbl = document.getElementById("pdpVLabel");
  if (lbl) lbl.textContent = v.label;

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
    const alert = document.getElementById("pdpSizeAlert");
    if (alert) alert.classList.add("show");
    document.getElementById("pdpSizesRow")?.scrollIntoView({ behavior:"smooth", block:"center" });
    showToast("Sélectionnez une taille avant d'ajouter");
    return;
  }
  const p = CATALOGUE.find(x => x.id === id);
  if (!p) return;
  const v = p.variants[pdpState.variantIdx];
  const size = p.sizes[pdpState.sizeIdx];
  addToCart({ product:p, variant:v, size, qty:1 });
  showToast("✓ Ajouté — " + p.name + " · " + size);
}

function pdpToggleWish() {
  pdpState.wished = !pdpState.wished;
  const btn = document.getElementById("pdpWishBtn");
  if (btn) {
    btn.textContent = pdpState.wished ? "♥ Ajouté aux favoris" : "♡ Ajouter aux favoris";
    btn.classList.toggle("active", pdpState.wished);
    if (pdpState.wished) showToast("Ajouté à vos favoris");
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
  const itemsEl    = document.getElementById("cartItems");
  const totalEl    = document.getElementById("cartTotal");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalQty    = cart.reduce((a,c) => a + c.qty, 0);
  const totalAmount = cart.reduce((a,c) => a + c.product.price * c.qty, 0);

  document.querySelectorAll(".cart-badge").forEach(b => {
    b.textContent = totalQty;
    b.classList.toggle("show", totalQty > 0);
  });

  if (totalEl)    totalEl.textContent    = fmt(totalAmount);
  if (subtotalEl) subtotalEl.textContent = fmt(totalAmount);

  const countLbl = document.getElementById("cartCountLabel");
  if (countLbl) countLbl.textContent = totalQty > 0 ? `(${totalQty} article${totalQty>1?"s":""})` : "";

  if (!itemsEl) return;
  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">
      <div style="font-size:40px;margin-bottom:16px">🛍</div>
      Votre panier est vide.<br><br>
      <button class="btn-primary" onclick="toggleCart();navigate('/')"
              style="font-size:10px;padding:12px 24px">
        Découvrir la collection
      </button>
    </div>`;
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
  // Délégué à auth.js — redéfini là-bas avec vérification de session
  if (cart.length === 0) { showToast("Votre panier est vide"); return; }
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
  const fcfaApprox  = Math.round(totalAmount * 655.957);

  const recapEl = document.getElementById("recapItems");
  if (recapEl) {
    recapEl.innerHTML = cart.map(c => `
      <div class="recap-item">
        <img src="${c.variant.image}" alt="${c.product.name}" class="recap-item-img"
             onerror="this.style.background='var(--border)'">
        <div>
          <div class="recap-item-name">${c.product.name}</div>
          <div class="recap-item-meta">${c.variant.label} · ${c.size} · ×${c.qty}</div>
        </div>
        <div class="recap-item-price">${fmt(c.product.price * c.qty)}</div>
      </div>`).join("");
  }

  document.querySelectorAll(".recap-total-amount").forEach(el => {
    el.textContent = fmt(totalAmount);
  });

  const fcfaNote = document.getElementById("recapFcfaNote");
  if (fcfaNote) fcfaNote.textContent = `≈ ${fcfaApprox.toLocaleString("fr")} FCFA`;

  // Google Places autocomplete sur l'adresse de livraison
  if (typeof initAddressAutocomplete === "function") {
    initAddressAutocomplete("co-address", ({ address, city, postalCode, country }) => {
      if (address)    { const el = document.getElementById("co-address"); if (el) el.value = address; }
      if (postalCode) { const el = document.getElementById("co-postal");  if (el) el.value = postalCode; }
      if (city)       { const el = document.getElementById("co-city");    if (el) el.value = city; }
      if (country)    { const el = document.getElementById("co-country"); if (el) el.value = country; }
    });
  }
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

  if (selectedPayMethod === "card" || selectedPayMethod === "wallet") {
    processStripePayment(totalAmount, name, email);
  } else if (selectedPayMethod === "wave") {
    processWavePayDunya(totalAmount);
  } else if (selectedPayMethod === "orange") {
    processOrangePayDunya(totalAmount);
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
   WISHLIST
══════════════════════════════════════════════════════════════ */
function toggleWish(btn) {
  const w = btn.textContent === "❤️";
  btn.textContent = w ? "🤍" : "❤️";
  if (!w) showToast("Ajouté à vos favoris");
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
  showToast("Inscrite à la newsletter YARAÏ");
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e,i) => {
      if (e.isIntersecting) setTimeout(() => e.target.classList.add("visible"), i*70);
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
