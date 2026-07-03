"use client";
import { useEffect } from "react";

// Marks all notifications read when the Avisos tab opens
export default function MarkRead() {
  useEffect(() => { fetch("/api/notifications", { method: "POST" }).catch(() => {}); }, []);
  return null;
}
