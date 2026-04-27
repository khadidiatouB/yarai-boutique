/**
 * YARAÏ — Seed de la base de données
 * Initialise les produits et le stock de départ
 *
 * Usage : node prisma/seed.js
 *
 * IMPORTANT : Les IDs produits ici doivent correspondre exactement
 * aux IDs dans js/main.js (CATALOGUE) pour que les commandes fonctionnent.
 */

require("dotenv").config();
const { Pool }         = require("pg");
const { PrismaPg }     = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

/* Prix en EUR — correspond exactement aux prix du CATALOGUE (js/main.js) */
const PRODUCTS = [
  {
    id:          "jupe-evasee-denim",
    name:        "Jupe Évasée Denim",
    category:    "jeans",
    price:       69,
    badge:       null,
    description: "Une jupe évasée en denim premium qui allie structure et fluidité.",
    variants:    ["Bleu indigo", "Terracotta", "Soleil"],
    sizes:       ["XS", "S", "M", "L", "XL"],
    stockQty:    8,
  },
  {
    id:          "jupe-droite-jean",
    name:        "Jupe Droite Jean",
    category:    "jeans",
    price:       59,
    badge:       "Nouveau",
    description: "La jupe droite, pièce intemporelle réinventée en denim structuré.",
    variants:    ["Noir délavé", "Marron tabac"],
    sizes:       ["XS", "S", "M", "L", "XL"],
    stockQty:    8,
  },
  {
    id:          "jupe-trapeze-rayee",
    name:        "Jupe Rayée Trapèze",
    category:    "coton-raye",
    price:       49,
    badge:       null,
    description: "Légère et graphique, cette jupe trapèze en coton rayé capture l'essence de l'été.",
    variants:    ["Rayure marine", "Blanc optique"],
    sizes:       ["XS", "S", "M", "L", "XL"],
    stockQty:    10,
  },
  {
    id:          "jupe-paysanne-coton",
    name:        "Jupe Paysanne Coton",
    category:    "coton-uni",
    price:       55,
    badge:       "Best-seller",
    description: "Taille haute, coupe paysanne ample : cette jupe en coton uni épuré sublime toutes les morphologies.",
    variants:    ["Noir", "Écru", "Marron"],
    sizes:       ["XS", "S", "M", "L", "XL"],
    stockQty:    12,
  },
  {
    id:          "jupe-imprimee-volants",
    name:        "Jupe Longue Imprimée",
    category:    "imprime",
    price:       65,
    badge:       null,
    description: "Chaque volant révèle une nouvelle dimension du mouvement.",
    variants:    ["Imprimé fleuri", "Imprimé graphique"],
    sizes:       ["XS", "S", "M", "L", "XL"],
    stockQty:    6,
  },
  {
    id:          "jupe-satin-sirene",
    name:        "Jupe Midi Satin",
    category:    "satin",
    price:       79,
    badge:       null,
    description: "Silhouette moulante, tombé soyeux.",
    variants:    ["Noir", "Marron", "Léopard"],
    sizes:       ["XS", "S", "M", "L", "XL"],
    stockQty:    6,
  },
  {
    id:          "jupe-a-pois",
    name:        "Jupe à Pois",
    category:    "imprime",
    price:       59,
    badge:       "Nouveau",
    description: "Jupe évasée à pois en coton imprimé, deux coloris.",
    variants:    ["Beige pois noir", "Blanc pois noir"],
    sizes:       ["XS", "S", "M", "L", "XL"],
    stockQty:    10,
  },
  {
    id:          "jupe-rayee-noeud",
    name:        "Jupe Rayée Nouée",
    category:    "coton-raye",
    price:       65,
    badge:       "Nouveau",
    description: "Jupe midi asymétrique en coton rayé avec nœud sur le côté.",
    variants:    ["Rayure marine", "Rayure blanc"],
    sizes:       ["XS", "S", "M", "L", "XL"],
    stockQty:    8,
  },
];

async function main() {
  console.log("🌱 Seed en cours…");

  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where:  { id: p.id },
      update: { name: p.name, price: p.price, badge: p.badge, description: p.description },
      create: {
        id:          p.id,
        name:        p.name,
        category:    p.category,
        price:       p.price,
        badge:       p.badge       ?? null,
        badgeColor:  p.badgeColor  ?? null,
        description: p.description ?? null,
      },
    });

    for (const variant of p.variants) {
      for (const size of p.sizes) {
        await prisma.stock.upsert({
          where:  { productId_variant_size: { productId: p.id, variant, size } },
          update: {},
          create: { productId: p.id, variant, size, qty: p.stockQty },
        });
      }
    }

    console.log(`  ✅ ${p.name} (${p.variants.length} variantes × ${p.sizes.length} tailles)`);
  }

  console.log("\n✅ Seed terminé !");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
