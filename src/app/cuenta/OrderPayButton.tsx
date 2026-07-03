"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mxn } from "@/lib/format";

export default function OrderPayButton({ orderId, dueCents }: { orderId: string; dueCents: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const pay = async () => {
    setBusy(true);
    const r = await fetch(`/api/orders/${orderId}/pay`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method: "card" }),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok) j.redirect.startsWith("http") ? (window.location.href = j.redirect) : router.push(j.redirect);
  };
  return (
    <button onClick={pay} disabled={busy} className="btn-success shrink-0 !py-2 text-sm">
      {busy ? "…" : `Pagar ${mxn(dueCents)}`}
    </button>
  );
}
