"use client";

export type PeriodKey = "all" | "month" | "last30" | "custom";

export default function PeriodChips({
  period,
  onChange,
}: {
  period: PeriodKey;
  onChange: (p: PeriodKey) => void;
}) {
  const chip = (key: PeriodKey, label: string) => {
    const active = period === key;
    return (
      <button
        type="button"
        onClick={() => onChange(key)}
        className={[
          "vf-chip",
          "justify-center",
          "min-h-[44px]",
          "w-full",
          active ? "bg-emerald-400/20 text-emerald-200 border-emerald-300/20" : "",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="vf-card mt-4">
      <div className="vf-card-inner">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Periodo</div>
            <div className="mt-1 text-sm opacity-70">
              Afecta a KPIs y resumen por lote (según fecha de venta).
            </div>
          </div>
          <div className="text-sm opacity-70">Todo</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {chip("all", "Todo")}
          {chip("month", "Este mes")}
          {chip("last30", "Últimos 30 días")}
          {chip("custom", "Personalizado")}
        </div>
      </div>
    </div>
  );
}