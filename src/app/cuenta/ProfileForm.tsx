"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ name, phone, limitCents }: { name: string; phone: string; limitCents: number }) {
  const router = useRouter();
  const [f, setF] = useState({ name, phone, limit: String(limitCents / 100), currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await fetch("/api/user/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.name, phone: f.phone,
        monthlyLimitCents: Math.round(Number(f.limit) * 100),
        currentPassword: f.currentPassword || undefined,
        newPassword: f.newPassword || undefined,
      }),
    });
    const j = await r.json();
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "✅ Cambios guardados" } : { ok: false, text: j.error });
    if (r.ok) router.refresh();
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <h2 className="font-extrabold">Mi perfil</h2>
      <div><label className="label">Nombre</label><input className="input" value={f.name} onChange={set("name")} /></div>
      <div><label className="label">Teléfono (WhatsApp)</label><input className="input" value={f.phone} onChange={set("phone")} placeholder="+52 55 1234 5678" /></div>
      <div>
        <label className="label">Límite de gasto mensual (MXN) 💚</label>
        <input type="number" min={100} max={100000} className="input" value={f.limit} onChange={set("limit")} />
        <p className="mt-1 text-xs text-gray-400">Tu candado de juego responsable. Nadie puede gastar más de esto al mes.</p>
      </div>
      <hr className="border-gray-100" />
      <p className="text-sm font-bold">Cambiar contraseña <span className="font-normal text-gray-400">(opcional)</span></p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input type="password" className="input" placeholder="Contraseña actual" value={f.currentPassword} onChange={set("currentPassword")} />
        <input type="password" className="input" placeholder="Nueva contraseña" value={f.newPassword} onChange={set("newPassword")} />
      </div>
      {msg && <p className={`rounded-md px-3 py-2 text-sm font-bold ${msg.ok ? "bg-win/15 text-win" : "bg-danger/10 text-danger"}`}>{msg.text}</p>}
      <button disabled={busy} className="btn-primary">{busy ? "Guardando…" : "Guardar cambios"}</button>
    </form>
  );
}
