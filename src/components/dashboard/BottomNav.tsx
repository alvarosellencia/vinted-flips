"use client";

import React from "react";

export type TabKey = "resumen" | "lotes" | "prendas";

type Props = {
  active: TabKey;
  onChange: (t: TabKey) => void;
  onAdd: () => void;
  onSync: () => void;
};

function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" />
    </svg>
  );
}
function IconBox(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M21 8.5 12 3 3 8.5 12 14l9-5.5z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M3 8.5V16l9 5 9-5V8.5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M12 14v7" />
    </svg>
  );
}
function IconTag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M20.5 13.5 13.5 20.5a2 2 0 0 1-2.8 0L3 12.8V3h9.8l7.7 7.7a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
function IconRefresh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M20 4v6h-6" />
    </svg>
  );
}

export default function BottomNav({ active, onChange, onAdd, onSync }: Props) {
  const itemBase =
    "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs";
  const itemOn = "text-emerald-300";
  const itemOff = "text-white/55 hover:text-white/80";

  return (
    <nav
      className="fixed bottom-3 left-1/2 z-50 w-[min(520px,calc(100%-24px))] -translate-x-1/2"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="vf-card flex items-center justify-between px-2 py-2">
        <button
          type="button"
          onClick={() => onChange("resumen")}
          className={`${itemBase} ${active === "resumen" ? itemOn : itemOff}`}
          aria-label="Resumen"
        >
          <IconHome className="h-6 w-6" />
          <span>Resumen</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("lotes")}
          className={`${itemBase} ${active === "lotes" ? itemOn : itemOff}`}
          aria-label="Lotes"
        >
          <IconBox className="h-6 w-6" />
          <span>Lotes</span>
        </button>

        <button
          type="button"
          onClick={onAdd}
          className="mx-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-[#070b16] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          aria-label="Añadir"
        >
          <span className="text-3xl leading-none">+</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("prendas")}
          className={`${itemBase} ${active === "prendas" ? itemOn : itemOff}`}
          aria-label="Prendas"
        >
          <IconTag className="h-6 w-6" />
          <span>Prendas</span>
        </button>

        <button
          type="button"
          onClick={onSync}
          className={`${itemBase} ${itemOff}`}
          aria-label="Sync"
        >
          <IconRefresh className="h-6 w-6" />
          <span>Sync</span>
        </button>
      </div>
    </nav>
  );
}