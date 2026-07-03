import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public auction listing: ?status=active|scheduled|ended & ?cat=slug & ?q=text
export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "active";
  const cat = url.searchParams.get("cat");
  const q = url.searchParams.get("q");

  const auctions = await prisma.auction.findMany({
    where: {
      status,
      product: {
        ...(cat ? { category: { slug: cat } } : {}),
        ...(q ? { name: { contains: q } } : {}),
      },
    },
    include: {
      product: { include: { category: true } },
      bids: { orderBy: { createdAt: "desc" }, take: 1, include: { user: { select: { username: true } } } },
    },
    orderBy: status === "ended" ? { endedAt: "desc" } : status === "scheduled" ? { startsAt: "asc" } : { timerEndsAt: "asc" },
    take: 48,
  });

  return Response.json({
    now: Date.now(),
    auctions: auctions.map((a) => ({
      id: a.id,
      status: a.status,
      priceCents: a.priceCents,
      finalCents: a.finalCents,
      totalBids: a.totalBids,
      startsAt: a.startsAt,
      timerEndsAt: a.timerEndsAt,
      featured: a.featured,
      winnerName: a.winnerName,
      leader: a.bids[0] ? a.bids[0].botName ?? a.bids[0].user?.username ?? null : null,
      product: {
        name: a.product.name, brand: a.product.brand, emoji: a.product.emoji,
        gradient: a.product.gradient, retailCents: a.product.retailCents,
        category: a.product.category.name,
      },
    })),
  });
}
