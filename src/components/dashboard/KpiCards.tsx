"use client";

type Kpis = {
  totalProfit: number;
  lotProfit: number;
  soldMargin: number; // 0..1
  avgDaysToSell: number | null;
};

const fmtEur = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

function Sparkline({ values }: { values?: number[] }) {
  const v = values && values.length >= 2 ? values : [2, 3, 2.6, 3.4, 3.1, 3.8, 3.6];
  const min = Math.min(...v);
  const max = Math.max(...v);
  const range = Math.max(1e-6, max - min);

  const w = 120;
  const h = 38;
  const pad = 2;

  const pts = v.map((val, i) => {
    const x = (i / (v.length - 1)) * (w - pad * 2) + pad;
    const y = h - ((val - min) / range) * (h - pad * 2) - pad;
    return { x, y };
  });

  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id="vfGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(123,29,247,0.35)" />
          <stop offset="100%" stopColor="rgba(123,29,247,0)" />
        </linearGradient>
      </defs>

      {/* area */}
      <path
        d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
        fill="url(#vfGrad)"
      />
      {/* line */}
      <path d={d} fill="none" stroke="rgba(123,29,247,0.9)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function KpiCards({ kpis }: { kpis?: Partial<Kpis> }) {
  const safe: Kpis = {
    totalProfit: kpis?.totalProfit ?? 0,
    lotProfit: kpis?.lotProfit ?? 0,
    soldMargin: kpis?.soldMargin ?? 0,
    avgDaysToSell: kpis?.avgDaysToSell ?? null,
  };

  const cards = [
    {
      title: "Beneficio total",
      value: fmtEur(safe.totalProfit),
      desc: "Ingresos netos (vendidas, periodo) − (coste lotes + coste sueltas).",
      series: [2, 2.4, 2.1, 2.9, 3.2, 3.0, 3.6],
    },
    {
      title: "Beneficio sobre lotes",
      value: fmtEur(safe.lotProfit),
      desc: "Ingresos netos (vendidas+reservadas con lote) − coste lotes.",
      series: [1.8, 2.1, 2.0, 2.6, 2.4, 2.9, 3.1],
    },
    {
      title: "Margen prendas vendidas",
      value: safe.soldMargin ? `${(safe.soldMargin * 100).toFixed(1)}%` : "—",
      desc: "Beneficio unitario (vendidas) / ingresos netos (vendidas).",
      series: [2.2, 2.3, 2.35, 2.28, 2.4, 2.5, 2.55],
    },
    {
      title: "Media días para vender",
      value: safe.avgDaysToSell === null ? "—" : String(safe.avgDaysToSell.toFixed(1)),
      desc: "Solo vendidas con fecha publicación + fecha venta.",
      series: [3.4, 3.0, 2.8, 2.6, 2.7, 2.4, 2.3],
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {cards.map((c) => (
        <div key={c.title} className="vf-card">
          <div className="vf-card-inner">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm vf-muted">{c.title}</div>
                <div className="mt-2 text-4xl font-semibold tracking-tight vf-kpi-value">
                  {c.value}
                </div>
              </div>
              <Sparkline values={c.series} />
            </div>
            <div className="mt-3 text-sm vf-muted">{c.desc}</div>
          </div>
        </div>
      ))}
    </section>
  );
}