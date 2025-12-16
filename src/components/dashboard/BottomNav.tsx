"use client";

import React from "react";

type TabKey = "summary" | "lots" | "items";

function Icon({ name }: { name: "home" | "box" | "tag" | "refresh" | "plus" }) {
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
          <path d="M3 8v10l9 5 9-5V8" />
          <path d="M12 13v10" />
        </svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z" />
          <path d="M7 7h.01" />
        </svg>
      );
    case "refresh":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
  }
}

export default function BottomNav(props: any) {
  // Lectura compatible con varios nombres (para que no rompa aunque tu Dashboard use otra firma)
  const active: TabKey = (props.active ?? props.tab ?? props.view ?? "summary") as TabKey;

  const setActive = (next: TabKey) => {
    if (typeof props.setActive === "function") return props.setActive(next);
    if (typeof props.setTab === "function") return props.setTab(next);
    if (typeof props.setView === "function") return props.setView(next);
    if (typeof props.onTabChange === "function") return props.onTabChange(next);
  };

  const onAdd = () => {
    if (typeof props.onAdd === "function") return props.onAdd();
    if (typeof props.onOpenCreate === "function") return props.onOpenCreate();
  };

  const onRefresh = () => {
    if (typeof props.onRefresh === "function") return props.onRefresh();
    if (typeof props.refresh === "function") return props.refresh();
    if (typeof props.refetch === "function") return props.refetch();
  };

  const Item = ({
    label,
    icon,
    isActive,
    onClick,
  }: {
    label: string;
    icon: React.ReactNode;
    isActive?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={["vf-navbtn", isActive ? "text-emerald-300" : "text-slate-300/90"].join(" ")}
      aria-label={label}
      title={label}
    >
      <div className="grid place-items-center">{icon}</div>
      <div className="mt-1 text-[11px] leading-none opacity-80">{label}</div>
    </button>
  );

  return (
    <nav className="vf-bottomnav" role="navigation" aria-label="Navegación inferior">
      <div className="mx-auto flex max-w-3xl items-stretch justify-between gap-2 px-3">
        <Item label="Resumen" icon={<Icon name="home" />} isActive={active === "summary"} onClick={() => setActive("summary")} />
        <Item label="Lotes" icon={<Icon name="box" />} isActive={active === "lots"} onClick={() => setActive("lots")} />

        <button type="button" onClick={onAdd} className="vf-navfab" aria-label="Añadir" title="Añadir">
          <Icon name="plus" />
        </button>

        <Item label="Prendas" icon={<Icon name="tag" />} isActive={active === "items"} onClick={() => setActive("items")} />

        <button type="button" onClick={onRefresh} className="vf-navbtn text-slate-300/90" aria-label="Refrescar" title="Refrescar">
          <div className="grid place-items-center">
            <Icon name="refresh" />
          </div>
          <div className="mt-1 text-[11px] leading-none opacity-80">Sync</div>
        </button>
      </div>
    </nav>
  );
}