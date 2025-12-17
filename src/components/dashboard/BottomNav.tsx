"use client";

import { Home, Boxes, Tag, RefreshCcw, Plus } from "lucide-react";

export type TabKey = "summary" | "lots" | "items";

export default function BottomNav({
  tab,
  onNavigate,
  onAdd,
  onSync,
}: {
  tab: TabKey;
  onNavigate: (t: TabKey) => void;
  onAdd: () => void;
  onSync: () => void;
}) {
  const Item = ({
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
        "flex flex-col items-center justify-center gap-1",
        "px-3 py-2",
        "min-w-[72px]",
        "rounded-2xl",
        active ? "text-emerald-200" : "text-white/65",
      ].join(" ")}
    >
      <div
        className={[
          "grid place-items-center",
          "h-9 w-9 rounded-xl",
          active ? "bg-emerald-400/15 ring-1 ring-emerald-300/20" : "bg-white/0",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="text-[12px] leading-none">{label}</div>
    </button>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
      <div className="mx-auto max-w-3xl">
        <div className="vf-panel relative flex items-center justify-between gap-2 px-3 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.25)]">
          <Item
            label="Resumen"
            active={tab === "summary"}
            icon={<Home size={20} />}
            onClick={() => onNavigate("summary")}
          />
          <Item
            label="Lotes"
            active={tab === "lots"}
            icon={<Boxes size={20} />}
            onClick={() => onNavigate("lots")}
          />

          {/* Botón central */}
          <button
            type="button"
            onClick={onAdd}
            className={[
              "mx-1",
              "h-14 w-14 rounded-2xl",
              "bg-emerald-400 text-[#070b16]",
              "grid place-items-center",
              "shadow-[0_12px_35px_rgba(16,185,129,0.25)]",
              "hover:brightness-95 active:scale-[0.98]",
            ].join(" ")}
            aria-label="Añadir"
          >
            <Plus size={22} />
          </button>

          <Item
            label="Prendas"
            active={tab === "items"}
            icon={<Tag size={20} />}
            onClick={() => onNavigate("items")}
          />
          <button
            type="button"
            onClick={onSync}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[72px] rounded-2xl text-white/65"
          >
            <div className="grid place-items-center h-9 w-9 rounded-xl">
              <RefreshCcw size={20} />
            </div>
            <div className="text-[12px] leading-none">Sync</div>
          </button>
        </div>
      </div>
    </div>
  );
}