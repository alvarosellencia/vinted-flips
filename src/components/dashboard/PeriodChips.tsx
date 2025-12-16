"use client";

import type { PeriodMode } from "../../lib/metrics";

type Props = {
  mode: PeriodMode;
  setMode: (m: PeriodMode) => void;
  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
};

export default function PeriodChips({
  mode,
  setMode,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
}: Props) {
  const Chip = ({ label, value }: { label: string; value: PeriodMode }) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={[
        "vf-chip",
        "justify-center",
        "min-w-[9.5rem] sm:min-w-0",
        mode === value ? "bg-emerald-400/20 border-emerald-400/30" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <section className="vf-card">
      <div className="vf-card-inner">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Periodo</h2>
            <p className="mt-1 text-sm opacity-75">
              Afecta a KPIs y resumen por lote (según fecha de venta).
            </p>
          </div>
          <div className="text-sm opacity-70">{mode === "all" ? "Todo" : ""}</div>
        </div>

        {/* Mobile-first: wrapped chips so nothing gets cut */}
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
            <Chip label="Todo" value="all" />
            <Chip label="Este mes" value="month" />
            <Chip label="Últimos 30 días" value="last30" />
            <Chip label="Personalizado" value="custom" />
          </div>
        </div>

        {mode === "custom" && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              type="date"
              className="vf-input"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <input
              type="date"
              className="vf-input"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </div>
        )}
      </div>
    </section>
  );
}