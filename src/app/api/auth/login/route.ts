import { prisma } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/crypto";
import { COOKIE, AppError, jsonError } from "@/lib/auth";
import { cookies } from "next/headers";

// naive in-memory rate limit: 8 attempts / 15 min per email
const attempts = new Map<string, { n: number; t: number }>();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const key = (email || "").toLowerCase();
    const a = attempts.get(key);
    if (a && a.n >= 8 && Date.now() - a.t < 9e5)
      throw new AppError("Demasiados intentos. Espera 15 minutos.", 429);

    const user = await prisma.user.findUnique({ where: { email: key } });
    if (!user || !verifyPassword(password || "", user.passwordHash)) {
      attempts.set(key, { n: (a?.n || 0) + 1, t: Date.now() });
      throw new AppError("Correo o contraseña incorrectos", 401);
    }
    if (user.status === "banned") throw new AppError("Tu cuenta fue suspendida. Contacta a soporte.", 403);

    attempts.delete(key);
    cookies().set(COOKIE, signToken({ uid: user.id }), { httpOnly: true, sameSite: "lax", maxAge: 30 * 86400, path: "/" });
    return Response.json({ ok: true, admin: user.role === "admin" });
  } catch (e) {
    return jsonError(e);
  }
}
