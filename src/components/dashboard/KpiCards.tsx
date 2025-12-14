// src/components/dashboard/KpiCards.tsx
"use client";

import { fmtEUR } from "../../lib/metrics";

export default function KpiCards(props: {
  kpis: {
    totalProfit: number;
    lotProfit: number;
    soldMargin: number | null;
    avgDaysToSell: number | null;
  };
}) {
  const { totalProfit, lotProfit, soldMargin, avgDaysToSell } = props.kpis;

  const card = (title: string, value: string, desc: string) => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="text-sm opacity-70">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-emerald-300">{value}</div>
      <div className="mt-2 text-sm opacity-75">{desc}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {card(
        "Beneficio total",
        fmtEUR(totalProfit),
        "Ingresos netos (vendidas, periodo) − (coste total lotes + coste prendas sueltas)."
      )}
      {card(
        "Beneficio sobre lotes",
        fmtEUR(lotProfit),
        "Ingresos netos (vendidas+reservadas con lote, periodo) − coste total lotes."
      )}
      {card(
        "Margen prendas vendidas",
        soldMargin == null ? "—" : (soldMargin * 100).toFixed(1) + "%",
        "Beneficio unitario (vendidas) / ingresos netos (vendidas)."
      )}
      {card(
        "Media días para vender",
        avgDaysToSell == null ? "—" : avgDaysToSell.toFixed(1),
        "Solo prendas vendidas con fecha publicación + fecha venta."
      )}
    </div>
  );
}
