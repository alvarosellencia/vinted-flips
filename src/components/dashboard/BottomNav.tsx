"use client";

import { Home, Package, Tag, RefreshCcw, Plus } from "lucide-react";

export type NavKey = "summary" | "lots" | "items";

export default function BottomNav({
  active,
  onNavigate,
  onAdd,
  onSync,
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onAdd: () => void;
  onSync: () => void;
}) {
  const item = (
    key: NavKey,
    label: string,
    Icon: any,
    extra?: { disabled?: boolean }
  ) => {
    const isActive = active === key;

    return (
      <button
        type="button"
        onClick={() => onNavigate(key)}
        className={[
          "vf-navitem",
          isActive ? "text-emerald-300" : "text-white/70 hover:text-white",
        ].join(" ")}
        aria-current={isActive ? "page" : undefined}
        disabled={extra?.disabled}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} />
        <span className="text-[11px] leading-none">{label}</span>
      </button>
    );
  };

  return (
    <nav className="vf-bottomnav" aria-label="Navegación">
      <div className="vf-bottomnav-inner">
        {item("summary", "Resumen", Home)}
        {item("lots", "Lotes", Package)}

        <button
          type="button"
          onClick={onAdd}
          className="vf-fab"
          aria-label="Añadir"
          title="Añadir"
        >
          <Plus className="h-6 w-6" strokeWidth={2.2} />
        </button>

        {item("items", "Prendas", Tag)}

        <button
          type="button"
          onClick={onSync}
          className="vf-navitem text-white/70 hover:text-white"
          aria-label="Sincronizar"
          title="Sincronizar"
        >
          <RefreshCcw className="h-5 w-5" strokeWidth={1.8} />
          <span className="text-[11px] leading-none">Sync</span>
        </button>
      </div>
    </nav>
  );
}