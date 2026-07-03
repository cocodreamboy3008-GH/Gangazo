import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Gangazo — Juega, Puja, Gana",
  description:
    "Subastas en vivo desde $0.01 MXN. TVs, consolas, iPhones y más. Real deals, real fun. La plataforma de subastas más divertida de México.",
};
export const viewport: Viewport = { themeColor: "#FF6B35" };
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔥</text></svg>" />
      </head>
      <body>
        <Header user={user ? { name: user.name, username: user.username, bidBalance: user.bidBalance, admin: user.role === "admin" } : null} />
        <main className="mx-auto max-w-6xl px-4 pb-24 md:pb-12 pt-4 min-h-[80vh]">{children}</main>
        <footer className="hidden md:block border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
          <p className="font-bold text-ink mb-1">GANGAZO · Juega, Puja, Gana 🇲🇽</p>
          <p>Transparente. Justo. De verdad. Cada puja cuesta $0.13 MXN. Si no ganas, usa Cómpralo Ya y tus pujas cuentan como descuento.</p>
          <p className="mt-2">Solo mayores de 18 años · Juega responsablemente · soporte@gangazo.com</p>
        </footer>
        <BottomNav loggedIn={!!user} />
      </body>
    </html>
  );
}
