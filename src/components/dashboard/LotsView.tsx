"use client";

import { useMemo, useState } from "react";
import { Search, Pencil } from "lucide-react";

type LotRow = Record<string, any>;
type ItemRow = Record<string, any>;

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default function LotsView({
  lots,
  items,
  onEditLot,
}: {
  lots: LotRow[];
  items: ItemRow[];
  onEditLot: (lot: LotRow) => void;
}) {
  const [q, setQ] = useState("");

  const itemsByLotId = useMemo(() => {
    const m = new Map<string, ItemRow[]>();
    for (const it of items) {
      const lid = it?.lot_id ? String(it.lot_id) : "";
      if (!lid) continue;
      const arr = m.get(lid) ?? [];
      arr.push(it);
      m.set(lid, arr);
    }
    return m;
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return lots;
    return lots.filter((l) => String(l.name ?? l.title ?? "").toLowerCase().includes(query));
  }, [lots, q]);

  return (
    <section className="mt-6">
      <div className="vf-card">
        <div className="vf-card-inner flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold">Lotes</div>
            <div className="text-sm opacity-70">{filtered.length} / {lots.length}</div>
          </div>

          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="vf-input pl-9"
              placeholder="Buscar lote…"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 vf-card">
        <div className="vf-card-inner">
          {filtered.length === 0 ? (
            <div className="text-sm opacity-70">No hay lotes que coincidan.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((l, idx) => {
                const id = String(l.id ?? idx);
                const name = l.name ?? l.title ?? `Lote ${idx + 1}`;
                const totalCost = l.total_cost != null ? Number(l.total_cost) : 0;
                const count = itemsByLotId.get(String(l.id))?.length ?? 0;
                const unit = count > 0 ? totalCost / count : null;

                return (
                  <div key={id} className="vf-panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{String(name)}</div>
                        <div className="mt-1 text-sm opacity-70">
                          {l.created_at ? `Creado: ${String(l.created_at).slice(0, 10)}` : ""}
                        </div>
                      </div>

                      <button className="vf-btn" onClick={() => onEditLot(l)} aria-label="Editar lote">
                        <Pencil size={18} />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs opacity-60">Coste total</div>
                        <div className="font-semibold">{EUR.format(totalCost)}</div>
                      </div>

                      <div>
                        <div className="text-xs opacity-60">Prendas</div>
                        <div className="font-semibold">{count}</div>
                      </div>

                      <div>
                        <div className="text-xs opacity-60">Coste unitario</div>
                        <div className="font-semibold">{unit == null ? "—" : EUR.format(unit)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}