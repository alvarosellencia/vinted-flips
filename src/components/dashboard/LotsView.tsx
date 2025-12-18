"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type LotRow = Record<string, any>;

export default function LotsView({ lots }: { lots: LotRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return lots;
    return lots.filter((l) =>
      String(l.name ?? l.title ?? l.id ?? "")
        .toLowerCase()
        .includes(s)
    );
  }, [lots, q]);

  return (
    <section className="mt-6">
      <div className="vf-card">
        <div className="vf-card-inner flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">Lotes</div>
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
              placeholder="Buscar lote…"
              className="vf-input pl-11"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 vf-card">
        <div className="vf-card-inner">
          {filtered.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
              No hay lotes aún.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((l, idx) => (
                <div
                  key={l.id ?? idx}
                  className="rounded-2xl p-4"
                  style={{
                    border: "1px solid rgba(11,16,32,0.08)",
                    background: "rgba(255,255,255,0.70)",
                  }}
                >
                  <div className="font-semibold">{l.name ?? l.title ?? `Lote ${idx + 1}`}</div>
                  <div className="mt-1 text-sm" style={{ color: "var(--vf-muted)" }}>
                    {l.purchased_at
                      ? `Compra: ${String(l.purchased_at).slice(0, 10)}`
                      : l.created_at
                      ? `Creado: ${String(l.created_at).slice(0, 10)}`
                      : ""}
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