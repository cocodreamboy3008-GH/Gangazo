import { prisma } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/auth";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const key = { userId_auctionId: { userId: user.id, auctionId: params.id } };
    const existing = await prisma.watch.findUnique({ where: key });
    if (existing) {
      await prisma.watch.delete({ where: key });
      return Response.json({ watching: false });
    }
    await prisma.watch.create({ data: { userId: user.id, auctionId: params.id } });
    return Response.json({ watching: true });
  } catch (e) {
    return jsonError(e);
  }
}
