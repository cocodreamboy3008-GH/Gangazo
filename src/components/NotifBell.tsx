"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotifBell() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const load = () => fetch("/api/notifications").then((r) => r.ok ? r.json() : null).then((d) => d && setUnread(d.unread)).catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);
  return (
    <Link href="/cuenta?tab=avisos" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-soft" title="Notificaciones">
      🔔
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
