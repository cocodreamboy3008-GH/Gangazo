"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function AuctionAdmin({ products }: { products: { id: string; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ productId: products[0]?.id ?? "", startsAt: "", featured: false, botTarget: "250" });
  const [msg, setMsg] = useState("");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/admin/auctions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, startsAt: f.startsAt || undefined, botTarget: Number(f.botTarget) }),
    });
    const j = await r.json();
    setMsg(r.ok ? "✅ Subasta creada" : j.error);
    if (r.ok) router.refresh();
  };

  return (
    <form onSubmit={create} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <label className="label">Producto</label>
        <select className="input" value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Inicio (vacío = ahora)</label>
        <input type="datetime-local" className="input" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} />
      </div>
      <div>
        <label className="label">Meta bots</label>
        <input type="number" className="input" value={f.botTarget} onChange={(e) => setF({ ...f, botTarget: e.target.value })} />
      </div>
      <div className="flex items-end gap-2">
        <label className="flex items-center gap-1.5 pb-3 text-sm font-bold">
          <input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> ⭐
        </label>
        <button className="btn-primary flex-1 !py-2.5 text-sm">Crear</button>
      </div>
      {msg && <p className="text-sm font-bold sm:col-span-2 lg:col-span-5">{msg}</p>}
    </form>
  );
}

export function Cancel({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        if (!confirm("¿Cancelar esta subasta?")) return;
        await fetch("/api/admin/auctions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "cancel" }) });
        router.refresh();
      }}
      className="chip bg-danger/10 text-danger hover:bg-danger/20">
      Cancelar
    </button>
  );
}

export default AuctionAdmin;
