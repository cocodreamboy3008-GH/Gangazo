"use client";
import Link from "next/link";
import { mxn } from "@/lib/format";
import { useCountdown, fmtCountdown } from "./useCountdown";

export type AuctionListItem = {
  id: string;
  status: string;
  priceCents: number;
  finalCents: number | null;
  totalBids: number;
  startsAt: string;
  timerEndsAt: string | null;
  featured: boolean;
  winnerName: string | null;
  leader: string | null;
  product: { name: string; brand: string; emoji: string; gradient: string; retailCents: number; category: string };
};

export default function AuctionCard({ a, serverNow }: { a: AuctionListItem; serverNow: number }) {
  const target = a.status === "active" ? a.timerEndsAt : a.status === "scheduled" ? a.startsAt : null;
  const secs = useCountdown(target, serverNow);
  const urgent = a.status === "active" && secs !== null && secs <= 3;
  const off = Math.min(99, Math.round(100 - ((a.finalCents ?? a.priceCents) / a.product.retailCents) * 100));

  return (
    <Link href={`/subasta/${a.id}`} className="card group block overflow-hidden transition-all hover:shadow-lift hover:-translate-y-0.5">
      <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${a.product.gradient}`}>
        <span className="text-6xl drop-shadow-lg transition-transform group-hover:scale-110">{a.product.emoji}</span>
        {a.featured && a.status === "active" && (
          <span className="chip absolute left-2 top-2 bg-gold text-ink">⭐ Destacada</span>
        )}
        {a.status === "active" && (
          <span className="chip absolute right-2 top-2 bg-danger text-white">● EN VIVO</span>
        )}
        {off > 0 && a.status !== "scheduled" && (
          <span className="chip absolute bottom-2 right-2 bg-win text-white">-{off}%</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-gray-400">{a.product.brand}</p>
        <h3 className="truncate font-bold">{a.product.name}</h3>
        <div className="mt-1.5 flex items-end justify-between">
          <div>
            <p className="text-[11px] text-gray-400 line-through">{mxn(a.product.retailCents)}</p>
            <p className="text-xl font-extrabold text-blue-brand">{mxn(a.finalCents ?? a.priceCents)}</p>
          </div>
          <div className="text-right">
            {a.status === "active" && secs !== null && (
              <p className={`text-lg font-extrabold tabular-nums ${urgent ? "timer-urgent" : "text-ink"}`}>⏱ {fmtCountdown(secs)}</p>
            )}
            {a.status === "scheduled" && secs !== null && (
              <p className="text-sm font-bold text-premium">Inicia en {fmtCountdown(secs)}</p>
            )}
            {a.status === "ended" && (
              <p className="text-sm font-bold text-win">🏆 {a.winnerName ?? "Sin ganador"}</p>
            )}
            <p className="text-[11px] text-gray-400">{a.totalBids} pujas</p>
          </div>
        </div>
        {a.status === "active" && a.leader && (
          <p className="mt-1 truncate text-xs text-gray-500">👑 <b>{a.leader}</b> va ganando</p>
        )}
        {a.status === "active" && (
          <div className="btn-primary mt-2 w-full !py-2 text-sm">¡PUJAR AHORA!</div>
        )}
      </div>
    </Link>
  );
}
