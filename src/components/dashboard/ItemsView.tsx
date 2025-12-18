"use client";

import { useMemo, useState } from "react";
import { Search, Pencil } from "lucide-react";

type ItemRow = Record<string, any>;
type LotRow = Record<string, any>;

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function statusLabel(s: any) {
  const v = String(s ?? "").toLowerCase();
  if (v === "sold") return "Vendida";
  if (v === "reserved") return "Reservada";
  if (v === "returned") return "Devuelta";
  return "En venta";
}

function StatusPill({ status }: { status: any }) {
  const v = String(status ?? "").toLowerCase();
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";

  if (v === "sold") {
    return <span className={`${base} bg-emerald-500/10 text-emerald-700 ring-emerald-500/20`}>Vendida</span>;
  }
  if (v === "reserved") {
    return <span className={`${base} bg-[#B68900]/10 text-[#8A6400] ring-[#B68900]/20`}>Reservada</span>;
  }
  if (v === "returned") {
    return <span className={`${base} bg-rose-500/10 text-rose-700 ring-rose-500/20`}>Devuelta</span>;
  }
  return <span className={`${base} bg-[#7B1DF7]/10 text-[#7B1DF7] ring-[#7B1DF7]/20`}>En venta</span>;
}

export default function ItemsView({
  items,
  lots,
  getUnitCost,
  onEditItem,
}: {
  items: ItemRow[];
  lots: LotRow[];
  getUnitCost: (it: ItemRow) => number;
  onEditItem: (it: ItemRow) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((it) => {
      const name = String(it.name ?? it.title ?? it.brand ?? "");
      return name.toLowerCase().includes(query);
    });
  }, [items, q]);

  const lotsById = useMemo(() => {
    const m = new Map<string, LotRow>();
    for (const l of lots) if (l?.id) m.set(String(l.id), l);
    return m;
  }, [lots]);

  return (
    <section className="mt-6">
      <div className="vf-card">
        <div className="vf-card-inner flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold">Prendas</div>
            <div className="text-sm opacity-70">{filtered.length} / {items.length}</div>
          </div>

          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="vf-input pl-9"
              placeholder="Buscar prenda…"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 vf-card">
        <div className="vf-card-inner">
          {filtered.length === 0 ? (
            <div className="text-sm opacity-70">No hay prendas que coincidan.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((it, idx) => {
                const name = it.name ?? it.title ?? it.brand ?? `Prenda ${idx + 1}`;

                const status = String(it.status ?? "for_sale");
                const purchase = it.purchase_price != null ? Number(it.purchase_price) : null;
                const sale = it.sale_price != null ? Number(it.sale_price) : null;

                const unitCost = getUnitCost(it);
                const isSold = String(status).toLowerCase() === "sold";
                const profit = isSold && sale != null ? (sale - unitCost) : null;

                const lotName = it.lot_id && lotsById.get(String(it.lot_id))
                  ? String(lotsById.get(String(it.lot_id))?.name ?? "")
                  : null;

                return (
                  <div key={it.id ?? idx} className="vf-panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-semibold truncate">{name}</div>
                          <StatusPill status={status} />
                        </div>

                        <div className="mt-1 text-sm opacity-70">
                          {it.size ? <>Talla: <span className="font-medium">{String(it.size)}</span></> : null}
                          {lotName ? <> · Lote: <span className="font-medium">{lotName}</span></> : null}
                        </div>
                      </div>

                      <button className="vf-btn" onClick={() => onEditItem(it)} aria-label="Editar prenda">
                        <Pencil size={18} />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <div className="text-xs opacity-60">Coste (unit.)</div>
                        <div className="font-semibold">{EUR.format(unitCost)}</div>
                      </div>

                      <div>
                        <div className="text-xs opacity-60">Compra</div>
                        <div className="font-semibold">{purchase == null ? "—" : EUR.format(purchase)}</div>
                      </div>

                      <div>
                        <div className="text-xs opacity-60">Venta</div>
                        <div className="font-semibold">{sale == null ? "—" : EUR.format(sale)}</div>
                      </div>

                      <div>
                        <div className="text-xs opacity-60">Beneficio</div>
                        <div className={`font-semibold ${profit == null ? "" : profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {profit == null ? "—" : EUR.format(profit)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs opacity-60">
                      {it.listing_date ? `Publicación: ${String(it.listing_date).slice(0, 10)}` : ""}
                      {it.sale_date ? ` · Venta: ${String(it.sale_date).slice(0, 10)}` : ""}
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