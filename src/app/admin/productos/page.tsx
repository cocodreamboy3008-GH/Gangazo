import { prisma } from "@/lib/db";
import { mxn } from "@/lib/format";
import ProductForm from "./ProductForm";

export const dynamic = "force-dynamic";

export default async function AdminProductos() {
  const [products, cats] = await Promise.all([
    prisma.product.findMany({ include: { category: true, _count: { select: { auctions: true } } }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="space-y-4">
      <ProductForm cats={cats.map((c) => ({ id: c.id, name: `${c.emoji} ${c.name}` }))} />
      <div className="card divide-y divide-gray-100 text-sm">
        <h2 className="p-4 font-bold">Catálogo ({products.length})</h2>
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3">
            <span className="flex items-center gap-2">
              <span className="text-xl">{p.emoji}</span>
              <span><b>{p.name}</b> <span className="text-gray-400">· {p.brand} · {p.category.name}</span></span>
            </span>
            <span className="text-right">
              <b>{mxn(p.retailCents)}</b>
              <span className="block text-xs text-gray-400">{p._count.auctions} subastas</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
