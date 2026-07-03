import { prisma } from "@/lib/db";
import { mxn, fmtDate } from "@/lib/format";
import AuctionAdmin, { Cancel } from "./AuctionAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSubastas() {
  const [auctions, products] = await Promise.all([
    prisma.auction.findMany({ include: { product: true }, orderBy: { createdAt: "desc" }, take: 60 }),
    prisma.product.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="space-y-4">
      <AuctionAdmin products={products.map((p) => ({ id: p.id, name: `${p.emoji} ${p.name}` }))} />
      <div className="card divide-y divide-gray-100 text-sm">
        <h2 className="p-4 font-bold">Todas las subastas</h2>
        {auctions.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <span className="flex items-center gap-2">
              <span className="text-xl">{a.product.emoji}</span>
              <span>
                <b>{a.product.name}</b>
                <span className="block text-xs text-gray-400">
                  {a.status} · {a.totalBids} pujas · {mxn(a.finalCents ?? a.priceCents)} · inicia {fmtDate(a.startsAt)}
                  {a.winnerName && ` · 🏆 ${a.winnerName}`}
                </span>
              </span>
            </span>
            {(a.status === "active" || a.status === "scheduled") && <Cancel id={a.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
