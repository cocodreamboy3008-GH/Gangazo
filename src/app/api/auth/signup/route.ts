import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/crypto";
import { COOKIE, AppError, jsonError } from "@/lib/auth";
import { SIGNUP_BONUS_BIDS, REFERRAL_BONUS_BIDS } from "@/lib/config";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, name, username, referral } = await req.json();
    if (!email?.includes("@") || !name || !username) throw new AppError("Completa todos los campos");
    if ((password || "").length < 8) throw new AppError("La contraseña debe tener al menos 8 caracteres");
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) throw new AppError("Usuario: 3-20 letras, números o _");

    const clash = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
    });
    if (clash) throw new AppError("Ese correo o usuario ya está registrado. ¿Quieres iniciar sesión?");

    const referrer = referral
      ? await prisma.user.findUnique({ where: { referralCode: referral.toUpperCase() } })
      : null;

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        name,
        username: username.toLowerCase(),
        bidBalance: SIGNUP_BONUS_BIDS,
        referralCode: username.slice(0, 4).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
        referredById: referrer?.id,
      },
    });

    if (referrer) {
      await prisma.user.update({ where: { id: referrer.id }, data: { bidBalance: { increment: REFERRAL_BONUS_BIDS } } });
      await prisma.notification.create({
        data: {
          userId: referrer.id, type: "system", title: "🎁 ¡Referido exitoso!",
          message: `${username} se registró con tu código. Ganaste ${REFERRAL_BONUS_BIDS} pujas.`,
        },
      });
    }
    await prisma.notification.create({
      data: {
        userId: user.id, type: "system", title: `🎉 ¡Bienvenido a Gangazo!`,
        message: `Te regalamos ${SIGNUP_BONUS_BIDS} pujas para empezar. Juega, Puja, Gana.`,
      },
    });

    cookies().set(COOKIE, signToken({ uid: user.id }), { httpOnly: true, sameSite: "lax", maxAge: 30 * 86400, path: "/" });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
