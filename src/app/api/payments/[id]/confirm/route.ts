import { prisma } from "@/lib/db";
import { requireUser, jsonError, AppError } from "@/lib/auth";
import { applyPayment, isDemoPayments } from "@/lib/payments";

// Demo-mode confirmation (simulates the gateway webhook). Disabled when real
// payment keys are configured — then only webhooks can complete payments.
export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    if (!isDemoPayments())
      throw new AppError("Los pagos se confirman automáticamente por el procesador", 403);
    const user = await requireUser();
    const p = await prisma.payment.findUnique({ where: { id: params.id } });
    if (!p || p.userId !== user.id) throw new AppError("Pago no encontrado", 404);
    const done = await applyPayment(p.id);
    return Response.json({ ok: true, status: done?.status });
  } catch (e) {
    return jsonError(e);
  }
}
