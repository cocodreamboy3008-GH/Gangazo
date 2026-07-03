"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}
      className="btn-ghost w-full !border-danger !text-danger hover:!bg-danger/5">
      Cerrar sesión
    </button>
  );
}
