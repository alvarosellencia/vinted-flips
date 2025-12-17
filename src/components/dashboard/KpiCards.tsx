"use client";

import { useEffect, useMemo, useState } from "react";

type PeriodKey = "all" | "month" | "last30" | "custom";

type Kpis = {
  totalProfit: number;
  lotProfit: number;
  soldMargin: number; // %
  avgDaysToSell: number;
};

function formatEUR(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

export default function KpiCards(props: {
  // Compatibilidad: tu versión antigua podía pasar kpis directamente
  kpis?: Partial<Kpis> | null;

  // Compatibilidad: mi Dashboard nuevo pasa esto
  userId?: string;
  period?: PeriodKey;
  refreshToken?: number;
}) {
  const [loading, setLoading] = useState(false);

  // 1) Base safe: si props.kpis es undefined -> usamos defaults
  const safeKpis: Kpis = useMemo(() => {
    const k = props.kpis ?? {};
    return {
      totalProfit: Number(k.totalProfit ?? 0),
      lotProfit: Number(k.lotProfit ?? 0),
      soldMargin: Number(k.soldMargin ?? 0),
      avgDaysToSell: Number(k.avgDaysToSell ?? 0),
    };
  }, [props.kpis]);

  // 2) Si NO estás pasando kpis, aquí dejamos preparado un fetch “no-op”
  //    para que no pete y puedas enchufar tu query cuando quieras.
  //    (Por ahora no hace nada porque no tengo tu lógica / tablas exactas aquí.)
  useEffect(() => {
    const shouldFetch = !props.kpis && props.userId;
    if (!shouldFetch) return;

    // IMPORTANTE: No rompemos la app. Solo dejamos el patrón listo.
    // Cuando me pegues tu lógica de KPIs/queries, aquí lo conectamos.
    setLoading(false);
  }, [props.kpis, props.userId, props.period, props.refreshToken]);

  const card = (title: string, value: string, desc: string) => (
    <div className="vf-card">
      <div className="vf-card-inner">
        <div className="text-sm opacity-70">{title}</div>
        <div className="mt-2 text-4xl font-semibold tracking-tight text-emerald-200">
          {value}
        </div>
        <div className="mt-2 text-sm opacity-70">{desc}</div>
      </div>
    </div>
  );

  return (
    <section className="mt-6">
      {/* Si no hay kpis reales, avisamos pero sin romper */}
      {!props.kpis && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm opacity-80">
          KPIs sin datos (todavía). La UI está OK. Luego conectamos las queries reales.
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm opacity-80">
          Cargando KPIs…
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {card(
          "Beneficio total",
          formatEUR(safeKpis.totalProfit),
          "Ingresos netos (vendidas, periodo) – (coste total lotes + coste prendas sueltas)."
        )}

        {card(
          "Beneficio sobre lotes",
          formatEUR(safeKpis.lotProfit),
          "Ingresos netos (vendidas+reservadas con lote, periodo) – coste total lotes."
        )}

        {card(
          "Margen prendas vendidas",
          safeKpis.soldMargin ? `${safeKpis.soldMargin.toFixed(1)}%` : "—",
          "Beneficio unitario (vendidas) / ingresos netos (vendidas)."
        )}

        {card(
          "Media días para vender",
          safeKpis.avgDaysToSell ? String(safeKpis.avgDaysToSell.toFixed(1)) : "—",
          "Solo prendas vendidas con fecha publicación + fecha venta."
        )}
      </div>
    </section>
  );
}