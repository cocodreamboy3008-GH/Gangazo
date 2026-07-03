import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { isDemoPayments } from "@/lib/config";
import { mxn } from "@/lib/format";
import PayActions from "./PayActions";

export const dynamic = "force-dynamic";

const METHOD_NAMES: Record<string, string> = {
  card: "Tarjeta", mercado_pago: "Mercado Pago", oxxo: "OXXO", spei: "Transferencia SPEI",
};

export default async function PagoPage({ params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) redirect(`/login?next=/pago/${params.id}`);
  const p = await prisma.payment.findUnique({ where: { id: params.id }, include: { order: { include: { product: true } } } });
  if (!p || p.userId !== user.id) notFound();

  const done = p.status === "completed";
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6 text-center">
        <p className="text-5xl">{done ? "✅" : p.method === "oxxo" ? "🏪" : p.method === "spei" ? "🏦" : "💳"}</p>
        <h1 className="mt-2 text-xl font-extrabold">
          {done ? "¡Pago confirmado!" : `Pago con ${METHOD_NAMES[p.method] ?? p.method}`}
        </h1>
        <p className="mt-1 text-3xl font-extrabold text-blue-brand">{mxn(p.amountCents)}</p>
        <p className="text-sm text-gray-500">
          {p.type === "bid_pack" ? `${p.bidsQty} pujas` : p.order ? `${p.order.product.emoji} ${p.order.product.name}` : ""}
        </p>

        {!done && p.method === "oxxo" && (
          <div className="mt-4 rounded-lg bg-soft p-4 text-left text-sm">
            <p className="font-bold">Referencia OXXO</p>
            <p className="my-1 rounded bg-white p-2 text-center font-mono text-lg tracking-widest border border-dashed border-gray-300">{p.reference}</p>
            <p className="text-gray-500">Preséntala en cualquier OXXO y paga en efectivo. Tu saldo se acredita al confirmarse (máx. 1 hora).</p>
          </div>
        )}
        {!done && p.method === "spei" && (
          <div className="mt-4 rounded-lg bg-soft p-4 text-left text-sm">
            <p className="font-bold">Transferencia SPEI</p>
            <p className="mt-1">Banco: <b>BBVA México</b></p>
            <p>CLABE: <b className="font-mono">{p.reference}</b></p>
            <p>Beneficiario: <b>Gánalo SA de CV</b></p>
            <p className="mt-1 text-gray-500">Transfiere el monto exacto. Se acredita en 5-10 minutos.</p>
          </div>
        )}

        <PayActions paymentId={p.id} done={done} demo={isDemoPayments()} isPack={p.type === "bid_pack"} />
      </div>
    </div>
  );
}
