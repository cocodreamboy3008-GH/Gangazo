import { prisma } from "@/lib/db";
import { requireUser, jsonError, AppError } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/crypto";

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const { name, phone, monthlyLimitCents, currentPassword, newPassword } = await req.json();

    const data: Record<string, unknown> = {};
    if (name) data.name = String(name).slice(0, 100);
    if (phone !== undefined) data.phone = String(phone).slice(0, 20) || null;
    if (monthlyLimitCents) {
      const v = Math.floor(Number(monthlyLimitCents));
      if (v < 10000 || v > 10000000) throw new AppError("El límite debe estar entre $100 y $100,000 MXN");
      data.monthlyLimitCents = v;
    }
    if (newPassword) {
      if (!verifyPassword(currentPassword || "", user.passwordHash))
        throw new AppError("Tu contraseña actual no coincide");
      if (newPassword.length < 8) throw new AppError("La nueva contraseña debe tener al menos 8 caracteres");
      data.passwordHash = hashPassword(newPassword);
    }

    await prisma.user.update({ where: { id: user.id }, data });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
