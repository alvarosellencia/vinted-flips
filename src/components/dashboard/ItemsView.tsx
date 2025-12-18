"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type ItemRow = Record<string, any>;

export default function ItemsView({ items }: { items: ItemRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      String(it.title ?? it.name ?? it.brand ?? it.id ?? "")
        .toLowerCase()
        .includes(s)
    );
  }, [items, q]);

  return (
    <section className="mt-6">
      <div className="vf-card">
        <div className="vf-card-inner flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">Prendas</div>
          <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
            {filtered.length}
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar prenda…"
              className="vf-input pl-11"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 vf-card">
        <div className="vf-card-inner">
          {filtered.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
              Aún no tienes prendas.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((it, idx) => (
                <div
                  key={it.id ?? idx}
                  className="rounded-2xl p-4"
                  style={{
                    border: "1px solid rgba(11,16,32,0.08)",
                    background: "rgba(255,255,255,0.70)",
                  }}
                >
                  <div className="font-semibold">
                    {it.title ?? it.name ?? it.brand ?? `Prenda ${idx + 1}`}
                  </div>
                  <div className="text-sm mt-1" style={{ color: "var(--vf-muted)" }}>
                    {it.status ? `Estado: ${it.status}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}