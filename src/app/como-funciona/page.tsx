import Link from "next/link";

const STEPS = [
  ["1", "⚡", "Compra pujas", "Cada puja cuesta $0.13 MXN. Regístrate y te regalamos 50."],
  ["2", "🔥", "Entra a una subasta", "Todos los productos empiezan en $0.01. Cada puja sube el precio 1 centavo y reinicia el reloj a 10 segundos."],
  ["3", "👑", "Sé el último en pujar", "Si el reloj llega a 0 y tu puja es la última, ¡ganaste! Pagas solo el precio final."],
  ["4", "🛍", "¿No ganaste? No pierdes", "Con Cómpralo Ya te llevas el producto a precio de tienda y descontamos todas las pujas que usaste."],
];

export default function ComoFunciona() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl md:text-3xl font-extrabold">¿Cómo funciona Gangazo? 🤔</h1>
      <p className="text-gray-500">Transparente. Justo. De verdad. Así de simple:</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {STEPS.map(([n, emoji, title, body]) => (
          <div key={n} className="card p-5">
            <p className="text-3xl">{emoji}</p>
            <p className="mt-1 font-extrabold"><span className="text-brand">{n}.</span> {title}</p>
            <p className="mt-1 text-sm text-gray-500">{body}</p>
          </div>
        ))}
      </div>
      <div className="card border-l-4 border-l-win p-5">
        <h2 className="font-extrabold">Nuestro compromiso de transparencia 💚</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
          <li>• El costo de cada puja siempre es visible: <b>$0.13 MXN</b>.</li>
          <li>• Límite de gasto mensual configurable en tu cuenta (por defecto $5,000 MXN).</li>
          <li>• Con <b>Cómpralo Ya</b> nunca pierdes lo invertido: tus pujas se vuelven descuento.</li>
          <li>• Solo mayores de 18 años. Esto es entretenimiento: puja con cabeza.</li>
          <li>• Historial completo de pujas y pagos en tu cartera, sin sorpresas.</li>
        </ul>
      </div>
      <div className="text-center">
        <Link href="/registro" className="btn-primary !px-10 !py-4 !text-lg">🎁 Empezar con 50 pujas GRATIS</Link>
      </div>
    </div>
  );
}
