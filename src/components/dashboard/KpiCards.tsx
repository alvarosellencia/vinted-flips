"use client";

export type Kpis = {
  totalProfit: number;
  lotProfit: number;
  soldMargin: number | null;
  avgDaysToSell: number | null;
};

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function fmtPct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

function Card({
  title,
  value,
  desc,
}: {
  title: string;
  value: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="vf-card">
      <div className="vf-card-inner">
        <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
          {title}
        </div>
        <div className="mt-2 text-3xl font-semibold">{value}</div>
        <div className="mt-2 text-sm" style={{ color: "var(--vf-muted)" }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

export default function KpiCards({ kpis }: { kpis: Kpis }) {
  const total = kpis?.totalProfit ?? 0;
  const lot = kpis?.lotProfit ?? 0;
  const margin = kpis?.soldMargin ?? null;
  const days = kpis?.avgDaysToSell ?? null;

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2">
      <Card
        title="Beneficio total"
        value={<span className={total >= 0 ? "text-emerald-600" : "text-rose-600"}>{EUR.format(total)}</span>}
        desc="Ventas realizadas (vendidas). Beneficio = sale_price - coste."
      />

      <Card
        title="Beneficio sobre lotes"
        value={<span className={lot >= 0 ? "text-emerald-600" : "text-rose-600"}>{EUR.format(lot)}</span>}
        desc="Vendidas + reservadas con lote. Beneficio = (sale_price) - total_cost del lote."
      />

      <Card
        title="Margen prendas vendidas"
        value={<span>{margin == null ? "—" : fmtPct(margin)}</span>}
        desc="Beneficio / ingresos (solo vendidas)."
      />

      <Card
        title="Media días para vender"
        value={<span>{days == null ? "—" : days.toFixed(1)}</span>}
        desc="listing_date → sale_date (solo vendidas)."
      />
    </section>
  );
}