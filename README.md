# 🔥 GANGAZO — Juega, Puja, Gana

Plataforma de subastas de centavo (penny auctions) para el mercado mexicano. Clon funcional de DealDash con marca propia, en español, con precios en MXN.

## Arranque rápido (2 comandos)

```bash
npm install
npm run setup   # crea la base de datos SQLite + datos de demostración
npm run dev     # http://localhost:3000
```

**Cuentas de demo** (contraseña `Gangazo2026!`):

| Cuenta | Rol |
|---|---|
| `demo@gangazo.com` | Usuario con 500 pujas |
| `admin@gangazo.com` | Admin (dashboard en `/admin`) |

## Qué incluye

- **Subastas en vivo** — timer de 10 s que se reinicia con cada puja, precio sube $0.01, actualizaciones en tiempo real vía Server-Sent Events, motor de subastas en proceso (activa programadas, cierra expiradas, asigna ganadores).
- **Bots de demostración** — mantienen las subastas vivas y se retiran cerca de su meta (`botTarget`) para que los humanos puedan ganar. Apágalos por subasta desde el admin.
- **Puja automática (BidBuddy)** — puja por el usuario en el último segundo.
- **Cómpralo Ya** — precio de tienda menos el valor de las pujas usadas (nunca pierdes).
- **Monetización** — paquetes de pujas (50–1,500), pago del precio final al ganar.
- **Pagos** — Tarjeta (Stripe Checkout), Mercado Pago, OXXO y SPEI. **Sin claves configuradas corre en modo demo** (botón "Simular pago exitoso"); con claves usa los gateways reales + webhooks.
- **Portal del cliente** — cartera, historial de pagos, pedidos y envíos, favoritos, referidos (código + 25 pujas por amigo), notificaciones, perfil.
- **Juego responsable** — límite de gasto mensual configurable, aviso de saldo, +18.
- **Admin** — métricas de ingresos, CRUD de productos, programación/cancelación de subastas, moderación de usuarios (suspender/ban/acreditar pujas).
- **Seguridad** — scrypt para contraseñas, tokens HMAC en cookies httpOnly, rate-limit de login y pujas, validación de entradas, verificación de firma de webhooks.

## Variables de entorno (opcionales)

Sin ninguna variable, la app funciona completa en modo demo.

```bash
AUTH_SECRET=cambia-esto-en-produccion
STRIPE_SECRET_KEY=sk_live_...        # activa Stripe Checkout (tarjeta + OXXO real)
STRIPE_WEBHOOK_SECRET=whsec_...      # verifica firmas del webhook /api/webhooks/stripe
MP_ACCESS_TOKEN=APP_USR-...          # activa Mercado Pago (webhook /api/webhooks/mp)
```

## Producción

1. **Base de datos**: en `prisma/schema.prisma` cambia `provider = "sqlite"` por `postgresql` y `url = env("DATABASE_URL")`, luego `prisma db push`.
2. **Deploy**: cualquier host Node de proceso persistente (Railway, Render, Fly.io, ECS). El motor de subastas y SSE viven en el proceso del servidor — usa **una sola instancia** o mueve el estado del motor a Redis pub/sub para escalar horizontalmente.
3. **Webhooks**: apunta Stripe a `/api/webhooks/stripe` y Mercado Pago a `/api/webhooks/mp`.

## Stack

Next.js 14 (App Router, un solo deploy para frontend + API), TypeScript, Tailwind CSS con tokens de marca Gangazo, Prisma + SQLite/PostgreSQL, SSE para tiempo real. Cero dependencias de pago: los gateways se integran vía HTTP directo.
