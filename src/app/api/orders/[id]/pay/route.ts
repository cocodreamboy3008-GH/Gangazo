import { prisma } from "@/lib/db";
import { requireUser, jsonError, AppError } from "@/lib/auth";
import { createCheckout } from "@/lib/payments";

// Pay for a won auction (final price)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { method } = await req.json();
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { product: true, payment: true },
    });
    if (!order || order.userId !== user.id) throw new AppError("Pedido no encontrado", 404);
    if (order.status !== "pending_payment") throw new AppError("Este pedido ya está pagado");
    if (order.payment && order.payment.status === "pending")
      return Response.json({ paymentId: order.payment.id, redirect: `/pago/${order.payment.id}` });

    const r = await createCheckout({
      userId: user.id, amountCents: order.dueCents, type: "order", method,
      orderId: order.id, description: `Gánalo — ${order.kind === "win" ? "Subasta ganada" : "Cómpralo Ya"}: ${order.product.name}`,
      baseUrl: new URL(req.url).origin,
    });
    return Response.json(r);
  } catch (e) {
    return jsonError(e);
  }
}
