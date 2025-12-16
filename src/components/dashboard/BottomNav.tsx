// src/components/dashboard/BottomNav.tsx
"use client";

import React from "react";

type BottomNavProps = {
  view: "summary" | "items" | "lots";
  onChange: (view: "summary" | "items" | "lots") => void;
  onAdd: () => void;
  onRefresh: () => void;
};

export default function BottomNav({ view, onChange, onAdd, onRefresh }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070b16]/70 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-2">
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            view === "summary" ? "bg-white/10" : "hover:bg-white/10"
          }`}
          onClick={() => onChange("summary")}
        >
          Resumen
        </button>

        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            view === "items" ? "bg-white/10" : "hover:bg-white/10"
          }`}
          onClick={() => onChange("items")}
        >
          Prendas
        </button>

        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            view === "lots" ? "bg-white/10" : "hover:bg-white/10"
          }`}
          onClick={() => onChange("lots")}
        >
          Lotes
        </button>

        <button
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-600"
          onClick={onAdd}
        >
          Añadir
        </button>

        <button
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-black hover:bg-sky-600"
          onClick={onRefresh}
        >
          Refrescar
        </button>
      </div>
    </nav>
  );
}