import { prisma } from "@/lib/db";
import { requireAdmin, jsonError, AppError } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    if (!b.productId) throw new AppError("Elige un producto");
    const startsAt = b.startsAt ? new Date(b.startsAt) : new Date();
    const a = await prisma.auction.create({
      data: {
        productId: b.productId,
        startsAt,
        status: "scheduled",
        featured: !!b.featured,
        botsEnabled: b.botsEnabled !== false,
        botTarget: Math.floor(Number(b.botTarget || 250)),
      },
    });
    return Response.json({ ok: true, id: a.id });
  } catch (e) {
    return jsonError(e);
  }
}

// cancel an auction
export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const { id, action } = await req.json();
    if (action === "cancel") {
      await prisma.auction.updateMany({
        where: { id, status: { in: ["scheduled", "active"] } },
        data: { status: "cancelled", endedAt: new Date() },
      });
      return Response.json({ ok: true });
    }
    throw new AppError("Acción inválida");
  } catch (e) {
    return jsonError(e);
  }
}
