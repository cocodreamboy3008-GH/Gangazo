import { prisma } from "./db";
import { AppError } from "./auth";
import { emitAuction } from "./bus";
import { TIMER_SECONDS } from "./config";

// Atomic bid placement for humans and bots. Emits the live event on success.
export async function placeBid(auctionId: string, by: { userId?: string; username?: string; botName?: string }) {
  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const a = await tx.auction.findUnique({ where: { id: auctionId } });
    if (!a || a.status !== "active" || !a.timerEndsAt || a.timerEndsAt <= now)
      throw new AppError("La subasta ya terminó 😅");

    const prev = await tx.bid.findFirst({ where: { auctionId }, orderBy: { createdAt: "desc" } });
    if (by.userId && prev?.userId === by.userId)
      throw new AppError("¡Ya vas ganando! Espera a que alguien más puje.");

    if (by.userId) {
      const ok = await tx.user.updateMany({
        where: { id: by.userId, bidBalance: { gt: 0 }, status: "active" },
        data: { bidBalance: { decrement: 1 } },
      });
      if (ok.count === 0) throw new AppError("Te quedaste sin pujas. ¡Recarga tu paquete!", 402);
    }

    const priceCents = a.priceCents + 1;
    const timerEndsAt = new Date(now.getTime() + TIMER_SECONDS * 1000);
    await tx.auction.update({
      where: { id: auctionId },
      data: { priceCents, totalBids: { increment: 1 }, timerEndsAt },
    });
    await tx.bid.create({
      data: { auctionId, userId: by.userId ?? null, botName: by.botName ?? null, priceCents },
    });
    return { priceCents, totalBids: a.totalBids + 1, timerEndsAt, prev };
  });

  // Outbid notification (fire and forget)
  const prevUid = result.prev?.userId;
  if (prevUid && prevUid !== by.userId) {
    prisma.notification
      .create({
        data: {
          userId: prevUid,
          type: "outbid",
          title: "¡Te superaron! 😮",
          message: "Alguien pujó después de ti. ¡Regresa y recupera el liderato!",
          auctionId,
        },
      })
      .catch(() => {});
  }

  emitAuction({
    type: "bid",
    auctionId,
    status: "active",
    priceCents: result.priceCents,
    totalBids: result.totalBids,
    timerEndsAt: result.timerEndsAt.toISOString(),
    now: Date.now(),
    leader: by.botName ?? by.username ?? null,
    leaderIsBot: !!by.botName,
  });

  return result;
}

export async function endAuction(auctionId: string) {
  const a = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { bids: { orderBy: { createdAt: "desc" }, take: 1, include: { user: true } }, product: true },
  });
  if (!a || a.status !== "active") return;

  const last = a.bids[0];
  const winnerName = last ? last.botName ?? last.user?.username ?? null : null;
  await prisma.auction.update({
    where: { id: auctionId },
    data: {
      status: "ended",
      endedAt: new Date(),
      finalCents: a.priceCents,
      winnerId: last?.userId ?? null,
      winnerName,
    },
  });

  if (last?.userId) {
    await prisma.order.create({
      data: {
        userId: last.userId,
        auctionId,
        productId: a.productId,
        kind: "win",
        dueCents: a.priceCents,
      },
    });
    await prisma.notification.create({
      data: {
        userId: last.userId,
        type: "won",
        title: "🎉 ¡GANASTE!",
        message: `Ganaste ${a.product.name} por solo ${(a.priceCents / 100).toFixed(2)} MXN. Paga tu pedido para recibirlo.`,
        auctionId,
      },
    });
  }

  emitAuction({
    type: "end",
    auctionId,
    status: "ended",
    priceCents: a.priceCents,
    totalBids: a.totalBids,
    timerEndsAt: null,
    now: Date.now(),
    leader: winnerName,
    leaderIsBot: !!last?.botName,
    finalCents: a.priceCents,
    winnerName,
  });
}
