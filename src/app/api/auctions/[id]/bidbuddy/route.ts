import { prisma } from "@/lib/db";
import { requireUser, jsonError, AppError } from "@/lib/auth";

// BidBuddy: automatic bidding up to N bids
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { bids } = await req.json();
    const n = Math.floor(Number(bids));
    if (!n || n < 1 || n > 500) throw new AppError("Elige entre 1 y 500 pujas automáticas");
    if (user.bidBalance < 1) throw new AppError("No tienes pujas. ¡Recarga primero!", 402);

    const buddy = await prisma.bidBuddy.upsert({
      where: { userId_auctionId: { userId: user.id, auctionId: params.id } },
      update: { bidsLeft: n },
      create: { userId: user.id, auctionId: params.id, bidsLeft: n },
    });
    return Response.json({ ok: true, bidsLeft: buddy.bidsLeft });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    await prisma.bidBuddy.deleteMany({ where: { userId: user.id, auctionId: params.id } });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
