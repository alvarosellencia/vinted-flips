// src/lib/metrics.ts
import type { ItemRow, LotRow } from "./types";

export type PeriodMode = "all" | "month" | "last30" | "custom";

export function derivePeriod(mode: PeriodMode, customFrom: string, customTo: string) {
  if (mode === "all") return { from: null as Date | null, to: null as Date | null };

  const today = new Date();
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  if (mode === "month") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
    return { from, to };
  }

  if (mode === "last30") {
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  // custom
  const f = customFrom ? new Date(customFrom + "T00:00:00") : null;
  const t = customTo ? new Date(customTo + "T23:59:59") : null;
  return { from: f, to: t };
}

export function fmtEUR(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n ?? 0);
}

export function inPeriodBySaleDate(it: ItemRow, from: Date | null, to: Date | null) {
  if (!from || !to) return true;
  if (!it.sale_date) return false;
  const d = new Date(it.sale_date + "T12:00:00");
  return d >= from && d <= to;
}

// netRevenue = lo que te queda NETO por prenda (según tu modelo actual)
export function netRevenue(it: ItemRow) {
  const sale = it.sale_price ?? 0;
  const fee = it.platform_fee ?? 0;
  const ship = it.shipping_cost ?? 0;
  return sale - fee - ship;
}

export function resolveLotForItem(it: ItemRow, lots: LotRow[]) {
  if (it.lot_id) return lots.find((l) => l.id === it.lot_id) ?? null;
  if (it.lot_name) return lots.find((l) => l.name === it.lot_name) ?? null;
  return null;
}

export function resolvedPurchaseCost(it: ItemRow, lots: LotRow[]) {
  // Si está en lote: usa unit_cost del lote si existe; si no, 0 (para no inventar)
  const lot = resolveLotForItem(it, lots);
  if (lot) return lot.unit_cost ?? 0;
  // Si es prenda suelta: usa purchase_cost
  return it.purchase_cost ?? 0;
}
