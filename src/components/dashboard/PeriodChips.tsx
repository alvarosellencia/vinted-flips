"use client";

export type PeriodKey = "all" | "month" | "last30" | "custom";

const options: { key: PeriodKey; label: string }[] = [
  { key: "all", label: "Todo" },
  { key: "month", label: "Este mes" },
  { key: "last30", label: "Últimos 30 días" },
  { key: "custom", label: "Personalizado" },
];

export default function PeriodChips({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (v: PeriodKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={[
              "vf-chip w-full sm:w-auto justify-center",
              active ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/25" : "",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}