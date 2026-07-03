import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { mxn, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS: Record<string, [string, string]> = {
  completed: ["Completado", "bg-win/15 text-win"],
  pending: ["Pendiente", "bg-gold/20 text-yellow-700"],
  failed: ["Fallido", "bg-danger/10 text-danger"],
  expired: ["Expirado", "bg-gray-100 text-gray-500"],
};

export default async function Cartera() {
  const user = await getUser();
  if (!user) redirect("/login?next=/cartera");
  const payments = await prisma.payment.findMany({
    where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50,
    include: { order: { include: { product: true } } },
  });
  const monthKey = new Date().toISOString().slice(0, 7);
  const spent = user.monthKey === monthKey ? user.monthSpendCents : 0;
  const pct = Math.min(100, Math.round((spent / user.monthlyLimitCents) * 100));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">Mi cartera 👛</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-brand">⚡ {user.bidBalance}</p>
          <p className="text-xs font-bold text-gray-400">PUJAS DISPONIBLES</p>
          <Link href="/paquetes" className="btn-primary mt-2 w-full !py-2 text-sm">Recargar</Link>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-extrabold text-blue-brand">{mxn(user.totalSpendCents)}</p>
          <p className="text-xs font-bold text-gray-400">GASTO TOTAL</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-gray-400">LÍMITE MENSUAL</p>
          <p className="text-sm font-bold">{mxn(spent)} de {mxn(user.monthlyLimitCents)}</p>
          <div className="mt-1.5 h-2 rounded-full bg-gray-100">
            <div className={`h-2 rounded-full ${pct > 85 ? "bg-danger" : "bg-win"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Te quedan {mxn(Math.max(0, user.monthlyLimitCents - spent))} este mes. ¡Puja con cabeza! 💚</p>
        </div>
      </div>

      <div className="card divide-y divide-gray-100">
        <h2 className="p-4 font-bold">Historial de pagos</h2>
        {payments.length === 0 && <p className="p-4 text-sm text-gray-400">Aún no tienes pagos. ¡Tu primera ganga te espera!</p>}
        {payments.map((p) => {
          const [label, cls] = STATUS[p.status] ?? [p.status, "bg-gray-100"];
          return (
            <Link key={p.id} href={`/pago/${p.id}`} className="flex items-center justify-between p-4 text-sm hover:bg-soft">
              <div>
                <p className="font-bold">
                  {p.type === "bid_pack" ? `⚡ Paquete de ${p.bidsQty} pujas` : `📦 ${p.order?.product.name ?? "Pedido"}`}
                </p>
                <p className="text-xs text-gray-400">{fmtDate(p.createdAt)} · {p.method}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold">{mxn(p.amountCents)}</p>
                <span className={`chip ${cls}`}>{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
