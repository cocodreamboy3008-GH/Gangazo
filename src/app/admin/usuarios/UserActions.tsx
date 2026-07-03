"use client";
import { useRouter } from "next/navigation";

export default function UserActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const act = async (action: string, bids?: number) => {
    await fetch("/api/admin/users", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, bids }),
    });
    router.refresh();
  };
  return (
    <span className="flex gap-1.5">
      <button onClick={() => { const n = prompt("¿Cuántas pujas de cortesía?", "25"); if (n) act("credit_bids", Number(n)); }}
        className="chip bg-blue-light text-blue-brand hover:bg-blue-brand hover:text-white">+pujas</button>
      {status === "active" ? (
        <button onClick={() => act("suspend")} className="chip bg-gold/20 text-yellow-700 hover:bg-gold/40">Suspender</button>
      ) : (
        <button onClick={() => act("activate")} className="chip bg-win/15 text-win hover:bg-win/30">Activar</button>
      )}
      {status !== "banned" && (
        <button onClick={() => confirm("¿Banear permanentemente?") && act("ban")} className="chip bg-danger/10 text-danger hover:bg-danger/20">Ban</button>
      )}
    </span>
  );
}
