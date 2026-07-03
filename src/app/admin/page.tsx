import { prisma } from "@/lib/db";
import { mxn, fmtDate } from "@/lib/format";
import { BID_COST_CENTS } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [revenue, revenueToday, users, activeAuctions, bidsToday, recent] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amountCents: true }, where: { status: "completed" } }),
    prisma.payment.aggregate({ _sum: { amountCents: true }, where: { status: "completed", completedAt: { gte: today } } }),
    prisma.user.count(),
    prisma.auction.count({ where: { status: "active" } }),
    prisma.bid.count({ where: { createdAt: { gte: today }, userId: { not: null } } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { username: true } } } }),
  ]);

  const cards = [
    ["💰 Ingresos totales", mxn(revenue._sum.amountCents ?? 0)],
    ["📈 Ingresos hoy", mxn(revenueToday._sum.amountCents ?? 0)],
    ["⚡ Pujas de usuarios hoy", `${bidsToday} (${mxn(bidsToday * BID_COST_CENTS)})`],
    ["👥 Usuarios", String(users)],
    ["🔥 Subastas activas", String(activeAuctions)],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-bold text-gray-400">{label}</p>
            <p className="mt-1 text-xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <div className="card divide-y divide-gray-100">
        <h2 className="p-4 font-bold">Pagos recientes</h2>
        {recent.map((p) => (
          <div key={p.id} className="flex justify-between p-3 text-sm">
            <span>@{p.user.username} · {p.type === "bid_pack" ? `${p.bidsQty} pujas` : "pedido"} · {p.method}</span>
            <span className="font-bold">{mxn(p.amountCents)} <span className={`chip ml-1 ${p.status === "completed" ? "bg-win/15 text-win" : "bg-gold/20 text-yellow-700"}`}>{p.status}</span></span>
          </div>
        ))}
        {recent.length === 0 && <p className="p-4 text-sm text-gray-400">Sin pagos aún.</p>}
      </div>
    </div>
  );
}
