import { prisma } from "@/lib/db";
import { requireAdmin, jsonError, AppError } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    if (!b.name || !b.retailCents || !b.categoryId) throw new AppError("Nombre, precio y categoría son obligatorios");
    const p = await prisma.product.create({
      data: {
        name: b.name, brand: b.brand || "Genérico", description: b.description || "",
        retailCents: Math.floor(Number(b.retailCents)), costCents: Math.floor(Number(b.costCents || 0)),
        emoji: b.emoji || "📦", gradient: b.gradient || "from-blue-brand to-premium",
        categoryId: b.categoryId,
      },
    });
    return Response.json({ ok: true, id: p.id });
  } catch (e) {
    return jsonError(e);
  }
}
