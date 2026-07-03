import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

const db = new PrismaClient();
const min = (n: number) => new Date(Date.now() + n * 60000);

const CATS = [
  { name: "Electrónica", slug: "electronica", emoji: "📱" },
  { name: "Hogar", slug: "hogar", emoji: "🏠" },
  { name: "Gaming", slug: "gaming", emoji: "🎮" },
  { name: "Moda", slug: "moda", emoji: "👟" },
  { name: "Cocina", slug: "cocina", emoji: "🍳" },
  { name: "Tarjetas de regalo", slug: "tarjetas", emoji: "🎁" },
];

// [name, brand, retail MXN, emoji, gradient, category slug, description]
const PRODUCTS: [string, string, number, string, string, string, string][] = [
  ["iPhone 15 Pro 128GB", "Apple", 24999, "📱", "from-slate-700 to-slate-900", "electronica", "Titanio natural, chip A17 Pro, cámara de 48MP. Nuevo y sellado con garantía Apple México."],
  ['Pantalla 55" 4K UHD', "Samsung", 12999, "📺", "from-blue-900 to-indigo-950", "electronica", "Smart TV Crystal UHD 55 pulgadas con Tizen, HDR10+ y control por voz."],
  ["PlayStation 5 Slim", "Sony", 11499, "🎮", "from-indigo-600 to-blue-800", "gaming", "Consola PS5 Slim 1TB edición disco. Incluye control DualSense."],
  ["AirPods Pro 2", "Apple", 5499, "🎧", "from-gray-200 to-gray-400", "electronica", "Cancelación activa de ruido, audio espacial y estuche MagSafe USB-C."],
  ["Nintendo Switch OLED", "Nintendo", 8499, "🕹️", "from-red-500 to-rose-700", "gaming", "Pantalla OLED de 7\", 64GB, base con puerto LAN. Blanco."],
  ["Freidora de aire 5.5L", "Ninja", 2799, "🍟", "from-orange-400 to-red-600", "cocina", "Air Fryer XL con 7 funciones, canasta antiadherente y recetario."],
  ["Batidora de pedestal", "KitchenAid", 8999, "🧁", "from-pink-400 to-rose-600", "cocina", "Artisan 4.8L rojo imperio, 10 velocidades, tazón de acero inoxidable."],
  ["Tenis Air Jordan 1", "Nike", 3599, "👟", "from-red-600 to-black", "moda", "Air Jordan 1 Mid, talla a elegir al ganar. 100% originales."],
  ["Smartwatch Series 9", "Apple", 8999, "⌚", "from-zinc-700 to-zinc-900", "electronica", "Apple Watch Series 9 GPS 45mm, caja de aluminio medianoche."],
  ["Aspiradora robot", "Roomba", 6999, "🤖", "from-teal-500 to-cyan-700", "hogar", "iRobot Roomba con mapeo inteligente y vaciado automático."],
  ["Tarjeta Amazon $2,000", "Amazon", 2000, "🎁", "from-amber-400 to-orange-600", "tarjetas", "Tarjeta de regalo digital de $2,000 MXN. Entrega por correo electrónico."],
  ["Tarjeta Liverpool $5,000", "Liverpool", 5000, "💳", "from-pink-500 to-fuchsia-700", "tarjetas", "Monedero electrónico Liverpool por $5,000 MXN."],
  ["Cafetera espresso", "De'Longhi", 4599, "☕", "from-amber-700 to-stone-900", "cocina", "Máquina de espresso manual con espumador de leche."],
  ["Bocina JBL Charge 5", "JBL", 3299, "🔊", "from-emerald-500 to-green-800", "electronica", "Bocina Bluetooth portátil resistente al agua IP67, 20h de batería."],
  ["Laptop gamer RTX 4060", "ASUS", 22999, "💻", "from-violet-600 to-purple-900", "gaming", "ASUS TUF Gaming 15.6\" 144Hz, Ryzen 7, 16GB RAM, RTX 4060."],
  ["Xbox Series X", "Microsoft", 12499, "🟩", "from-green-600 to-emerald-900", "gaming", "Consola Xbox Series X 1TB con control inalámbrico."],
];

async function main() {
  // Don't wipe a live database on redeploy — reseed only when empty or forced.
  if (!process.env.FORCE_SEED && (await db.user.count()) > 0) {
    console.log("DB ya tiene datos — omito seed (usa FORCE_SEED=1 para reiniciar)");
    return;
  }
  console.log("🌱 Seeding Gánalo...");
  await db.$transaction([
    db.bid.deleteMany(), db.watch.deleteMany(), db.bidBuddy.deleteMany(),
    db.notification.deleteMany(), db.payment.deleteMany(), db.order.deleteMany(),
    db.auction.deleteMany(), db.product.deleteMany(), db.category.deleteMany(),
    db.user.deleteMany(),
  ]);

  const pw = hashPassword("Ganalo2026!");
  const admin = await db.user.create({
    data: { email: "admin@ganalo.xyz", passwordHash: pw, name: "Admin Gánalo", username: "ganalo_admin", role: "admin", bidBalance: 1000, referralCode: "ADMIN1" },
  });
  const demo = await db.user.create({
    data: { email: "demo@ganalo.xyz", passwordHash: pw, name: "Jorge Cohen", username: "jorge_mx", bidBalance: 500, referralCode: "JORGE1" },
  });

  const cats: Record<string, string> = {};
  for (const c of CATS) cats[c.slug] = (await db.category.create({ data: c })).id;

  const prods = [];
  for (const [name, brand, retail, emoji, gradient, cat, description] of PRODUCTS) {
    prods.push(await db.product.create({
      data: { name, brand, retailCents: retail * 100, costCents: Math.round(retail * 65), emoji, gradient, categoryId: cats[cat], description },
    }));
  }

  const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a));

  // 8 live auctions (staggered mid-flight), 4 scheduled, 4 ended with winners
  for (let i = 0; i < 8; i++) {
    const p = prods[i];
    const bids = rnd(30, 180);
    const a = await db.auction.create({
      data: {
        productId: p.id, status: "active", priceCents: bids, totalBids: bids,
        startsAt: min(-30), timerEndsAt: min(0.15 + i * 0.05), featured: i < 3,
        botTarget: rnd(200, 700),
      },
    });
    await db.bid.create({ data: { auctionId: a.id, botName: "ChilangoWin", priceCents: bids } });
  }
  for (let i = 0; i < 4; i++) {
    await db.auction.create({
      data: { productId: prods[8 + i].id, status: "scheduled", startsAt: min([2, 10, 45, 120][i]), botTarget: rnd(200, 700) },
    });
  }
  const winners = ["Reyna_Pujas", "TapatioPro", "MariaGdl", "El_Rayo"];
  for (let i = 0; i < 4; i++) {
    const p = prods[12 + i];
    const bids = rnd(150, 900);
    await db.auction.create({
      data: {
        productId: p.id, status: "ended", priceCents: bids, finalCents: bids, totalBids: bids,
        startsAt: min(-300 - i * 60), endedAt: min(-20 - i * 45), winnerName: winners[i],
      },
    });
  }

  console.log(`✅ Seed listo. Usuarios: demo@ganalo.xyz / admin@ganalo.xyz (contraseña: Ganalo2026!)`);
}

main().finally(() => db.$disconnect());
