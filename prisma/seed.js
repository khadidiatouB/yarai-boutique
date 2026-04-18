/**
 * YARAÏ — Seed de la base de données
 * Initialise les produits et le stock de départ
 *
 * Usage : node prisma/seed.js
 */

require("dotenv").config();
const { Pool }          = require("pg");
const { PrismaPg }      = require("@prisma/adapter-pg");
const { PrismaClient }  = require("@prisma/client");

const pool   = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

const PRODUCTS = [
  {
    id: "naya-imprime-orange",
    name: "Naya Imprimé",
    category: "ensemble",
    price: 28500,
    badge: "Nouveau",
    badgeColor: "terra",
    description: "Ensemble asymétrique en tissu imprimé de motifs calligraphiques.",
    variants: ["Terracotta imprimé", "Sable imprimé"],
    sizes: ["XS", "S", "M", "L"],
    stockQty: 5,
  },
  {
    id: "naya-marron",
    name: "Naya Uni",
    category: "ensemble",
    price: 26000,
    badge: "Best-seller",
    badgeColor: "gold",
    description: "La version uni du best-seller Naya.",
    variants: ["Vert uni", "Marron uni"],
    sizes: ["S", "M", "L"],
    stockQty: 8,
  },
  {
    id: "luma",
    name: "Luma",
    category: "ensemble",
    price: 26000,
    badge: "Limité",
    badgeColor: "deep",
    description: "L'ensemble Luma se distingue par son col drapé enveloppant.",
    variants: ["Vert", "Marron", "Noir"],
    sizes: ["S", "M", "L"],
    stockQty: 4,
  },
  {
    id: "skirt-solea",
    name: "Jupe Solea",
    category: "jupe",
    price: 13000,
    badge: null,
    badgeColor: "deep",
    description: "Jupe longue paysanne à taille haute.",
    variants: ["Noir", "Marron", "Blanc"],
    sizes: ["S", "M", "L"],
    stockQty: 10,
  },
  {
    id: "skirt-azura",
    name: "Jupe Azura",
    category: "jupe",
    price: 13000,
    badge: "Limité",
    badgeColor: "deep",
    description: "Jupe mi-longue aux rayures graphiques.",
    variants: ["Rayure Blue", "Blanc"],
    sizes: ["S", "M", "L"],
    stockQty: 6,
  },
  {
    id: "skirt-alya",
    name: "Jupe Alya",
    category: "jupe",
    price: 12000,
    badge: "Limité",
    badgeColor: "deep",
    description: "Jupe longue asymétrique, esprit côtier et estival.",
    variants: ["Jaune", "Bleu", "Terracotta"],
    sizes: ["S", "M", "L"],
    stockQty: 6,
  },
  {
    id: "skirt-safia",
    name: "Jupe Safia",
    category: "jupe",
    price: 15000,
    badge: "Limité",
    badgeColor: "deep",
    description: "Jupe longue à multi-volants qui crée du mouvement à chaque pas.",
    variants: ["Imprimé", "Imprimé 2"],
    sizes: ["S", "M", "L"],
    stockQty: 5,
  },
  {
    id: "skirt-mira",
    name: "Jupe Mira",
    category: "jupe",
    price: 10000,
    badge: "Limité",
    badgeColor: "deep",
    description: "Jupe longue sirène, esprit côtier et estival.",
    variants: ["Marron", "Noir", "Leopard"],
    sizes: ["S", "M", "L"],
    stockQty: 5,
  },
];

async function main() {
  console.log("🌱 Seed en cours...");

  for (const p of PRODUCTS) {
    // Upsert produit
    await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name, price: p.price, badge: p.badge, description: p.description },
      create: {
        id:          p.id,
        name:        p.name,
        category:    p.category,
        price:       p.price,
        badge:       p.badge,
        badgeColor:  p.badgeColor,
        description: p.description,
      },
    });

    // Upsert stock pour chaque combinaison variante × taille
    for (const variant of p.variants) {
      for (const size of p.sizes) {
        await prisma.stock.upsert({
          where: { productId_variant_size: { productId: p.id, variant, size } },
          update: {},  // ne pas écraser le stock existant
          create: { productId: p.id, variant, size, qty: p.stockQty },
        });
      }
    }

    console.log(`  ✅ ${p.name} (${p.variants.length} variantes × ${p.sizes.length} tailles)`);
  }

  console.log("\n✅ Seed terminé !");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
