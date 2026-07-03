import Link from "next/link";
import Logo from "./Logo";
import NotifBell from "./NotifBell";

export default function Header({
  user,
}: {
  user: { name: string; username: string; bidBalance: number; admin: boolean } | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label="Gangazo inicio"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-bold text-gray-600">
          <Link href="/" className="hover:text-brand">Subastas</Link>
          <Link href="/paquetes" className="hover:text-brand">Comprar pujas</Link>
          <Link href="/como-funciona" className="hover:text-brand">Cómo funciona</Link>
          {user?.admin && <Link href="/admin" className="text-premium hover:underline">Admin</Link>}
        </nav>
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/paquetes" className="chip bg-gold/20 text-ink border border-gold hover:bg-gold/40" title="Tus pujas disponibles">
              ⚡ {user.bidBalance} <span className="hidden sm:inline">pujas</span>
            </Link>
            <NotifBell />
            <Link href="/cuenta" className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-brand text-sm font-bold text-white" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost !py-1.5 !px-4 text-sm">Entrar</Link>
            <Link href="/registro" className="btn-primary !py-1.5 !px-4 text-sm">50 pujas GRATIS</Link>
          </div>
        )}
      </div>
    </header>
  );
}
