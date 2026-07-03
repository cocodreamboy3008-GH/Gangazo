import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { mxn, fmtDate, timeAgo } from "@/lib/format";
import { REFERRAL_BONUS_BIDS } from "@/lib/config";
import ProfileForm from "./ProfileForm";
import OrderPayButton from "./OrderPayButton";
import LogoutButton from "./LogoutButton";
import MarkRead from "./MarkRead";

export const dynamic = "force-dynamic";

const TABS = [
  ["pedidos", "📦 Pedidos"],
  ["favoritos", "❤️ Favoritos"],
  ["referidos", "🎁 Referidos"],
  ["avisos", "🔔 Avisos"],
  ["perfil", "⚙️ Perfil"],
] as const;

const ORDER_STATUS: Record<string, [string, string]> = {
  pending_payment: ["Pago pendiente", "bg-gold/20 text-yellow-700"],
  paid: ["Pagado · preparando envío", "bg-blue-light text-blue-brand"],
  shipped: ["Enviado", "bg-premium/10 text-premium"],
  delivered: ["Entregado", "bg-win/15 text-win"],
};

export default async function Cuenta({ searchParams }: { searchParams: { tab?: string } }) {
  const user = await getUser();
  if (!user) redirect("/login?next=/cuenta");
  const tab = searchParams.tab || "pedidos";

  const [orders, watches, referrals, notifications, stats] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id }, include: { product: true, auction: true }, orderBy: { createdAt: "desc" } }),
    prisma.watch.findMany({ where: { userId: user.id }, include: { auction: { include: { product: true } } } }),
    prisma.user.findMany({ where: { referredById: user.id }, select: { username: true, createdAt: true } }),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.bid.count({ where: { userId: user.id } }),
  ]);
  const wins = orders.filter((o) => o.kind === "win").length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-brand text-xl font-extrabold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-extrabold">{user.name}</h1>
            <p className="text-sm text-gray-400">@{user.username} · miembro desde {fmtDate(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-4 text-center text-sm">
          <div><p className="text-xl font-extrabold text-brand">{stats}</p><p className="text-xs text-gray-400">pujas hechas</p></div>
          <div><p className="text-xl font-extrabold text-win">{wins}</p><p className="text-xs text-gray-400">victorias 🏆</p></div>
          <div><p className="text-xl font-extrabold text-blue-brand">{user.bidBalance}</p><p className="text-xs text-gray-400">disponibles</p></div>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {TABS.map(([id, label]) => (
          <Link key={id} href={`/cuenta?tab=${id}`}
            className={`chip whitespace-nowrap !px-4 !py-2 !text-sm ${tab === id ? "bg-blue-brand text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            {label}
          </Link>
        ))}
      </div>

      {tab === "pedidos" && (
        <div className="card divide-y divide-gray-100">
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p className="text-3xl">🎯</p><p className="mt-1 font-bold">Aún no tienes pedidos</p>
              <p className="text-sm">Gana una subasta o usa Cómpralo Ya.</p>
            </div>
          )}
          {orders.map((o) => {
            const [label, cls] = ORDER_STATUS[o.status] ?? [o.status, "bg-gray-100"];
            return (
              <div key={o.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{o.product.emoji}</span>
                  <div>
                    <p className="font-bold">{o.product.name}</p>
                    <p className="text-xs text-gray-400">
                      {o.kind === "win" ? `🏆 Ganada por ${mxn(o.auction.finalCents ?? 0)}` : "🛍 Cómpralo Ya"} · {fmtDate(o.createdAt)}
                    </p>
                    <span className={`chip mt-1 ${cls}`}>{label}</span>
                  </div>
                </div>
                {o.status === "pending_payment" && <OrderPayButton orderId={o.id} dueCents={o.dueCents} />}
              </div>
            );
          })}
        </div>
      )}

      {tab === "favoritos" && (
        <div className="card divide-y divide-gray-100">
          {watches.length === 0 && <p className="p-8 text-center text-gray-400">Marca subastas con ❤️ para seguirlas aquí.</p>}
          {watches.map((w) => (
            <Link key={w.id} href={`/subasta/${w.auctionId}`} className="flex items-center justify-between p-4 hover:bg-soft">
              <span className="flex items-center gap-3">
                <span className="text-3xl">{w.auction.product.emoji}</span>
                <span>
                  <p className="font-bold">{w.auction.product.name}</p>
                  <p className="text-xs text-gray-400">{w.auction.status === "active" ? "🔴 En vivo" : w.auction.status === "scheduled" ? "🗓 Próxima" : "Finalizada"}</p>
                </span>
              </span>
              <span className="font-extrabold text-blue-brand">{mxn(w.auction.finalCents ?? w.auction.priceCents)}</span>
            </Link>
          ))}
        </div>
      )}

      {tab === "referidos" && (
        <div className="card p-5">
          <h2 className="font-extrabold">Invita y gana 🎁</h2>
          <p className="text-sm text-gray-500">Por cada amigo que se registre con tu código recibes <b>{REFERRAL_BONUS_BIDS} pujas gratis</b>.</p>
          <p className="my-3 rounded-lg border-2 border-dashed border-brand bg-brand/5 p-3 text-center font-mono text-2xl font-extrabold tracking-widest text-brand">
            {user.referralCode}
          </p>
          <p className="text-xs text-gray-400 text-center">Comparte: gangazo.com/registro?ref={user.referralCode}</p>
          <h3 className="mt-4 font-bold text-sm">Tus referidos ({referrals.length})</h3>
          <ul className="mt-1 divide-y divide-gray-100 text-sm">
            {referrals.map((r) => (
              <li key={r.username} className="flex justify-between py-2">
                <span>@{r.username}</span><span className="text-gray-400">{timeAgo(r.createdAt)}</span>
              </li>
            ))}
            {referrals.length === 0 && <li className="py-2 text-gray-400">Aún nadie usa tu código. ¡Compártelo!</li>}
          </ul>
        </div>
      )}

      {tab === "avisos" && (
        <div className="card divide-y divide-gray-100">
          <MarkRead />
          {notifications.length === 0 && <p className="p-8 text-center text-gray-400">Sin avisos por ahora.</p>}
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 ${n.read ? "" : "bg-blue-light/50"}`}>
              <p className="font-bold text-sm">{n.title}</p>
              <p className="text-sm text-gray-600">{n.message}</p>
              <p className="mt-0.5 text-xs text-gray-400">{timeAgo(n.createdAt)}{n.auctionId && <> · <Link className="text-blue-brand font-bold hover:underline" href={`/subasta/${n.auctionId}`}>Ver subasta</Link></>}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "perfil" && (
        <div className="space-y-3">
          <ProfileForm name={user.name} phone={user.phone ?? ""} limitCents={user.monthlyLimitCents} />
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
