"use client";

type Kpis = {
  totalProfit: number;
  lotProfit: number;
  soldMargin: number; // 0..1
  avgDaysToSell: number;
};

function eur(n: number) {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} €`;
  }
}

export default function KpiCards({ kpis }: { kpis?: Kpis | null }) {
  const safe: Kpis = {
    totalProfit: kpis?.totalProfit ?? 0,
    lotProfit: kpis?.lotProfit ?? 0,
    soldMargin: kpis?.soldMargin ?? 0,
    avgDaysToSell: kpis?.avgDaysToSell ?? 0,
  };

  const card = (title: string, value: string, desc: string) => (
    <div className="vf-card">
      <div className="vf-card-inner">
        <div className="text-sm opacity-70">{title}</div>
        <div className="mt-2 text-4xl font-semibold text-emerald-200">{value}</div>
        <div className="mt-2 text-sm opacity-70">{desc}</div>
      </div>
    </div>
  );

  return (
    <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {card(
        "Beneficio total",
        eur(safe.totalProfit),
        "Ingresos netos (vendidas, periodo) – (coste total lotes + coste prendas sueltas)."
      )}
      {card(
        "Beneficio sobre lotes",
        eur(safe.lotProfit),
        "Ingresos netos (vendidas+reservadas con lote, periodo) – coste total lotes."
      )}
      {card(
        "Margen prendas vendidas",
        safe.soldMargin ? `${(safe.soldMargin * 100).toFixed(1)}%` : "—",
        "Beneficio unitario (vendidas) / ingresos netos (vendidas)."
      )}
      {card(
        "Media días para vender",
        safe.avgDaysToSell ? safe.avgDaysToSell.toFixed(1) : "—",
        "Solo prendas vendidas con fecha publicación + fecha venta."
      )}
    </section>
  );
}