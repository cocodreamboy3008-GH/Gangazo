import { prisma } from "@/lib/db";
import { requireUser, jsonError, AppError } from "@/lib/auth";
import { createCheckout } from "@/lib/payments";
import { BID_COST_CENTS } from "@/lib/config";

// Buy It Now: pay retail minus the value of bids you already spent here.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { method } = await req.json();
    const a = await prisma.auction.findUnique({ where: { id: params.id }, include: { product: true } });
    if (!a) throw new AppError("Subasta no encontrada", 404);
    if (a.winnerId === user.id) throw new AppError("¡Ya ganaste esta subasta! Paga tu pedido en tu cuenta.");

    const myBids = await prisma.bid.count({ where: { auctionId: a.id, userId: user.id } });
    const dueCents = Math.max(100, a.product.retailCents - myBids * BID_COST_CENTS);

    const order = await prisma.order.create({
      data: { userId: user.id, auctionId: a.id, productId: a.productId, kind: "bin", dueCents },
    });
    const r = await createCheckout({
      userId: user.id, amountCents: dueCents, type: "order", method,
      orderId: order.id, description: `Cómpralo Ya: ${a.product.name}`,
      baseUrl: new URL(req.url).origin,
    });
    return Response.json(r);
  } catch (e) {
    return jsonError(e);
  }
}
