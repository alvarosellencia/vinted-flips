"use client";

export type PeriodValue = "all" | "month" | "30d" | "custom";

type Props = {
  value: PeriodValue;
  onChange: (v: PeriodValue) => void;
};

const Chip = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`vf-chip justify-center rounded-full px-4 py-3 text-sm transition
        ${active ? "bg-emerald-400/20 text-emerald-100 border-emerald-400/25" : "text-white/80"}`}
    >
      {label}
    </button>
  );
};

export default function PeriodChips({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-3">
      <Chip active={value === "all"} label="Todo" onClick={() => onChange("all")} />
      <Chip active={value === "month"} label="Este mes" onClick={() => onChange("month")} />
      <Chip active={value === "30d"} label="Últimos 30 días" onClick={() => onChange("30d")} />
      <Chip active={value === "custom"} label="Personalizado" onClick={() => onChange("custom")} />
    </div>
  );
}