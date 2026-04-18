# YARAÏ — Site v6
> Page produit complète · Badge panier · Paiement CinetPay + Stripe

---

## 📁 Structure

```
yarai-site/
├── index.html          ← SPA — toutes les pages
├── css/style.css       ← Styles complets
├── js/
│   ├── main.js         ← Catalogue, routeur, panier, pages
│   └── payment.js      ← CinetPay + Stripe (⚙️ à configurer)
├── assets/             ← Vos photos produits
├── server.js           ← Backend Node.js (Stripe + CinetPay)
├── package.json
├── .env.example        ← Modèle pour vos clés API
└── README.md
```

---

## 🚀 Lancer le site (frontend seul)

Ouvrez `index.html` directement dans votre navigateur, ou avec Live Server (VS Code).

Sans configurer les clés, le paiement fonctionne en **mode simulation** — le flux complet est testable.

---

## 💳 Configurer les paiements réels

### Étape 1 — CinetPay (Wave + Orange Money + cartes locales)

1. Créez un compte sur [cinetpay.com](https://cinetpay.com)
2. Dashboard → **Mes API** → copiez `APIKEY` et `SITE_ID`
3. Dans `js/payment.js`, remplacez :
   ```js
   cinetpay: {
     apikey:  "VOTRE_CINETPAY_APIKEY",   // ← votre clé
     site_id: "VOTRE_CINETPAY_SITE_ID",  // ← votre site ID
     mode:    "PRODUCTION",
   }
   ```

### Étape 2 — Stripe (carte internationale + Apple/Google Pay)

1. Créez un compte sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers → API keys**
3. Dans `js/payment.js`, remplacez la clé publique :
   ```js
   stripe: {
     publishableKey: "pk_live_VOTRE_CLE_PUBLIQUE",
   }
   ```
4. Créez le fichier `.env` à la racine :
   ```
   STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE
   CINETPAY_APIKEY=...
   CINETPAY_SITE_ID=...
   ```

### Étape 3 — Démarrer le backend

```bash
npm install
node server.js
# → Serveur démarré sur http://localhost:3000
```

Dans `js/payment.js`, confirmez :
```js
backendUrl: "http://localhost:3000",
```

### Étape 4 — Apple Pay (optionnel)
Apple Pay nécessite :
- Un domaine HTTPS
- Un fichier de vérification sur votre serveur (Stripe l'explique dans leur dashboard)
- Safari sur iPhone ou Mac

---

## 🌐 Mettre en ligne

### Option recommandée : Railway (gratuit pour démarrer)
1. Créez un compte sur [railway.app](https://railway.app)
2. Importez votre projet GitHub
3. Ajoutez les variables d'environnement dans Railway
4. Votre backend est déployé automatiquement

### Frontend : Netlify
1. Glissez le dossier sur [netlify.com](https://netlify.com)
2. Dans `js/payment.js`, mettez à jour `backendUrl` avec l'URL Railway

---

## ✏️ Ajouter des produits

Dans `js/main.js`, section `CATALOGUE`, copiez-collez ce bloc :

```js
{
  id: "nom-unique",
  name: "Nom du produit",
  cat: "ensemble",        // ensemble | jupe | top | robe | pantalon
  price: 25000,
  badge: "Nouveau",       // "" pour aucun badge
  badgeColor: "terra",    // terra | gold | deep
  sizes: ["S", "M", "L"],
  desc: "Description de la pièce…",
  details: {
    Matière:   "100% Coton",
    Origine:   "Fait au Sénégal",
    Entretien: "Lavage à la main",
    Livraison: "5–7 jours",
  },
  variants: [
    { label: "Coloris 1", image: "assets/photo1.png" },
    { label: "Coloris 2", image: "assets/photo2.png" },
  ]
},
```

---

*YARAÏ · Dakar, Sénégal · © 2025*
