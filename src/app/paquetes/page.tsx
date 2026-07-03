import { getUser } from "@/lib/auth";
import PackStore from "./PackStore";

export const dynamic = "force-dynamic";

export default async function Paquetes() {
  const user = await getUser();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-extrabold">Recarga tus pujas ⚡</h1>
      <p className="mb-5 text-gray-500">
        Cada puja cuesta $0.13 MXN y sube el precio $0.01. Si no ganas, tus pujas se descuentan con <b>Cómpralo Ya</b>. Sin letras chiquitas.
      </p>
      <PackStore loggedIn={!!user} balance={user?.bidBalance ?? 0} />
    </div>
  );
}
