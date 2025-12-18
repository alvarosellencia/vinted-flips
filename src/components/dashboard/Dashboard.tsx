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
function normalizeStatus(s: any) {
  const v = String(s ?? "").toLowerCase();
  if (["sold", "vendida", "vendido"].includes(v)) return "sold";
  if (["reserved", "reservada", "reservado"].includes(v)) return "reserved";
  if (["for_sale", "en_venta", "forsale", "listed"].includes(v)) return "for_sale";
  if (["returned", "devuelta", "return"].includes(v)) return "returned";
  return v || "unknown";
}

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const cols = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    if (/[,"\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  const header = cols.join(",");
  const lines = rows.map((r) => cols.map((c) => esc(r[c])).join(","));
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

  // Forms (mínimos para no romper por columnas desconocidas)
  const [newLotName, setNewLotName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemStatus, setNewItemStatus] = useState<"for_sale" | "reserved" | "sold">("for_sale");
  const [newItemLotId, setNewItemLotId] = useState<string>("");

  const range = useMemo(() => {
    if (period === "month") return { from: startOfMonth(), to: null as Date | null };
    if (period === "30d") return { from: daysAgo(30), to: null as Date | null };
    if (period === "custom") return { from: daysAgo(7), to: null as Date | null }; // placeholder
    return { from: null as Date | null, to: null as Date | null };
  }, [period]);

  // Fetch inicial
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
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

      if (!alive) return;

      if (lotsRes.error) setErr(lotsRes.error.message);
      if (itemsRes.error) setErr(itemsRes.error.message);

      setLots(lotsRes.data ?? []);
      setItems(itemsRes.data ?? []);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  // Filtrado por periodo (usando fecha de venta si existe; si no, updated/created)
  const itemsInPeriod = useMemo(() => {
    if (!range.from) return items;

    const from = range.from.getTime();
    const to = range.to?.getTime() ?? null;

    return items.filter((it) => {
      const d = pickDate(it, ["sold_at", "sale_date", "sold_date", "updated_at", "created_at"]);
      if (!d) return false;
      const t = d.getTime();
      if (to != null) return t >= from && t <= to;
      return t >= from;
    });
  }, [items, range.from, range.to]);

  // KPIs robustos (sin depender de una columna exacta de neto)
  const kpis = useMemo(() => {
    const lotsById = new Map<string, LotRow>();
    lots.forEach((l) => {
      if (l?.id) lotsById.set(String(l.id), l);
    });

    const sold = itemsInPeriod.filter((it) => normalizeStatus(it.status) === "sold");

    const soldNet = sold.reduce((sum, it) => {
      const net = pickNumber(it, [
        "net_income",
        "net_revenue",
        "income_net",
        "ingresos_netos",
        "sold_net",
        "sold_income",
        "revenue_net",
        "sale_net",
      ]);
      const soldPrice = pickNumber(it, ["sold_price", "sale_price", "price_sold", "price"]);
      return sum + (net || soldPrice || 0);
    }, 0);

    const soldProfit = sold.reduce((sum, it) => {
      let unitCost = pickNumber(it, ["unit_cost", "cost_unit", "purchase_unit_cost"]);
      const lotId = it.lot_id ? String(it.lot_id) : "";
      if (!unitCost && lotId && lotsById.has(lotId)) {
        const lot = lotsById.get(lotId)!;
        unitCost =
          pickNumber(lot, ["unit_cost"]) ||
          (pickNumber(lot, ["total_cost", "cost_total"]) /
            Math.max(1, pickNumber(lot, ["items_count", "items_qty", "qty", "count"])));
      }
      if (!unitCost) unitCost = pickNumber(it, ["purchase_price", "cost", "buy_price", "purchase_amount"]);

      const net = pickNumber(it, [
        "net_income",
        "net_revenue",
        "income_net",
        "ingresos_netos",
        "sold_net",
        "sold_income",
        "revenue_net",
        "sale_net",
      ]);
      const soldPrice = pickNumber(it, ["sold_price", "sale_price", "price_sold", "price"]);
      const revenue = net || soldPrice || 0;

      return sum + (revenue - (unitCost || 0));
    }, 0);

    const soldOrReservedWithLot = itemsInPeriod.filter((it) => {
      const st = normalizeStatus(it.status);
      return (st === "sold" || st === "reserved") && it.lot_id;
    });

    const netWithLot = soldOrReservedWithLot.reduce((sum, it) => {
      const net = pickNumber(it, [
        "net_income",
        "net_revenue",
        "income_net",
        "ingresos_netos",
        "sold_net",
        "sold_income",
        "revenue_net",
        "sale_net",
      ]);
      const listed = pickNumber(it, ["listed_price", "price_listed", "price", "sale_price"]);
      return sum + (net || listed || 0);
    }, 0);

    const lotIds = new Set<string>();
    soldOrReservedWithLot.forEach((it) => lotIds.add(String(it.lot_id)));

    const lotsCost = Array.from(lotIds).reduce((sum, id) => {
      const lot = lotsById.get(id);
      if (!lot) return sum;
      return sum + pickNumber(lot, ["total_cost", "cost_total"]);
    }, 0);

    const lotProfit = netWithLot - lotsCost;
    const soldMargin = soldNet > 0 ? soldProfit / soldNet : null;

    const soldWithDates = sold
      .map((it) => {
        const soldAt = pickDate(it, ["sold_at", "sale_date", "sold_date"]);
        const pubAt = pickDate(it, ["published_at", "listed_at", "created_at"]);
        if (!soldAt || !pubAt) return null;
        const days = (soldAt.getTime() - pubAt.getTime()) / (1000 * 60 * 60 * 24);
        return days >= 0 ? days : null;
      })
      .filter((x): x is number => typeof x === "number");

    const avgDaysToSell =
      soldWithDates.length ? soldWithDates.reduce((a, b) => a + b, 0) / soldWithDates.length : null;

    return {
      totalProfit: soldProfit,
      lotProfit,
      soldMargin,
      avgDaysToSell,
    };
  }, [itemsInPeriod, lots]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Export pestaña actual
  const onExport = () => {
    const date = new Date().toISOString().slice(0, 10);

    if (tab === "lots") {
      downloadCSV(`vinted-flips-lotes-${date}.csv`, lots);
      return;
    }

    if (tab === "items") {
      downloadCSV(`vinted-flips-prendas-${date}.csv`, items);
      return;
    }

    // summary: exportamos una fila con KPIs + periodo
    downloadCSV(`vinted-flips-resumen-${date}.csv`, [
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

    // reset forms
    setNewLotName("");
    setNewItemName("");
    setNewItemStatus("for_sale");
    setNewItemLotId("");
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddStep("choose");
  };

  const submitNewLot = async () => {
    setErr(null);
    const name = newLotName.trim();
    if (!name) {
      setErr("Pon un nombre para el lote.");
      return;
    }

    // Insert mínimo: user_id + name (seguro según tu captura)
    const { error } = await supabase.from("lots").insert([{ user_id: userId, name }]);
    if (error) {
      setErr(error.message);
      return;
    }

    // Refetch rápido
    const lotsRes = await supabase
      .from("lots")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (lotsRes.error) setErr(lotsRes.error.message);
    setLots(lotsRes.data ?? []);
    closeAdd();
    setTab("lots");
  };

  const submitNewItem = async () => {
    setErr(null);
    const name = newItemName.trim();
    if (!name) {
      setErr("Pon un nombre para la prenda.");
      return;
    }

    // Insert mínimo: user_id + name + status (+ lot_id opcional)
    const payload: Record<string, any> = {
      user_id: userId,
      name,
      status: newItemStatus,
    };
    if (newItemLotId) payload.lot_id = newItemLotId;

    const { error } = await supabase.from("items").insert([payload]);
    if (error) {
      setErr(error.message);
      return;
    }

    const itemsRes = await supabase
      .from("items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (itemsRes.error) setErr(itemsRes.error.message);
    setItems(itemsRes.data ?? []);
    closeAdd();
    setTab("items");
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
            {tab === "summary" && <KpiCards kpis={kpis} />}
            {tab === "lots" && <LotsView lots={lots} />}
            {tab === "items" && <ItemsView items={items} />}
          </>
        )}
      </main>

      <BottomNav active={tab} onNavigate={setTab} onAdd={openAdd} onExport={onExport} />

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

                  <button className="vf-btn-primary w-full" onClick={submitNewLot}>
                    Guardar lote
                  </button>

                  <div className="text-xs" style={{ color: "var(--vf-muted)" }}>
                    Nota: guardo lo mínimo (user_id + name) para evitar errores por columnas que no
                    existan. Luego añadimos costes/fechas con tu modelo final.
                  </div>
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

                  <label className="block">
                    <span className="text-sm font-medium">Estado</span>
                    <select
                      className="vf-input mt-2"
                      value={newItemStatus}
                      onChange={(e) => setNewItemStatus(e.target.value as any)}
                    >
                      <option value="for_sale">for_sale</option>
                      <option value="reserved">reserved</option>
                      <option value="sold">sold</option>
                    </select>
                  </label>

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

                  <button className="vf-btn-primary w-full" onClick={submitNewItem}>
                    Guardar prenda
                  </button>

                  <div className="text-xs" style={{ color: "var(--vf-muted)" }}>
                    Nota: guardo lo mínimo (user_id + name + status + lot_id opcional). En el
                    siguiente paso añadimos precios/fechas según tu hoja.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}