// src/components/dashboard/PeriodChips.tsx
"use client";

import React from "react";

type PeriodMode = "all" | "month" | "last30" | "custom";

type PeriodChipsProps = {
  mode: PeriodMode;
  setMode: (mode: PeriodMode) => void;
  customFrom: string;
  setCustomFrom: (date: string) => void;
  customTo: string;
  setCustomTo: (date: string) => void;
};

export default function PeriodChips({
  mode,
  setMode,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
}: PeriodChipsProps) {
  return (
    <div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "all" ? "bg-white/10" : "hover:bg-white/10"
          }`}
          onClick={() => setMode("all")}
        >
          Todo
        </button>

        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "month" ? "bg-white/10" : "hover:bg-white/10"
          }`}
          onClick={() => setMode("month")}
        >
          Este mes
        </button>

        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "last30" ? "bg-white/10" : "hover:bg-white/10"
          }`}
          onClick={() => setMode("last30")}
        >
          Últimos 30 días
        </button>

        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "custom" ? "bg-white/10" : "hover:bg-white/10"
          }`}
          onClick={() => setMode("custom")}
        >
          Personalizado
        </button>
      </div>

      {mode === "custom" && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            type="date"
            className="w-full rounded-md border border-white/20 bg-[#070b16]/40 px-3 py-2 text-sm"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
          />

          <input
            type="date"
            className="w-full rounded-md border border-white/20 bg-[#070b16]/40 px-3 py-2 text-sm"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />

          <div />
        </div>
      )}
    </div>
  );
}