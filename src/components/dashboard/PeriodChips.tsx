"use client";

export type PeriodKey = "all" | "month" | "last30" | "custom";

export default function PeriodChips({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (p: PeriodKey) => void;
}) {
  const items: { key: PeriodKey; label: string }[] = [
    { key: "all", label: "Todo" },
    { key: "month", label: "Este mes" },
    { key: "last30", label: "Últimos 30 días" },
    { key: "custom", label: "Personalizado" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={[
              "vf-chip",
              active ? "vf-chip--active" : "vf-chip--idle",
              "justify-center",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}