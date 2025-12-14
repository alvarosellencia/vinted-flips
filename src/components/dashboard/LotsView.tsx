// src/components/dashboard/LotsView.tsx
"use client";

import type { ItemRow, LotRow } from "../../lib/types";
import { fmtEUR } from "../../lib/metrics";

export default function LotsView({ lots, items }: { lots: LotRow[]; items: ItemRow[] }) {
  return (
    <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-semibold">Lotes</h2>

      <div className="mt-3 space-y-2">
        {lots.map((l) => {
          const count = items.filter((it) => it.lot_id === l.id || it.lot_name === l.name).length;
          return (
            <div key={l.id} className="rounded-2xl border border-white/10 bg-[#070b16]/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{l.name}</div>
                  <div className="mt-1 text-sm opacity-75">
                    Coste total: {fmtEUR(l.total_cost ?? 0)} · Unitario: {fmtEUR(l.unit_cost ?? 0)} · Prendas: {count}
                  </div>
                </div>
                <div className="shrink-0 text-sm opacity-70">{l.purchase_date ?? "—"}</div>
              </div>
            </div>
          );
        })}

        {lots.length === 0 && <div className="opacity-75">No hay lotes.</div>}
      </div>
    </section>
  );
}
