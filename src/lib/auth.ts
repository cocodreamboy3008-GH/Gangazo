import { cookies } from "next/headers";
import { prisma } from "./db";
import { verifyToken } from "./crypto";

export const COOKIE = "gz_token";

export async function getUser() {
  const t = verifyToken(cookies().get(COOKIE)?.value);
  if (!t) return null;
  const user = await prisma.user.findUnique({ where: { id: t.uid } });
  return user && user.status !== "banned" ? user : null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new AppError("Inicia sesión para continuar", 401);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new AppError("No autorizado", 403);
  return user;
}

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function jsonError(e: unknown) {
  const status = e instanceof AppError ? e.status : 500;
  const message = e instanceof AppError ? e.message : "Ups, algo salió mal. Inténtalo de nuevo.";
  if (status === 500) console.error(e);
  return Response.json({ error: message }, { status });
}
