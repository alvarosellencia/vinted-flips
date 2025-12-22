"use client";

export type PeriodKey = "all" | "month" | "30d" | "custom";

export default function PeriodChips({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (v: PeriodKey) => void;
}) {
  const chip = (key: PeriodKey, label: string) => (
    <button
      key={key}
      type="button"
      className={`vf-chip ${value === key ? "is-active" : ""}`}
      onClick={() => onChange(key)}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {chip("all", "Todo")}
      {chip("month", "Este mes")}
      {chip("30d", "Últimos 30 días")}
      {chip("custom", "Personalizado")}
    </div>
  );
}
