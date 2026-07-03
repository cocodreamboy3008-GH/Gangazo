import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { mxn } from "@/lib/format";
import LiveGrid from "@/components/LiveGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [user, cats, winners] = await Promise.all([
    getUser(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.auction.findMany({
      where: { status: "ended", winnerName: { not: null } },
      include: { product: true },
      orderBy: { endedAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-6">
      {!user && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-dark to-blue-brand p-6 md:p-10 text-white">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Juega. Puja. <span className="text-gold">Gana.</span></h1>
          <p className="mt-2 max-w-lg text-white/90 md:text-lg">
            Subastas en vivo desde <b>$0.01 MXN</b>. iPhones, pantallas, consolas… tu ganga te espera. Real deals, real fun. 🇲🇽
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/registro" className="btn bg-white text-brand hover:bg-gold hover:text-ink">🎁 Regístrate: 50 pujas GRATIS</Link>
            <Link href="/como-funciona" className="btn border-2 border-white/70 text-white hover:bg-white/10">¿Cómo funciona?</Link>
          </div>
          <p className="mt-3 text-xs text-white/70">Transparente y justo: cada puja cuesta $0.13 · Si no ganas, Cómpralo Ya y tus pujas se descuentan del precio.</p>
        </section>
      )}

      {winners.length > 0 && (
        <section className="flex gap-2 overflow-x-auto pb-1">
          {winners.map((w) => (
            <div key={w.id} className="chip shrink-0 border border-win/40 bg-win/10 !py-1.5 text-ink">
              🏆 <b>{w.winnerName}</b> ganó {w.product.emoji} {w.product.name} por <b className="text-win">{mxn(w.finalCents ?? 0)}</b>
            </div>
          ))}
        </section>
      )}

      <LiveGrid cats={cats.map((c) => ({ name: c.name, slug: c.slug, emoji: c.emoji }))} />
    </div>
  );
}
