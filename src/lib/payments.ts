import { prisma } from "./db";
import { AppError } from "./auth";
import { stripeKey, mpToken, isDemoPayments } from "./config";

const monthKey = () => new Date().toISOString().slice(0, 7);

// Responsible-spending guard (monthly limit, resets lazily each month)
export async function checkSpendLimit(userId: string, amountCents: number) {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const spent = u.monthKey === monthKey() ? u.monthSpendCents : 0;
  if (spent + amountCents > u.monthlyLimitCents) {
    const left = Math.max(0, u.monthlyLimitCents - spent);
    throw new AppError(
      `Alcanzaste tu límite mensual de gasto. Te quedan ${(left / 100).toFixed(2)} MXN este mes. ¡Puja con cabeza! 💚`,
      403
    );
  }
}

const ref = (p: string) => p + Math.random().toString().slice(2, 12);

// Creates the Payment row and, when real gateway keys exist, the external
// checkout. Returns where to send the user next.
export async function createCheckout(opts: {
  userId: string;
  amountCents: number;
  type: "bid_pack" | "order";
  method: string;
  bidsQty?: number;
  orderId?: string;
  description: string;
  baseUrl: string;
}) {
  await checkSpendLimit(opts.userId, opts.amountCents);

  const payment = await prisma.payment.create({
    data: {
      userId: opts.userId,
      amountCents: opts.amountCents,
      type: opts.type,
      method: opts.method,
      bidsQty: opts.bidsQty,
      orderId: opts.orderId,
      reference:
        opts.method === "oxxo" ? ref("OXX") : opts.method === "spei" ? ref("646180") : null,
    },
  });

  // Real Stripe Checkout (cards + OXXO) when configured
  if (stripeKey() && (opts.method === "card" || opts.method === "oxxo")) {
    const body = new URLSearchParams({
      mode: "payment",
      "line_items[0][price_data][currency]": "mxn",
      "line_items[0][price_data][product_data][name]": opts.description,
      "line_items[0][price_data][unit_amount]": String(opts.amountCents),
      "line_items[0][quantity]": "1",
      "payment_method_types[0]": opts.method === "oxxo" ? "oxxo" : "card",
      success_url: `${opts.baseUrl}/pago/${payment.id}?ok=1`,
      cancel_url: `${opts.baseUrl}/pago/${payment.id}`,
      "metadata[paymentId]": payment.id,
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${stripeKey()}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const session = await res.json();
    if (!res.ok) throw new AppError(session.error?.message || "Error con el procesador de pagos", 502);
    await prisma.payment.update({ where: { id: payment.id }, data: { externalId: session.id } });
    return { paymentId: payment.id, redirect: session.url as string };
  }

  // Real Mercado Pago preference when configured
  if (mpToken() && opts.method === "mercado_pago") {
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${mpToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ title: opts.description, unit_price: opts.amountCents / 100, quantity: 1, currency_id: "MXN" }],
        external_reference: payment.id,
        back_urls: {
          success: `${opts.baseUrl}/pago/${payment.id}?ok=1`,
          pending: `${opts.baseUrl}/pago/${payment.id}`,
          failure: `${opts.baseUrl}/pago/${payment.id}`,
        },
        notification_url: `${opts.baseUrl}/api/webhooks/mp`,
      }),
    });
    const pref = await res.json();
    if (!res.ok) throw new AppError("Error con Mercado Pago", 502);
    await prisma.payment.update({ where: { id: payment.id }, data: { externalId: pref.id } });
    return { paymentId: payment.id, redirect: pref.init_point as string };
  }

  // Demo mode / offline methods → internal payment page
  return { paymentId: payment.id, redirect: `/pago/${payment.id}` };
}

// Idempotent fulfillment — called by webhooks or the demo confirm button.
export async function applyPayment(paymentId: string) {
  const p = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!p || p.status === "completed") return p;

  await prisma.$transaction(async (tx) => {
    const done = await tx.payment.updateMany({
      where: { id: paymentId, status: "pending" },
      data: { status: "completed", completedAt: new Date() },
    });
    if (done.count === 0) return;

    const u = await tx.user.findUniqueOrThrow({ where: { id: p.userId } });
    const mk = monthKey();
    await tx.user.update({
      where: { id: p.userId },
      data: {
        bidBalance: p.type === "bid_pack" && p.bidsQty ? { increment: p.bidsQty } : undefined,
        monthKey: mk,
        monthSpendCents: (u.monthKey === mk ? u.monthSpendCents : 0) + p.amountCents,
        totalSpendCents: { increment: p.amountCents },
      },
    });
    if (p.type === "order" && p.orderId) {
      await tx.order.update({ where: { id: p.orderId }, data: { status: "paid" } });
    }
    await tx.notification.create({
      data: {
        userId: p.userId,
        type: "payment",
        title: p.type === "bid_pack" ? `✅ ¡${p.bidsQty} pujas acreditadas!` : "✅ Pago recibido",
        message:
          p.type === "bid_pack"
            ? "Tu paquete de pujas ya está en tu cuenta. ¡A ganar!"
            : "Tu pedido está pagado. Lo enviaremos en 3-5 días hábiles. 📦",
      },
    });
  });
  return prisma.payment.findUnique({ where: { id: paymentId } });
}

export { isDemoPayments };
