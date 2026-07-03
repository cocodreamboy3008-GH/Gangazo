"use client";
import { useEffect, useMemo, useState } from "react";

// Ticks 4×/s. The clock-skew offset is captured once per server timestamp so
// the countdown runs on the server's clock, not the client's.
export function useCountdown(target: string | null, serverNow: number) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const offset = useMemo(() => serverNow - Date.now(), [serverNow]);
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  return Math.max(0, (new Date(target).getTime() - Date.now() - offset) / 1000);
}

export function fmtCountdown(secs: number) {
  if (secs >= 3600) return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  if (secs >= 60) return `${Math.floor(secs / 60)}m ${Math.floor(secs % 60)}s`;
  return `${Math.ceil(secs)}s`;
}
