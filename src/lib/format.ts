export const mxn = (cents: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);

export const timeAgo = (d: Date | string) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `hace ${s}s`;
  if (s < 3600) return `hace ${Math.floor(s / 60)}m`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)}h`;
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
