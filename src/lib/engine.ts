import { prisma } from "./db";
import { emitAuction } from "./bus";
import { placeBid, endAuction } from "./bidding";
import { BOT_NAMES, TIMER_SECONDS } from "./config";

// In-process auction engine: activates scheduled auctions, closes expired
// timers, runs BidBuddy autobidders and demo bots. Single instance per server.
const g = globalThis as unknown as { __engine?: ReturnType<typeof setInterval> };

export function startEngine() {
  if (g.__engine) return;
  g.__engine = setInterval(() => tick().catch((e) => console.error("engine:", e)), 1000);
  console.log("⚡ Gangazo auction engine started");
}

async function tick() {
  const now = new Date();

  // 1. Activate scheduled auctions whose start time arrived
  const toStart = await prisma.auction.findMany({
    where: { status: "scheduled", startsAt: { lte: now } },
  });
  for (const a of toStart) {
    const timerEndsAt = new Date(now.getTime() + TIMER_SECONDS * 1000);
    await prisma.auction.update({ where: { id: a.id }, data: { status: "active", timerEndsAt } });
    emitAuction({
      type: "start", auctionId: a.id, status: "active", priceCents: a.priceCents,
      totalBids: a.totalBids, timerEndsAt: timerEndsAt.toISOString(), now: Date.now(),
      leader: null, leaderIsBot: false,
    });
  }

  // 2. End auctions whose timer expired. If the timer is stale by >60s the
  // server was down (or the DB was just seeded) — resume instead of ending.
  const expired = await prisma.auction.findMany({
    where: { status: "active", timerEndsAt: { lte: now } },
    select: { id: true, timerEndsAt: true },
  });
  for (const a of expired) {
    if (a.timerEndsAt && now.getTime() - a.timerEndsAt.getTime() > 60000) {
      const timerEndsAt = new Date(now.getTime() + TIMER_SECONDS * 1000);
      await prisma.auction.update({ where: { id: a.id }, data: { timerEndsAt } });
    } else {
      await endAuction(a.id);
    }
  }

  // 3. Autobidders (BidBuddy) + demo bots on auctions about to close
  const live = await prisma.auction.findMany({
    where: { status: "active" },
    include: { bids: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  for (const a of live) {
    const secsLeft = a.timerEndsAt ? (a.timerEndsAt.getTime() - now.getTime()) / 1000 : 0;
    if (secsLeft > 3.2 || secsLeft <= 0) continue;
    const lastBid = a.bids[0];

    // BidBuddy: bid for enrolled users who aren't currently leading
    const buddies = await prisma.bidBuddy.findMany({
      where: {
        auctionId: a.id,
        bidsLeft: { gt: 0 },
        ...(lastBid?.userId ? { userId: { not: lastBid.userId } } : {}),
        user: { status: "active", bidBalance: { gt: 0 } },
      },
      include: { user: { select: { username: true } } },
    });
    if (buddies.length) {
      const b = buddies[Math.floor(Math.random() * buddies.length)];
      try {
        await placeBid(a.id, { userId: b.userId, username: b.user.username });
        await prisma.bidBuddy.update({ where: { id: b.id }, data: { bidsLeft: { decrement: 1 } } });
        continue;
      } catch { /* out of bids etc — fall through */ }
    }

    // Demo bots: keep auctions alive until ~botTarget bids, then retire so
    // humans can win. Random early bids add drama; below 1.2s a rescue bid is
    // guaranteed so auctions reliably live to their target.
    if (a.botsEnabled && a.totalBids < a.botTarget && (secsLeft <= 1.2 || Math.random() < 0.35)) {
      let name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      if (lastBid?.botName === name) name = BOT_NAMES[(BOT_NAMES.indexOf(name) + 1) % BOT_NAMES.length];
      try { await placeBid(a.id, { botName: name }); } catch { /* race with end */ }
    }
  }
}
