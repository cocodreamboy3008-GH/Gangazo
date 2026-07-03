"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mxn, timeAgo } from "@/lib/format";
import { useCountdown, fmtCountdown } from "@/components/useCountdown";

type Detail = {
  now: number;
  auction: {
    id: string; status: string; priceCents: number; finalCents: number | null;
    totalBids: number; startsAt: string; timerEndsAt: string | null; winnerName: string | null;
    product: { name: string; brand: string; emoji: string; gradient: string; retailCents: number; description: string; category: string };
  };
  bids: { id: string; name: string; priceCents: number; at: string; mine: boolean }[];
  me: { username: string; bidBalance: number; myBids: number; binDiscountCents: number; watching: boolean; buddy: { bidsLeft: number } | null } | null;
};

export default function AuctionRoom({ id }: { id: string }) {
  const router = useRouter();
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState("");
  const [flash, setFlash] = useState(false);
  const [buddyN, setBuddyN] = useState(20);
  const [busy, setBusy] = useState(false);
  const priceRef = useRef(0);

  const load = useCallback(() => {
    fetch(`/api/auctions/${id}`).then((r) => r.json()).then(setD).catch(() => {});
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Live updates via SSE
  useEffect(() => {
    const es = new EventSource(`/api/auctions/${id}/stream`);
    es.onmessage = (m) => {
      const e = JSON.parse(m.data);
      setD((prev) => {
        if (!prev) return prev;
        if (e.priceCents !== priceRef.current) { setFlash(true); setTimeout(() => setFlash(false), 300); }
        const bids = e.type === "bid"
          ? [{ id: String(Math.random()), name: e.leader ?? "—", priceCents: e.priceCents, at: new Date().toISOString(), mine: !!prev.me && e.leader === prev.me.username }, ...prev.bids].slice(0, 25)
          : prev.bids;
        return {
          ...prev, now: e.now, bids,
          auction: { ...prev.auction, status: e.status, priceCents: e.priceCents, totalBids: e.totalBids, timerEndsAt: e.timerEndsAt, finalCents: e.finalCents ?? prev.auction.finalCents, winnerName: e.winnerName ?? prev.auction.winnerName },
        };
      });
    };
    return () => es.close();
  }, [id]);

  const a = d?.auction;
  priceRef.current = a?.priceCents ?? 0;
  const target = a?.status === "active" ? a.timerEndsAt : a?.status === "scheduled" ? a.startsAt : null;
  const secs = useCountdown(target ?? null, d?.now ?? Date.now());

  if (!d || !a) return <div className="card h-96 animate-pulse bg-gray-100" />;

  const me = d.me;
  const leader = d.bids[0]?.name ?? null;
  const iLead = !!me && leader === me.username;
  const urgent = a.status === "active" && secs !== null && secs <= 3;
  const binCents = Math.max(100, a.product.retailCents - (me?.binDiscountCents ?? 0));

  const act = async (fn: () => Promise<Response>) => {
    setErr(""); setBusy(true);
    try {
      const r = await fn();
      const j = await r.json();
      if (!r.ok) setErr(j.error || "Ups, algo salió mal");
      else load();
    } catch { setErr("Sin conexión. Inténtalo de nuevo."); }
    setBusy(false);
  };

  const bid = () => act(() => fetch(`/api/auctions/${id}/bid`, { method: "POST" }));
  const watch = () => act(() => fetch(`/api/auctions/${id}/watch`, { method: "POST" }));
  const setBuddy = () => act(() => fetch(`/api/auctions/${id}/bidbuddy`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bids: buddyN }) }));
  const stopBuddy = () => act(() => fetch(`/api/auctions/${id}/bidbuddy`, { method: "DELETE" }));
  const bin = async () => {
    setBusy(true);
    const r = await fetch(`/api/auctions/${id}/bin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method: "card" }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(j.error);
    router.push(j.redirect);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* Product + live panel */}
      <div className="space-y-4">
        <div className="card overflow-hidden">
          <div className={`relative flex h-56 md:h-72 items-center justify-center bg-gradient-to-br ${a.product.gradient}`}>
            <span className="text-8xl md:text-9xl drop-shadow-xl">{a.product.emoji}</span>
            {a.status === "active" && <span className="chip absolute right-3 top-3 bg-danger text-white">● EN VIVO</span>}
            {a.status === "ended" && <span className="chip absolute right-3 top-3 bg-ink text-white">Finalizada</span>}
          </div>
          <div className="p-4 md:p-5">
            <p className="text-xs font-bold text-gray-400">{a.product.brand} · {a.product.category}</p>
            <h1 className="text-xl md:text-2xl font-extrabold">{a.product.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{a.product.description}</p>
            <p className="mt-2 text-sm">Precio de tienda: <s className="text-gray-400">{mxn(a.product.retailCents)}</s></p>
          </div>
        </div>

        {/* Bid history */}
        <div className="card p-4">
          <h2 className="mb-2 font-bold">Historial de pujas</h2>
          <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto text-sm">
            {d.bids.map((b, i) => (
              <li key={b.id} className={`flex items-center justify-between py-1.5 ${b.mine ? "font-bold text-blue-brand" : ""}`}>
                <span>{i === 0 && a.status === "active" ? "👑" : "•"} {b.name} {b.mine && "(tú)"}</span>
                <span className="tabular-nums text-gray-500">{mxn(b.priceCents)} · {timeAgo(b.at)}</span>
              </li>
            ))}
            {d.bids.length === 0 && <li className="py-2 text-gray-400">Aún no hay pujas. ¡Sé el primero!</li>}
          </ul>
        </div>
      </div>

      {/* Action panel */}
      <div className="space-y-3 lg:sticky lg:top-20 self-start">
        <div className="card p-5 text-center">
          {a.status === "scheduled" ? (
            <>
              <p className="text-sm font-bold text-premium">🗓 La subasta inicia en</p>
              <p className="my-2 text-4xl font-extrabold tabular-nums">{secs !== null ? fmtCountdown(secs) : "—"}</p>
              <p className="text-sm text-gray-500">Precio inicial: $0.01 · ¡Prepárate!</p>
            </>
          ) : a.status === "ended" || a.status === "cancelled" ? (
            <>
              <p className="text-4xl">🏆</p>
              <p className="mt-1 font-bold">{a.winnerName ? `Ganó ${a.winnerName}` : "Subasta finalizada"}</p>
              <p className="text-2xl font-extrabold text-win">{mxn(a.finalCents ?? a.priceCents)}</p>
              <p className="text-xs text-gray-400">precio final · {a.totalBids} pujas</p>
            </>
          ) : (
            <>
              <p className={`text-6xl font-extrabold tabular-nums ${urgent ? "timer-urgent" : ""}`}>
                {secs !== null ? Math.ceil(secs) : "–"}
              </p>
              <p className="mb-3 text-xs font-bold text-gray-400">SEGUNDOS</p>
              <p className={`text-3xl font-extrabold text-blue-brand ${flash ? "animate-pop" : ""}`}>{mxn(a.priceCents)}</p>
              <p className="text-xs text-gray-400">{a.totalBids} pujas · sube $0.01 por puja</p>
              {leader && (
                <p className={`mt-2 rounded-lg px-2 py-1.5 text-sm font-bold ${iLead ? "bg-win/15 text-win" : "bg-soft"}`}>
                  {iLead ? "✅ ¡Vas ganando! Aguanta…" : <>👑 {leader} va ganando</>}
                </p>
              )}
              {me ? (
                <>
                  <button onClick={bid} disabled={busy || iLead} className="btn-primary mt-3 w-full !py-4 !text-lg">
                    ⚡ PUJAR ({me.bidBalance} disponibles)
                  </button>
                  {me.bidBalance < 10 && (
                    <Link href="/paquetes" className="mt-2 block text-sm font-bold text-brand hover:underline">
                      Te quedan pocas pujas → recarga aquí
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/registro" className="btn-primary mt-3 w-full !py-4">Regístrate y puja GRATIS</Link>
              )}
            </>
          )}
          {err && <p className="mt-2 rounded-md bg-danger/10 px-2 py-1.5 text-sm font-bold text-danger">{err}</p>}
        </div>

        {me && a.status === "active" && (
          <div className="card p-4">
            <h3 className="font-bold">🤖 Puja automática</h3>
            <p className="text-xs text-gray-500">Pujamos por ti en el último segundo cuando alguien te supere.</p>
            {me.buddy ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="chip bg-premium/10 text-premium">Activa · quedan {me.buddy.bidsLeft} pujas</span>
                <button onClick={stopBuddy} disabled={busy} className="text-sm font-bold text-danger hover:underline">Detener</button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <input type="number" min={1} max={500} value={buddyN} onChange={(e) => setBuddyN(+e.target.value)} className="input !w-24" />
                <button onClick={setBuddy} disabled={busy} className="btn-secondary flex-1 !py-2 text-sm">Activar</button>
              </div>
            )}
          </div>
        )}

        {me && a.status !== "cancelled" && (
          <div className="card p-4">
            <h3 className="font-bold">🛍 Cómpralo Ya</h3>
            <p className="text-xs text-gray-500">
              ¿No ganaste? Llévatelo al precio de tienda y tus {me.myBids} pujas usadas aquí ({mxn(me.binDiscountCents)}) se descuentan. Nunca pierdes.
            </p>
            <button onClick={bin} disabled={busy} className="btn-success mt-2 w-full !py-2.5 text-sm">
              Comprar por {mxn(binCents)}
            </button>
          </div>
        )}

        {me && (
          <button onClick={watch} disabled={busy} className="btn-ghost w-full">
            {me.watching ? "💔 Quitar de favoritos" : "❤️ Agregar a favoritos"}
          </button>
        )}
      </div>
    </div>
  );
}
