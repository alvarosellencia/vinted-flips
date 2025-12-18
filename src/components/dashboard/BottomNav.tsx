"use client";

import { Home, Package, Tags, Download, Plus } from "lucide-react";

export type TabKey = "summary" | "lots" | "items";

export default function BottomNav({
  active,
  onNavigate,
  onAdd,
  onExport,
}: {
  active: TabKey;
  onNavigate: (tab: TabKey) => void;
  onAdd: () => void;
  onExport: () => void;
}) {
  const btn = (key: TabKey, label: string, Icon: any) => {
    const isActive = active === key;
    return (
      <button
        type="button"
        onClick={() => onNavigate(key)}
        className={`vf-navbtn ${isActive ? "vf-navbtn-active" : ""}`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon size={20} />
        <span className="text-[11px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <nav className="vf-bottomnav" role="navigation" aria-label="Navegación inferior">
      <div className="vf-navgrid">
        {btn("summary", "Resumen", Home)}
        {btn("lots", "Lotes", Package)}

        <button type="button" className="vf-fab" onClick={onAdd} aria-label="Añadir">
          <Plus size={22} />
        </button>

        {btn("items", "Prendas", Tags)}

        <button
          type="button"
          onClick={onExport}
          className="vf-navbtn"
          aria-label="Exportar CSV"
        >
          <Download size={20} />
          <span className="text-[11px] font-medium">Export</span>
        </button>
      </div>
    </nav>
  );
}