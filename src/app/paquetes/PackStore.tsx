"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PACKS, PAYMENT_METHODS } from "@/lib/config";
import { mxn } from "@/lib/format";

export default function PackStore({ loggedIn, balance }: { loggedIn: boolean; balance: number }) {
  const router = useRouter();
  const [pack, setPack] = useState<string>("popular");
  const [method, setMethod] = useState<string>("card");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = PACKS.find((p) => p.id === pack)!;

  const buy = async () => {
    if (!loggedIn) return router.push("/login?next=/paquetes");
    setBusy(true); setErr("");
    const r = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId: pack, method }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(j.error);
    if (j.redirect.startsWith("http")) window.location.href = j.redirect;
    else router.push(j.redirect);
  };

  return (
    <div className="space-y-5">
      {loggedIn && <p className="chip bg-gold/20 border border-gold text-ink">⚡ Tienes {balance} pujas</p>}

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PACKS.map((p) => {
          const per = p.priceCents / p.bids;
          const active = pack === p.id;
          return (
            <button key={p.id} onClick={() => setPack(p.id)}
              className={`card relative p-4 text-center transition ${active ? "ring-2 ring-brand shadow-lift" : "hover:shadow-lift"}`}>
              {p.tag && <span className="chip absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand text-white whitespace-nowrap">{p.tag}</span>}
              <p className="mt-1 text-2xl font-extrabold text-blue-brand">{p.bids}</p>
              <p className="text-xs font-bold text-gray-400">PUJAS</p>
              <p className="mt-1.5 text-lg font-extrabold">{mxn(p.priceCents)}</p>
              <p className="text-[11px] text-gray-400">{mxn(per)} por puja</p>
            </button>
          );
        })}
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-bold">¿Cómo quieres pagar?</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {PAYMENT_METHODS.map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition ${method === m.id ? "border-blue-brand bg-blue-light" : "border-gray-200 hover:border-gray-300"}`}>
              <span className="text-2xl">{m.icon}</span>
              <span>
                <span className="block text-sm font-bold">{m.name}</span>
                <span className="block text-xs text-gray-500">{m.note}</span>
              </span>
            </button>
          ))}
        </div>
        {err && <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm font-bold text-danger">{err}</p>}
        <button onClick={buy} disabled={busy} className="btn-success mt-4 w-full !py-4 !text-lg">
          {busy ? "Procesando…" : `Pagar ${mxn(selected.priceCents)} — recibir ${selected.bids} pujas`}
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">🔒 Pago seguro · Las pujas se acreditan al confirmar el pago</p>
      </div>
    </div>
  );
}
