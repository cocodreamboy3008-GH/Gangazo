"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "🔥", label: "En vivo" },
  { href: "/paquetes", icon: "⚡", label: "Pujas" },
  { href: "/cartera", icon: "👛", label: "Cartera" },
  { href: "/cuenta", icon: "👤", label: "Cuenta" },
];

export default function BottomNav({ loggedIn }: { loggedIn: boolean }) {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex h-[60px] border-t border-gray-200 bg-white md:hidden">
      {items.map((it) => {
        const href = !loggedIn && (it.href === "/cartera" || it.href === "/cuenta") ? "/login" : it.href;
        const active = path === it.href;
        return (
          <Link key={it.href} href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${active ? "text-blue-brand" : "text-gray-400"}`}>
            <span className="text-lg leading-none">{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
