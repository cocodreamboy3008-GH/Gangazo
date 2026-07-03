import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user || user.role !== "admin") redirect("/login?next=/admin");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-xl font-extrabold text-premium">⚙️ Admin</h1>
        <Link href="/admin" className="chip bg-white border border-gray-200 hover:border-premium">Dashboard</Link>
        <Link href="/admin/subastas" className="chip bg-white border border-gray-200 hover:border-premium">Subastas</Link>
        <Link href="/admin/productos" className="chip bg-white border border-gray-200 hover:border-premium">Productos</Link>
        <Link href="/admin/usuarios" className="chip bg-white border border-gray-200 hover:border-premium">Usuarios</Link>
      </div>
      {children}
    </div>
  );
}
