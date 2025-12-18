"use client";

type Kpis = {
  totalProfit: number;
  lotProfit: number;
  soldMargin: number | null; // ratio 0..1
  avgDaysToSell: number | null;
};

function formatEUR(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

function Sparkline({ data }: { data: number[] }) {
  // simple sparkline determinista (no random) para no romper hydration
  const w = 140;
  const h = 40;
  const pad = 4;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const pts = data
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (data.length - 1);
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id="vfGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7B1DF7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9F62FF" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="vfFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7B1DF7" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#7B1DF7" stopOpacity="0.00" />
        </linearGradient>
      </defs>

      <polyline
        fill="none"
        stroke="url(#vfGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />

      {/* fill */}
      <polygon
        fill="url(#vfFill)"
        points={`${pts} ${w - pad},${h - pad} ${pad},${h - pad}`}
      />
    </svg>
  );
}

export default function KpiCards({
  kpis,
}: {
  kpis?: Kpis;
}) {
  const safe: Kpis = kpis ?? {
    totalProfit: 0,
    lotProfit: 0,
    soldMargin: null,
    avgDaysToSell: null,
  };

  const card = (title: string, value: string, desc: string, spark: number[]) => (
    <div className="vf-card">
      <div className="vf-card-inner flex items-start justify-between gap-4">
        <div>
          <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
            {title}
          </div>
          <div className="mt-2 text-3xl font-semibold" style={{ color: "var(--vf-violet)" }}>
            {value}
          </div>
          <div className="mt-2 text-sm" style={{ color: "var(--vf-muted)" }}>
            {desc}
          </div>
        </div>
        <div className="hidden sm:block">
          <Sparkline data={spark} />
        </div>
      </div>
    </div>
  );

  const sparkA = [2, 3, 2.6, 3.4, 3.1, 3.8, 4.2];
  const sparkB = [1.2, 1.4, 1.1, 1.5, 1.6, 1.7, 1.9];
  const sparkC = [2.6, 2.8, 2.7, 2.9, 3.0, 3.2, 3.3];
  const sparkD = [3.5, 3.2, 3.0, 2.8, 2.6, 2.5, 2.4];

  return (
    <section className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {card(
        "Beneficio total",
        formatEUR(safe.totalProfit),
        "Ingresos netos (vendidas, periodo) − (coste total lotes + coste prendas sueltas).",
        sparkA
      )}
      {card(
        "Beneficio sobre lotes",
        formatEUR(safe.lotProfit),
        "Ingresos netos (vendidas+reservadas con lote, periodo) − coste total lotes.",
        sparkB
      )}
      {card(
        "Margen prendas vendidas",
        safe.soldMargin == null ? "—" : `${(safe.soldMargin * 100).toFixed(1)}%`,
        "Beneficio unitario (vendidas) / ingresos netos (vendidas).",
        sparkC
      )}
      {card(
        "Media días para vender",
        safe.avgDaysToSell == null ? "—" : `${safe.avgDaysToSell.toFixed(1)}`,
        "Solo prendas vendidas con fecha publicación + fecha venta.",
        sparkD
      )}
    </section>
  );
}