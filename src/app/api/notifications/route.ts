import { prisma } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ]);
    return Response.json({ items, unread });
  } catch (e) {
    return jsonError(e);
  }
}

// mark all read
export async function POST() {
  try {
    const user = await requireUser();
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
