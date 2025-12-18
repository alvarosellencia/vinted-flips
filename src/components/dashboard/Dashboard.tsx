"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PeriodChips, { PeriodKey } from "@/components/dashboard/PeriodChips";
import BottomNav, { TabKey } from "@/components/dashboard/BottomNav";
import KpiCards from "@/components/dashboard/KpiCards";
import LotsView from "@/components/dashboard/LotsView";
import ItemsView from "@/components/dashboard/ItemsView";
import { X, ChevronLeft } from "lucide-react";

type LotRow = Record<string, any>;
type ItemRow = Record<string, any>;

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function pickNumber(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
}
function pickDate(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (!v) continue;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}
function normalizeStatus(s: any): "for_sale" | "sold" | "reserved" | "returned" {
  const v = String(s ?? "").toLowerCase();
  if (["sold", "vendida", "vendido"].includes(v)) return "sold";
  if (["reserved", "reservada", "reservado"].includes(v)) return "reserved";
  if (["returned", "devuelta", "return"].includes(v)) return "returned";
  if (["for_sale", "en_venta", "forsale", "listed", "en venta"].includes(v)) return "for_sale";
  return "for_sale";
}

function toCSV(rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) return "";
  const colSet = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(r ?? {})) colSet.add(k);
  }
  const cols = Array.from(colSet);

  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    if (/[,"\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  const header = cols.join(",");
  const lines = rows.map((r) => cols.map((c) => esc(r?.[c])).join(","));
  return [header, ...lines].join("\n");
}

function downloadCSV(filename: string, rows: Record<string, any>[]) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export default function Dashboard({ userId }: { userId: string }) {
  const [tab, setTab] = useState<TabKey>("summary");
  const [period, setPeriod] = useState<PeriodKey>("all");

  const [lots, setLots] = useState<LotRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Modal "+"
  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<"choose" | "item" | "lot">("choose");

  // Modal edición
  const [editOpen, setEditOpen] = useState(false);
  const [editStep, setEditStep] = useState<"item" | "lot">("item");
  const [editItem, setEditItem] = useState<ItemRow | null>(null);
  const [editLot, setEditLot] = useState<LotRow | null>(null);

  // Forms (crear)
  const [newLotName, setNewLotName] = useState("");
  const [newLotTotalCost, setNewLotTotalCost] = useState<string>("");

  const [newItemName, setNewItemName] = useState("");
  const [newItemStatus, setNewItemStatus] = useState<"for_sale" | "reserved" | "sold" | "returned">("for_sale");
  const [newItemLotId, setNewItemLotId] = useState<string>("");
  const [newItemPurchasePrice, setNewItemPurchasePrice] = useState<string>("");
  const [newItemSalePrice, setNewItemSalePrice] = useState<string>("");
  const [newItemListingDate, setNewItemListingDate] = useState<string>("");
  const [newItemSaleDate, setNewItemSaleDate] = useState<string>("");
  const [newItemSize, setNewItemSize] = useState<string>("");

  // Forms (editar item)
  const [eName, setEName] = useState("");
  const [eStatus, setEStatus] = useState<"for_sale" | "reserved" | "sold" | "returned">("for_sale");
  const [eLotId, setELotId] = useState<string>("");
  const [ePurchasePrice, setEPurchasePrice] = useState<string>("");
  const [eSalePrice, setESalePrice] = useState<string>("");
  const [eListingDate, setEListingDate] = useState<string>("");
  const [eSaleDate, setESaleDate] = useState<string>("");
  const [eSize, setESize] = useState<string>("");

  // Forms (editar lot)
  const [lName, setLName] = useState("");
  const [lTotalCost, setLTotalCost] = useState<string>("");

  const range = useMemo(() => {
    if (period === "month") return { from: startOfMonth(), to: null as Date | null };
    if (period === "30d") return { from: daysAgo(30), to: null as Date | null };
    if (period === "custom") return { from: daysAgo(7), to: null as Date | null }; // placeholder
    return { from: null as Date | null, to: null as Date | null };
  }, [period]);

  const reloadAll = async () => {
    setErr(null);

    const lotsRes = await supabase
      .from("lots")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const itemsRes = await supabase
      .from("items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (lotsRes.error) setErr(lotsRes.error.message);
    if (itemsRes.error) setErr(itemsRes.error.message);

    setLots(lotsRes.data ?? []);
    setItems(itemsRes.data ?? []);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      await reloadAll();
      if (!alive) return;
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  // Filtrado por periodo (venta si existe, si no published/listing, si no created_at)
  const itemsInPeriod = useMemo(() => {
    if (!range.from) return items;

    const from = range.from.getTime();
    const to = range.to?.getTime() ?? null;

    return items.filter((it) => {
      const d =
        pickDate(it, ["sale_date", "sold_at", "sold_date"]) ??
        pickDate(it, ["listing_date", "listed_at", "published_at"]) ??
        pickDate(it, ["created_at", "updated_at"]);
      if (!d) return false;
      const t = d.getTime();
      if (to != null) return t >= from && t <= to;
      return t >= from;
    });
  }, [items, range.from, range.to]);

  // Mapas para costes unitarios de lote
  const lotsById = useMemo(() => {
    const m = new Map<string, LotRow>();
    for (const l of lots) if (l?.id) m.set(String(l.id), l);
    return m;
  }, [lots]);

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

  const unitCostForItem = (it: ItemRow) => {
    const lotId = it?.lot_id ? String(it.lot_id) : "";
    if (lotId && lotsById.has(lotId)) {
      const lot = lotsById.get(lotId)!;
      const lotTotalCost = pickNumber(lot, ["total_cost"]); // TU columna ✅
      const denom = Math.max(1, (itemsByLotId.get(lotId)?.length ?? 0) || 1);
      return lotTotalCost / denom;
    }
    return pickNumber(it, ["purchase_price"]); // TU columna ✅
  };

  // KPIs
  const kpis = useMemo(() => {
    const soldItems = itemsInPeriod.filter((it) => normalizeStatus(it.status) === "sold");

    const soldRevenue = soldItems.reduce((sum, it) => {
      const sale = pickNumber(it, ["sale_price", "sold_price", "price_sold"]);
      return sum + (sale || 0);
    }, 0);

    const totalProfit = soldItems.reduce((sum, it) => {
      const sale = pickNumber(it, ["sale_price", "sold_price", "price_sold"]);
      const unitCost = unitCostForItem(it);
      return sum + (sale - unitCost);
    }, 0);

    const soldOrReservedWithLot = itemsInPeriod.filter((it) => {
      const st = normalizeStatus(it.status);
      return (st === "sold" || st === "reserved") && it.lot_id;
    });

    const lotIds = new Set<string>();
    soldOrReservedWithLot.forEach((it) => lotIds.add(String(it.lot_id)));

    const lotRevenuePotential = soldOrReservedWithLot.reduce((sum, it) => {
      const sale = pickNumber(it, ["sale_price", "sold_price", "price_sold"]);
      return sum + (sale || 0);
    }, 0);

    const lotsCost = Array.from(lotIds).reduce((sum, id) => {
      const lot = lotsById.get(id);
      if (!lot) return sum;
      return sum + pickNumber(lot, ["total_cost"]);
    }, 0);

    const lotProfit = lotRevenuePotential - lotsCost;
    const soldMargin = soldRevenue > 0 ? totalProfit / soldRevenue : null;

    const avgDaysToSell = (() => {
      const soldWithDates = soldItems
        .map((it) => {
          const soldAt = pickDate(it, ["sale_date", "sold_at", "sold_date"]);
          const pubAt = pickDate(it, ["listing_date", "listed_at", "published_at", "created_at"]);
          if (!soldAt || !pubAt) return null;
          const days = (soldAt.getTime() - pubAt.getTime()) / (1000 * 60 * 60 * 24);
          return days >= 0 ? days : null;
        })
        .filter((x): x is number => typeof x === "number");

      if (!soldWithDates.length) return null;
      return soldWithDates.reduce((a, b) => a + b, 0) / soldWithDates.length;
    })();

    return { totalProfit, lotProfit, soldMargin, avgDaysToSell };
  }, [itemsInPeriod, lotsById, itemsByLotId]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Export pestaña actual
  const onExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    if (tab === "lots") return downloadCSV(`vinted-flips-lotes-${date}.csv`, lots);
    if (tab === "items") return downloadCSV(`vinted-flips-prendas-${date}.csv`, items);

    return downloadCSV(`vinted-flips-resumen-${date}.csv`, [
      {
        period,
        totalProfit: kpis.totalProfit,
        lotProfit: kpis.lotProfit,
        soldMargin: kpis.soldMargin,
        avgDaysToSell: kpis.avgDaysToSell,
      },
    ]);
  };

  // Abrir modal +
  const openAdd = () => {
    setErr(null);
    setAddOpen(true);
    setAddStep("choose");

    setNewLotName("");
    setNewLotTotalCost("");

    setNewItemName("");
    setNewItemStatus("for_sale");
    setNewItemLotId("");
    setNewItemPurchasePrice("");
    setNewItemSalePrice("");
    setNewItemListingDate("");
    setNewItemSaleDate("");
    setNewItemSize("");
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddStep("choose");
  };

  const submitNewLot = async () => {
    setErr(null);
    const name = newLotName.trim();
    if (!name) return setErr("Pon un nombre para el lote.");

    const total_cost = newLotTotalCost.trim() ? Number(newLotTotalCost) : null;
    const payload: Record<string, any> = { user_id: userId, name };
    if (total_cost != null && !Number.isNaN(total_cost)) payload.total_cost = total_cost;

    const { error } = await supabase.from("lots").insert([payload]);
    if (error) return setErr(error.message);

    await reloadAll();
    closeAdd();
    setTab("lots");
  };

  const submitNewItem = async () => {
    setErr(null);
    const name = newItemName.trim();
    if (!name) return setErr("Pon un nombre para la prenda.");

    const payload: Record<string, any> = {
      user_id: userId,
      name,
      status: newItemStatus, // guardamos canónico
    };

    if (newItemLotId) payload.lot_id = newItemLotId;

    if (newItemPurchasePrice.trim()) {
      const n = Number(newItemPurchasePrice);
      if (!Number.isNaN(n)) payload.purchase_price = n;
    }

    if (newItemSalePrice.trim()) {
      const n = Number(newItemSalePrice);
      if (!Number.isNaN(n)) payload.sale_price = n;
    }

    if (newItemListingDate.trim()) payload.listing_date = newItemListingDate.trim();
    if (newItemSaleDate.trim()) payload.sale_date = newItemSaleDate.trim();
    if (newItemSize.trim()) payload.size = newItemSize.trim();

    const { error } = await supabase.from("items").insert([payload]);
    if (error) return setErr(error.message);

    await reloadAll();
    closeAdd();
    setTab("items");
  };

  // Edit modals
  const openEditItem = (it: ItemRow) => {
    setErr(null);
    setEditOpen(true);
    setEditStep("item");
    setEditItem(it);
    setEditLot(null);

    setEName(String(it?.name ?? it?.title ?? ""));
    setEStatus(normalizeStatus(it?.status));
    setELotId(it?.lot_id ? String(it.lot_id) : "");
    setEPurchasePrice(it?.purchase_price != null ? String(it.purchase_price) : "");
    setESalePrice(it?.sale_price != null ? String(it.sale_price) : "");
    setEListingDate(it?.listing_date ? String(it.listing_date).slice(0, 10) : "");
    setESaleDate(it?.sale_date ? String(it.sale_date).slice(0, 10) : "");
    setESize(it?.size != null ? String(it.size) : "");
  };

  const openEditLot = (l: LotRow) => {
    setErr(null);
    setEditOpen(true);
    setEditStep("lot");
    setEditLot(l);
    setEditItem(null);

    setLName(String(l?.name ?? l?.title ?? ""));
    setLTotalCost(l?.total_cost != null ? String(l.total_cost) : "");
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditItem(null);
    setEditLot(null);
  };

  const submitEditItem = async () => {
    if (!editItem?.id) return;
    setErr(null);

    const payload: Record<string, any> = {
      name: eName.trim(),
      status: eStatus,
      lot_id: eLotId ? eLotId : null,
      size: eSize.trim() ? eSize.trim() : null,
      listing_date: eListingDate.trim() ? eListingDate.trim() : null,
      sale_date: eSaleDate.trim() ? eSaleDate.trim() : null,
    };

    // Si es prenda suelta: permitimos purchase_price; si va en lote, puedes dejarlo vacío y usamos el unit cost.
    payload.purchase_price = ePurchasePrice.trim() ? Number(ePurchasePrice) : null;
    payload.sale_price = eSalePrice.trim() ? Number(eSalePrice) : null;

    const { error } = await supabase
      .from("items")
      .update(payload)
      .eq("id", editItem.id)
      .eq("user_id", userId);

    if (error) return setErr(error.message);

    await reloadAll();
    closeEdit();
  };

  const submitEditLot = async () => {
    if (!editLot?.id) return;
    setErr(null);

    const payload: Record<string, any> = {
      name: lName.trim(),
      total_cost: lTotalCost.trim() ? Number(lTotalCost) : null,
    };

    const { error } = await supabase
      .from("lots")
      .update(payload)
      .eq("id", editLot.id)
      .eq("user_id", userId);

    if (error) return setErr(error.message);

    await reloadAll();
    closeEdit();
  };

  return (
    <>
      <main className="vf-shell">
        <header className="vf-header">
          <div>
            <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
              Vinted Flips
            </div>
            <h1 className="vf-title">Panel (beta)</h1>
          </div>

          <button type="button" className="vf-btn" onClick={onLogout}>
            Cerrar sesión
          </button>
        </header>

        <div className="mt-5">
          <PeriodChips value={period} onChange={setPeriod} />
        </div>

        {err && (
          <div className="mt-4 vf-card">
            <div className="vf-card-inner">
              <div className="text-sm font-medium text-red-600">{err}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm" style={{ color: "var(--vf-muted)" }}>
            Cargando datos…
          </div>
        ) : (
          <>
            {tab === "summary" && <KpiCards kpis={kpis as any} />}

            {tab === "lots" && (
              <LotsView
                lots={lots}
                items={items}
                onEditLot={openEditLot}
              />
            )}

            {tab === "items" && (
              <ItemsView
                items={items}
                lots={lots}
                getUnitCost={(it) => unitCostForItem(it)}
                onEditItem={openEditItem}
              />
            )}
          </>
        )}
      </main>

      <BottomNav active={tab} onNavigate={setTab} onAdd={openAdd} onExport={onExport} />

      {/* MODAL ADD */}
      {addOpen && (
        <div className="vf-modal-backdrop" onMouseDown={closeAdd}>
          <div className="vf-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="vf-modal-head">
              <div className="flex items-center gap-2">
                {addStep !== "choose" && (
                  <button className="vf-btn" onClick={() => setAddStep("choose")} aria-label="Volver">
                    <ChevronLeft size={18} />
                  </button>
                )}
                <div className="font-semibold">
                  {addStep === "choose"
                    ? "Añadir"
                    : addStep === "item"
                    ? "Añadir prenda"
                    : "Añadir lote"}
                </div>
              </div>

              <button className="vf-btn" onClick={closeAdd} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="vf-modal-body">
              {addStep === "choose" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button className="vf-btn-primary" onClick={() => setAddStep("item")}>
                    Añadir prenda
                  </button>
                  <button className="vf-btn" onClick={() => setAddStep("lot")}>
                    Añadir lote
                  </button>
                </div>
              )}

              {addStep === "lot" && (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium">Nombre del lote</span>
                    <input
                      className="vf-input mt-2"
                      value={newLotName}
                      onChange={(e) => setNewLotName(e.target.value)}
                      placeholder="Ej: LOTE-Invierno-10prendas"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Coste total del lote (total_cost)</span>
                    <input
                      className="vf-input mt-2"
                      value={newLotTotalCost}
                      onChange={(e) => setNewLotTotalCost(e.target.value)}
                      placeholder="Ej: 75"
                      inputMode="decimal"
                    />
                  </label>

                  <button className="vf-btn-primary w-full" onClick={submitNewLot}>
                    Guardar lote
                  </button>
                </div>
              )}

              {addStep === "item" && (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium">Nombre de la prenda</span>
                    <input
                      className="vf-input mt-2"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Ej: Sudadera Nike Tech azul"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-medium">Estado</span>
                      <select
                        className="vf-input mt-2"
                        value={newItemStatus}
                        onChange={(e) => setNewItemStatus(e.target.value as any)}
                      >
                        <option value="for_sale">en venta</option>
                        <option value="reserved">reservada</option>
                        <option value="sold">vendida</option>
                        <option value="returned">devuelta</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium">Talla</span>
                      <input
                        className="vf-input mt-2"
                        value={newItemSize}
                        onChange={(e) => setNewItemSize(e.target.value)}
                        placeholder="Ej: M"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium">Lote (opcional)</span>
                    <select
                      className="vf-input mt-2"
                      value={newItemLotId}
                      onChange={(e) => setNewItemLotId(e.target.value)}
                    >
                      <option value="">— Sin lote —</option>
                      {lots.map((l) => (
                        <option key={String(l.id)} value={String(l.id)}>
                          {String(l.name ?? l.title ?? l.id)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-medium">Precio compra (purchase_price)</span>
                      <input
                        className="vf-input mt-2"
                        value={newItemPurchasePrice}
                        onChange={(e) => setNewItemPurchasePrice(e.target.value)}
                        placeholder="Ej: 4.50"
                        inputMode="decimal"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium">Precio venta (sale_price)</span>
                      <input
                        className="vf-input mt-2"
                        value={newItemSalePrice}
                        onChange={(e) => setNewItemSalePrice(e.target.value)}
                        placeholder="Ej: 18"
                        inputMode="decimal"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-medium">Fecha publicación (listing_date)</span>
                      <input
                        className="vf-input mt-2"
                        type="date"
                        value={newItemListingDate}
                        onChange={(e) => setNewItemListingDate(e.target.value)}
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium">Fecha venta (sale_date)</span>
                      <input
                        className="vf-input mt-2"
                        type="date"
                        value={newItemSaleDate}
                        onChange={(e) => setNewItemSaleDate(e.target.value)}
                      />
                    </label>
                  </div>

                  <button className="vf-btn-primary w-full" onClick={submitNewItem}>
                    Guardar prenda
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {editOpen && (
        <div className="vf-modal-backdrop" onMouseDown={closeEdit}>
          <div className="vf-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="vf-modal-head">
              <div className="font-semibold">{editStep === "item" ? "Editar prenda" : "Editar lote"}</div>
              <button className="vf-btn" onClick={closeEdit} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="vf-modal-body">
              {editStep === "item" && (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium">Nombre</span>
                    <input className="vf-input mt-2" value={eName} onChange={(e) => setEName(e.target.value)} />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-medium">Estado</span>
                      <select className="vf-input mt-2" value={eStatus} onChange={(e) => setEStatus(e.target.value as any)}>
                        <option value="for_sale">en venta</option>
                        <option value="reserved">reservada</option>
                        <option value="sold">vendida</option>
                        <option value="returned">devuelta</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium">Talla</span>
                      <input className="vf-input mt-2" value={eSize} onChange={(e) => setESize(e.target.value)} />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium">Lote</span>
                    <select className="vf-input mt-2" value={eLotId} onChange={(e) => setELotId(e.target.value)}>
                      <option value="">— Sin lote —</option>
                      {lots.map((l) => (
                        <option key={String(l.id)} value={String(l.id)}>
                          {String(l.name ?? l.title ?? l.id)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-medium">Precio compra (purchase_price)</span>
                      <input className="vf-input mt-2" value={ePurchasePrice} onChange={(e) => setEPurchasePrice(e.target.value)} inputMode="decimal" />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium">Precio venta (sale_price)</span>
                      <input className="vf-input mt-2" value={eSalePrice} onChange={(e) => setESalePrice(e.target.value)} inputMode="decimal" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-medium">Fecha publicación</span>
                      <input className="vf-input mt-2" type="date" value={eListingDate} onChange={(e) => setEListingDate(e.target.value)} />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium">Fecha venta</span>
                      <input className="vf-input mt-2" type="date" value={eSaleDate} onChange={(e) => setESaleDate(e.target.value)} />
                    </label>
                  </div>

                  <button className="vf-btn-primary w-full" onClick={submitEditItem}>
                    Guardar cambios
                  </button>
                </div>
              )}

              {editStep === "lot" && (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium">Nombre</span>
                    <input className="vf-input mt-2" value={lName} onChange={(e) => setLName(e.target.value)} />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Coste total (total_cost)</span>
                    <input className="vf-input mt-2" value={lTotalCost} onChange={(e) => setLTotalCost(e.target.value)} inputMode="decimal" />
                  </label>

                  <button className="vf-btn-primary w-full" onClick={submitEditLot}>
                    Guardar cambios
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}