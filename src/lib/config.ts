export const TIMER_SECONDS = 10;
export const BID_COST_CENTS = 13; // MX$0.13 per bid (credited back on Buy It Now)
export const SIGNUP_BONUS_BIDS = 50;
export const REFERRAL_BONUS_BIDS = 25;

export const PACKS = [
  { id: "chico", name: "Chico", bids: 50, priceCents: 650, tag: "" },
  { id: "popular", name: "Popular", bids: 100, priceCents: 1300, tag: "Más vendido" },
  { id: "pro", name: "Pro", bids: 300, priceCents: 3500, tag: "Ahorra 10%" },
  { id: "mega", name: "Mega", bids: 700, priceCents: 7900, tag: "Ahorra 13%" },
  { id: "epico", name: "Épico", bids: 1500, priceCents: 14900, tag: "Ahorra 24%" },
] as const;

export const PAYMENT_METHODS = [
  { id: "card", name: "Tarjeta de crédito/débito", icon: "💳", note: "Visa, Mastercard, AMEX" },
  { id: "mercado_pago", name: "Mercado Pago", icon: "🤝", note: "Saldo o meses sin intereses" },
  { id: "oxxo", name: "OXXO", icon: "🏪", note: "Paga en efectivo en tienda" },
  { id: "spei", name: "Transferencia SPEI", icon: "🏦", note: "Desde tu banca en línea" },
] as const;

// Real gateways activate automatically when keys are present.
export const stripeKey = () => process.env.STRIPE_SECRET_KEY || "";
export const mpToken = () => process.env.MP_ACCESS_TOKEN || "";
export const isDemoPayments = () => !stripeKey() && !mpToken();

export const BOT_NAMES = [
  "LuchaLibre_MX", "ChilangoWin", "Reyna_Pujas", "ElGanon77", "SubastaKing",
  "MariaGdl", "TapatioPro", "CarlosMTY", "LaJefa_CDMX", "PujadorX",
  "SofiRegia", "DonGangazo", "AztecaBid", "NortenaVip", "El_Rayo",
];
