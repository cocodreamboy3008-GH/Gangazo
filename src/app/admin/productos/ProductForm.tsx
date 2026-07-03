"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GRADIENTS = [
  "from-slate-700 to-slate-900", "from-blue-900 to-indigo-950", "from-indigo-600 to-blue-800",
  "from-red-500 to-rose-700", "from-orange-400 to-red-600", "from-pink-400 to-rose-600",
  "from-teal-500 to-cyan-700", "from-amber-400 to-orange-600", "from-emerald-500 to-green-800",
  "from-violet-600 to-purple-900",
];

export default function ProductForm({ cats }: { cats: { id: string; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", brand: "", retail: "", cost: "", emoji: "📦", categoryId: cats[0]?.id ?? "", description: "" });
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...f,
        retailCents: Math.round(Number(f.retail) * 100),
        costCents: Math.round(Number(f.cost || 0) * 100),
        gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
      }),
    });
    const j = await r.json();
    setMsg(r.ok ? "✅ Producto creado" : j.error);
    if (r.ok) { setF({ ...f, name: "", retail: "", cost: "", description: "" }); router.refresh(); }
  };
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div><label className="label">Nombre</label><input required className="input" value={f.name} onChange={set("name")} /></div>
      <div><label className="label">Marca</label><input className="input" value={f.brand} onChange={set("brand")} /></div>
      <div><label className="label">Precio tienda (MXN)</label><input required type="number" step="0.01" className="input" value={f.retail} onChange={set("retail")} /></div>
      <div><label className="label">Costo (MXN)</label><input type="number" step="0.01" className="input" value={f.cost} onChange={set("cost")} /></div>
      <div><label className="label">Emoji</label><input className="input" value={f.emoji} onChange={set("emoji")} maxLength={4} /></div>
      <div>
        <label className="label">Categoría</label>
        <select className="input" value={f.categoryId} onChange={set("categoryId")}>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2"><label className="label">Descripción</label><input className="input" value={f.description} onChange={set("description")} /></div>
      <div className="flex items-end sm:col-span-2 lg:col-span-4">
        <button className="btn-primary !py-2.5 text-sm">Agregar producto</button>
        {msg && <p className="ml-3 self-center text-sm font-bold">{msg}</p>}
      </div>
    </form>
  );
}
