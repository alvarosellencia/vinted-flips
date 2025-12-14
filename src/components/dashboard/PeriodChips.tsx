// src/components/dashboard/PeriodChips.tsx
"use client";

import type { PeriodMode } from "../../lib/metrics";

export default function PeriodChips(props: {
  mode: PeriodMode;
  setMode: (m: PeriodMode) => void;
  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
}) {
  const { mode, setMode, customFrom, setCustomFrom, customTo, setCustomTo } = props;

  const chip = (active: boolean) =>
    `rounded-2xl px-3 py-2 text-sm ${active ? "bg-emerald-400 text-[#070b16] font-semibold" : "bg-white/5 hover:bg-white/10"}`;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Periodo</h2>
          <p className="mt-1 text-sm opacity-75">Afecta a KPIs y resumen por lote (según fecha de venta).</p>
        </div>
        <div className="text-sm opacity-70">{mode === "all" ? "Todo" : mode}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className={chip(mode === "all")} onClick={() => setMode("all")}>
          Todo
        </button>
        <button className={chip(mode === "month")} onClick={() => setMode("month")}>
          Este mes
        </button>
        <button className={chip(mode === "last30")} onClick={() => setMode("last30")}>
          Últimos 30 días
        </button>
        <button className={chip(mode === "custom")} onClick={() => setMode("custom")}>
          Personalizado
        </button>
      </div>

      {mode === "custom" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs opacity-70">Desde</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#070b16]/60 px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs opacity-70">Hasta</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#070b16]/60 px-3 py-2 text-sm outline-none"
            />
          </label>
        </div>
      )}
    </section>
  );
}
