"use client";

export type PeriodKey = "all" | "month" | "30d" | "custom";

export default function PeriodChips({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (v: PeriodKey) => void;
}) {
  const Chip = ({ k, label }: { k: PeriodKey; label: string }) => (
    <button
      type="button"
      onClick={() => onChange(k)}
      className={`vf-chip ${value === k ? "vf-chip-active" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <section className="vf-card">
      <div className="vf-card-inner">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Periodo</div>
            <div className="vf-subtitle">Afecta a KPIs y resumen (según fecha de venta).</div>
          </div>
          <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
            {value === "all"
              ? "Todo"
              : value === "month"
              ? "Este mes"
              : value === "30d"
              ? "Últimos 30 días"
              : "Personalizado"}
          </div>
        </div>

        <div className="mt-4 vf-chip-row">
          <Chip k="all" label="Todo" />
          <Chip k="month" label="Este mes" />
          <Chip k="30d" label="Últimos 30 días" />
          <Chip k="custom" label="Personalizado" />
        </div>
      </div>
    </section>
  );
}