import { requireUser, jsonError, AppError } from "@/lib/auth";
import { createCheckout } from "@/lib/payments";
import { PACKS, PAYMENT_METHODS } from "@/lib/config";

// Buy a bid pack with the chosen payment method
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { packId, method } = await req.json();
    const pack = PACKS.find((p) => p.id === packId);
    if (!pack) throw new AppError("Paquete inválido");
    if (!PAYMENT_METHODS.some((m) => m.id === method)) throw new AppError("Método de pago inválido");

    const r = await createCheckout({
      userId: user.id,
      amountCents: pack.priceCents,
      type: "bid_pack",
      method,
      bidsQty: pack.bids,
      description: `Gánalo — Paquete ${pack.name} (${pack.bids} pujas)`,
      baseUrl: new URL(req.url).origin,
    });
    return Response.json(r);
  } catch (e) {
    return jsonError(e);
  }
}
