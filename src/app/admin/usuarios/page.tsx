import { prisma } from "@/lib/db";
import { mxn, fmtDate } from "@/lib/format";
import UserActions from "./UserActions";

export const dynamic = "force-dynamic";

export default async function AdminUsuarios() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { bids: true, orders: true } } },
  });
  return (
    <div className="card divide-y divide-gray-100 text-sm">
      <h2 className="p-4 font-bold">Usuarios ({users.length})</h2>
      {users.map((u) => (
        <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
          <span>
            <b>@{u.username}</b> <span className="text-gray-400">· {u.email} · desde {fmtDate(u.createdAt)}</span>
            <span className="block text-xs text-gray-400">
              ⚡ {u.bidBalance} pujas · {u._count.bids} pujas hechas · {u._count.orders} pedidos · gastado {mxn(u.totalSpendCents)}
              {u.role === "admin" && " · 👑 admin"}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className={`chip ${u.status === "active" ? "bg-win/15 text-win" : u.status === "suspended" ? "bg-gold/20 text-yellow-700" : "bg-danger/10 text-danger"}`}>{u.status}</span>
            <UserActions id={u.id} status={u.status} />
          </span>
        </div>
      ))}
    </div>
  );
}
