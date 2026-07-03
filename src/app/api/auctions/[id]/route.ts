import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { BID_COST_CENTS } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  const a = await prisma.auction.findUnique({
    where: { id: params.id },
    include: {
      product: { include: { category: true } },
      bids: { orderBy: { createdAt: "desc" }, take: 25, include: { user: { select: { username: true } } } },
    },
  });
  if (!a) return Response.json({ error: "No encontrada" }, { status: 404 });

  const [myBids, watch, buddy] = user
    ? await Promise.all([
        prisma.bid.count({ where: { auctionId: a.id, userId: user.id } }),
        prisma.watch.findUnique({ where: { userId_auctionId: { userId: user.id, auctionId: a.id } } }),
        prisma.bidBuddy.findUnique({ where: { userId_auctionId: { userId: user.id, auctionId: a.id } } }),
      ])
    : [0, null, null];

  return Response.json({
    now: Date.now(),
    auction: {
      id: a.id, status: a.status, priceCents: a.priceCents, finalCents: a.finalCents,
      totalBids: a.totalBids, startsAt: a.startsAt, timerEndsAt: a.timerEndsAt,
      winnerName: a.winnerName,
      product: {
        name: a.product.name, brand: a.product.brand, emoji: a.product.emoji,
        gradient: a.product.gradient, retailCents: a.product.retailCents,
        description: a.product.description, category: a.product.category.name,
      },
    },
    bids: a.bids.map((b) => ({
      id: b.id, name: b.botName ?? b.user?.username ?? "—", priceCents: b.priceCents,
      at: b.createdAt, mine: !!user && b.userId === user.id,
    })),
    me: user
      ? {
          username: user.username, bidBalance: user.bidBalance, myBids,
          binDiscountCents: myBids * BID_COST_CENTS,
          watching: !!watch,
          buddy: buddy ? { bidsLeft: buddy.bidsLeft } : null,
        }
      : null,
  });
}
