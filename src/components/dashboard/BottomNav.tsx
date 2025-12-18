"use client";

import { Home, Boxes, Tag, Plus, Download } from "lucide-react";

export type TabKey = "summary" | "lots" | "items";

type Props = {
  active: TabKey;
  onNavigate?: (key: TabKey) => void;
  onCreate?: () => void;
  onExport?: () => void;
};

function Item({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={["vf-nav-item", active ? "vf-nav-item--active" : ""].join(" ")}
    >
      <span className="vf-nav-icon">{icon}</span>
      <span className="vf-nav-label">{label}</span>
    </button>
  );
}

export default function BottomNav({ active, onNavigate, onCreate, onExport }: Props) {
  return (
    <nav className="vf-bottomnav" aria-label="Bottom navigation">
      <div className="vf-bottomnav-inner">
        <Item
          label="Resumen"
          active={active === "summary"}
          icon={<Home size={20} />}
          onClick={() => onNavigate?.("summary")}
        />

        <Item
          label="Lotes"
          active={active === "lots"}
          icon={<Boxes size={20} />}
          onClick={() => onNavigate?.("lots")}
        />

        <button type="button" onClick={() => onCreate?.()} className="vf-fab" aria-label="Añadir">
          <Plus size={24} />
        </button>

        <Item
          label="Prendas"
          active={active === "items"}
          icon={<Tag size={20} />}
          onClick={() => onNavigate?.("items")}
        />

        <button type="button" onClick={() => onExport?.()} className="vf-nav-item" aria-label="Exportar CSV">
          <span className="vf-nav-icon">
            <Download size={20} />
          </span>
          <span className="vf-nav-label">Export</span>
        </button>
      </div>
    </nav>
  );
}