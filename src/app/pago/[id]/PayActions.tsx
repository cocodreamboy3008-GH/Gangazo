"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PayActions({ paymentId, done, demo, isPack }: { paymentId: string; done: boolean; demo: boolean; isPack: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const confirm = async () => {
    setBusy(true); setErr("");
    const r = await fetch(`/api/payments/${paymentId}/confirm`, { method: "POST" });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(j.error);
    router.refresh();
  };

  if (done)
    return (
      <div className="mt-5 space-y-2">
        <Link href={isPack ? "/" : "/cuenta?tab=pedidos"} className="btn-primary w-full">
          {isPack ? "🔥 ¡A pujar!" : "Ver mi pedido"}
        </Link>
        <Link href="/cartera" className="btn-ghost w-full">Ver mi cartera</Link>
      </div>
    );

  return (
    <div className="mt-5 space-y-2">
      {demo && (
        <>
          <p className="chip bg-premium/10 text-premium w-full justify-center">Modo demo: sin claves de pago reales</p>
          <button onClick={confirm} disabled={busy} className="btn-success w-full">
            {busy ? "Confirmando…" : "✓ Simular pago exitoso"}
          </button>
        </>
      )}
      {!demo && <button onClick={() => router.refresh()} className="btn-secondary w-full">Ya pagué — actualizar estado</button>}
      {err && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm font-bold text-danger">{err}</p>}
      <Link href="/paquetes" className="block text-sm text-gray-400 hover:underline">Cancelar y volver</Link>
    </div>
  );
}
