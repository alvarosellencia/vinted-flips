"use client";

import { Boxes, Download, Home, Tag, Plus } from "lucide-react";

export type TabKey = "summary" | "lots" | "items";

export default function BottomNav({
  tab,
  onNavigate,
  onAdd,
  onExport,
}: {
  tab: TabKey;
  onNavigate: (t: TabKey) => void;
  onAdd: () => void;
  onExport: () => void;
}) {
  const NavItem = ({
    label,
    active,
    icon,
    onClick,
  }: {
    label: string;
    active: boolean;
    icon: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group",
        "h-[64px] w-full",
        "flex flex-col items-center justify-center gap-1",
        "rounded-2xl",
        "transition",
        active ? "text-emerald-200" : "text-white/60 hover:text-white/85",
      ].join(" ")}
      aria-label={label}
    >
      <span
        className={[
          "grid place-items-center",
          "h-9 w-9 rounded-xl",
          "transition",
          active
            ? "bg-emerald-400/15 ring-1 ring-emerald-300/20"
            : "bg-white/0 group-hover:bg-white/5",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="text-[11px] leading-none tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
      <div className="mx-auto max-w-3xl">
        {/* Barra glass */}
        <div
          className={[
            "relative",
            "rounded-[24px]",
            "border border-white/10",
            "bg-[#070b16]/55",
            "backdrop-blur-xl",
            "shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
            "px-2",
            "pt-2",
            "pb-2",
          ].join(" ")}
        >
          {/* Grid 5 columnas: 2 izq, hueco centro, 2 der */}
          <div className="grid grid-cols-5 items-center gap-1">
            <NavItem
              label="Resumen"
              active={tab === "summary"}
              icon={<Home size={20} />}
              onClick={() => onNavigate("summary")}
            />
            <NavItem
              label="Lotes"
              active={tab === "lots"}
              icon={<Boxes size={20} />}
              onClick={() => onNavigate("lots")}
            />

            {/* Columna central: placeholder para el FAB */}
            <div className="h-[64px]" />

            <NavItem
              label="Prendas"
              active={tab === "items"}
              icon={<Tag size={20} />}
              onClick={() => onNavigate("items")}
            />
            <NavItem
              label="Exportar"
              active={false}
              icon={<Download size={20} />}
              onClick={onExport}
            />
          </div>

          {/* FAB flotante */}
          <button
            type="button"
            onClick={onAdd}
            className={[
              "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
              "h-[64px] w-[64px] shrink-0",
              "rounded-[22px]",
              "bg-emerald-400 text-[#070b16]",
              "grid place-items-center",
              "ring-1 ring-emerald-200/20",
              "shadow-[0_18px_55px_rgba(16,185,129,0.35)]",
              "active:scale-[0.98] hover:brightness-95",
            ].join(" ")}
            aria-label="Añadir"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
