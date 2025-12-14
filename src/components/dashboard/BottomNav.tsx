// src/components/dashboard/BottomNav.tsx
"use client";

type View = "summary" | "lots" | "items";

export default function BottomNav({
  view,
  onChange,
  onAdd,
  onRefresh,
}: {
  view: View;
  onChange: (v: View) => void;
  onAdd: () => void;
  onRefresh: () => void;
}) {
  const btn = (active: boolean) =>
    `flex-1 rounded-2xl px-3 py-2 text-sm ${active ? "bg-emerald-400 text-[#070b16] font-semibold" : "bg-white/5 hover:bg-white/10"}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#070b16]/90 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-3">
        <button className={btn(view === "summary")} onClick={() => onChange("summary")}>
          Resumen
        </button>
        <button className={btn(view === "lots")} onClick={() => onChange("lots")}>
          Lotes
        </button>

        <button
          onClick={onAdd}
          className="rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-[#070b16]"
          title="Añadir"
        >
          +
        </button>

        <button className={btn(view === "items")} onClick={() => onChange("items")}>
          Prendas
        </button>
        <button className="flex-1 rounded-2xl bg-white/5 px-3 py-2 text-sm hover:bg-white/10" onClick={onRefresh}>
          Refrescar
        </button>
      </div>
    </div>
  );
}

type Props = {
  view: View;
  onChange: (v: View) => void;
  onAdd: () => void;
  onRefresh?: () => void;
};
