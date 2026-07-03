import { applyPayment } from "@/lib/payments";
import { createHmac, timingSafeEqual } from "crypto";

// Stripe webhook: completes payments on checkout.session.completed.
// Set STRIPE_WEBHOOK_SECRET to enable signature verification.
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (secret) {
    const header = req.headers.get("stripe-signature") || "";
    const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
    const expected = createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
    const ok =
      parts.v1?.length === expected.length &&
      timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));
    if (!ok) return new Response("bad signature", { status: 400 });
  }

  const event = JSON.parse(raw);
  if (event.type === "checkout.session.completed") {
    const paymentId = event.data?.object?.metadata?.paymentId;
    if (paymentId) await applyPayment(paymentId);
  }
  return Response.json({ received: true });
}
