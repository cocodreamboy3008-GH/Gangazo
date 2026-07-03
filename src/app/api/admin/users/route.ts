import { prisma } from "@/lib/db";
import { requireAdmin, jsonError, AppError } from "@/lib/auth";

// Moderation + support actions on a user
export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    const { id, action, bids } = await req.json();
    if (id === admin.id && (action === "suspend" || action === "ban"))
      throw new AppError("No puedes suspenderte a ti mismo");

    if (action === "suspend") await prisma.user.update({ where: { id }, data: { status: "suspended" } });
    else if (action === "activate") await prisma.user.update({ where: { id }, data: { status: "active" } });
    else if (action === "ban") await prisma.user.update({ where: { id }, data: { status: "banned" } });
    else if (action === "credit_bids") {
      const n = Math.floor(Number(bids));
      if (!n || n < 1 || n > 10000) throw new AppError("Cantidad inválida");
      await prisma.user.update({ where: { id }, data: { bidBalance: { increment: n } } });
      await prisma.notification.create({
        data: { userId: id, type: "system", title: "🎁 Pujas de cortesía", message: `El equipo Gangazo te acreditó ${n} pujas.` },
      });
    } else throw new AppError("Acción inválida");

    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
