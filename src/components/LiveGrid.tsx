"use client";
import { useEffect, useState } from "react";
import AuctionCard, { AuctionListItem } from "./AuctionCard";

const TABS = [
  { id: "active", label: "🔥 En vivo" },
  { id: "scheduled", label: "🗓 Próximas" },
  { id: "ended", label: "🏆 Ganadores" },
];

export default function LiveGrid({ cats }: { cats: { name: string; slug: string; emoji: string }[] }) {
  const [tab, setTab] = useState("active");
  const [cat, setCat] = useState("");
  const [data, setData] = useState<{ now: number; auctions: AuctionListItem[] } | null>(null);

  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch(`/api/auctions?status=${tab}${cat ? `&cat=${cat}` : ""}`)
        .then((r) => r.json())
        .then((d) => !stop && setData(d))
        .catch(() => {});
    load();
    const t = setInterval(load, tab === "active" ? 2500 : 15000);
    return () => { stop = true; clearInterval(t); };
  }, [tab, cat]);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`chip !px-4 !py-2 !text-sm transition ${tab === t.id ? "bg-blue-brand text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-brand"}`}>
            {t.label}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />
        <div className="flex gap-1.5 overflow-x-auto">
          <button onClick={() => setCat("")} className={`chip whitespace-nowrap ${!cat ? "bg-brand text-white" : "bg-white border border-gray-200 text-gray-600"}`}>Todo</button>
          {cats.map((c) => (
            <button key={c.slug} onClick={() => setCat(cat === c.slug ? "" : c.slug)}
              className={`chip whitespace-nowrap ${cat === c.slug ? "bg-brand text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {!data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
        </div>
      ) : data.auctions.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          <p className="text-4xl mb-2">🌵</p>
          <p className="font-bold">Nada por aquí todavía…</p>
          <p className="text-sm">Vuelve pronto, siempre hay nuevas gangas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {data.auctions.map((a) => <AuctionCard key={a.id} a={a} serverNow={data.now} />)}
        </div>
      )}
    </section>
  );
}
