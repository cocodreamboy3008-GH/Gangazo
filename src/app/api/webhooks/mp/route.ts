import { applyPayment } from "@/lib/payments";
import { mpToken } from "@/lib/config";

// Mercado Pago IPN: verify payment status against MP API, then fulfill.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const paymentIdMP = body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");
  if (!paymentIdMP || !mpToken()) return Response.json({ received: true });

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentIdMP}`, {
    headers: { Authorization: `Bearer ${mpToken()}` },
  });
  if (res.ok) {
    const mp = await res.json();
    if (mp.status === "approved" && mp.external_reference) {
      await applyPayment(mp.external_reference);
    }
  }
  return Response.json({ received: true });
}
