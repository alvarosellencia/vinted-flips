// src/components/dashboard/ItemsView.tsx
"use client";

import type { ItemRow, LotRow } from "../../lib/types";
import { fmtEUR, netRevenue, resolveLotForItem } from "../../lib/metrics";

export default function ItemsView({ items, lots }: { items: ItemRow[]; lots: LotRow[] }) {
  return (
    <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-semibold">Prendas</h2>

      <div className="mt-3 space-y-2">
        {items.map((it) => {
          const lot = resolveLotForItem(it, lots);
          return (
            <div key={it.id} className="rounded-2xl border border-white/10 bg-[#070b16]/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{it.name}</div>
                  <div className="mt-1 text-sm opacity-75">
                    Estado: {it.status} · Lote: {lot?.name ?? it.lot_name ?? "—"}
                  </div>
                  <div className="mt-1 text-sm opacity-75">
                    Venta neta: {fmtEUR(netRevenue(it))} · Fecha venta: {it.sale_date ?? "—"}
                  </div>
                </div>
                <div className="shrink-0 text-sm opacity-70">{it.listing_date ?? "—"}</div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && <div className="opacity-75">No hay prendas.</div>}
      </div>
    </section>
  );
}
type Props = {
  items: ItemRow[];
  onEditItem?: (it: ItemRow) => void;
  onDeleteItem?: (it: ItemRow) => void;
};
