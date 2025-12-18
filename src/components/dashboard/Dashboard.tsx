"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PeriodChips, { PeriodKey } from "@/components/dashboard/PeriodChips";
import BottomNav, { TabKey } from "@/components/dashboard/BottomNav";
import KpiCards from "@/components/dashboard/KpiCards";
import LotsView from "@/components/dashboard/LotsView";
import ItemsView from "@/components/dashboard/ItemsView";

type LotRow = Record<string, any>;
type ItemRow = Record<string, any>;

type Kpis = {
  totalProfit: number;
  lotProfit: number;
  soldMargin: number;
  avgDaysToSell: number;
};

function startOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function last30ISO() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r ?? {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const esc = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    const safe = s.replace(/"/g, '""');
    return `"${safe}"`;
  };

  const header = keys.map(esc).join(",");
  const lines = rows.map((r) => keys.map((k) => esc(r?.[k])).join(","));
  return [header, ...lines].join("\n");
}

export default function Dashboard({ userId }: { userId: string }) {
  const [tab, setTab] = useState<TabKey>("summary");
  const [period, setPeriod] = useState<PeriodKey>("all");
  const [refreshToken, setRefreshToken] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [lots, setLots] = useState<LotRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);

  // Action sheet “+”
  const [addOpen, setAddOpen] = useState(false);

  const dateFrom = useMemo(() => {
    if (period === "month") return startOfMonthISO();
    if (period === "last30") return last30ISO();
    return null;
  }, [period]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErrorMsg(null);

      try {
        // Ajusta nombres si tus tablas no son "lots" y "items".
        let lotsQ = supabase
          .from("lots")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        let itemsQ = supabase
          .from("items")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (dateFrom) {
          // Ajusta si tu campo de venta se llama distinto.
          itemsQ = itemsQ.gte("sold_at", dateFrom);
        }

        const [lotsRes, itemsRes] = await Promise.all([lotsQ, itemsQ]);
        if (lotsRes.error) throw lotsRes.error;
        if (itemsRes.error) throw itemsRes.error;

        if (cancelled) return;
        setLots(lotsRes.data ?? []);
        setItems(itemsRes.data ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setErrorMsg(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, dateFrom, refreshToken]);

  const kpis: Kpis = useMemo(() => {
    const sold = items.filter(
      (it) => String(it.status ?? "").toLowerCase() === "sold" || !!it.sold_at
    );

    const sum = (arr: any[], field: string) =>
      arr.reduce((acc, x) => acc + (Number(x?.[field]) || 0), 0);

    const net = sum(sold, "net_income");
    const cost = sum(sold, "cost");
    const totalProfit = net - cost;

    const lotProfit = totalProfit;

    const revenue = sum(sold, "revenue") || sum(sold, "sale_price") || 0;
    const soldMargin = revenue > 0 ? totalProfit / revenue : 0;

    const avgDaysToSell =
      sold.length === 0
        ? 0
        : sold.reduce((acc, it) => {
            const pub = it.published_at ? new Date(it.published_at) : null;
            const soldAt = it.sold_at ? new Date(it.sold_at) : null;
            if (!pub || !soldAt || isNaN(pub.getTime()) || isNaN(soldAt.getTime())) return acc;
            const days = (soldAt.getTime() - pub.getTime()) / (1000 * 60 * 60 * 24);
            return acc + Math.max(0, days);
          }, 0) / sold.length;

    return { totalProfit, lotProfit, soldMargin, avgDaysToSell };
  }, [items]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const onAdd = () => {
    setAddOpen(true);
  };

  const onExport = () => {
    // Export “pro”: dos CSV separados, con timestamp
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const lotsCSV = toCSV(lots);
    const itemsCSV = toCSV(items);

    if (!lotsCSV && !itemsCSV) {
      alert("No hay datos para exportar todavía.");
      return;
    }

    if (lotsCSV) downloadText(`vinted-flips-lotes-${stamp}.csv`, lotsCSV);
    if (itemsCSV) downloadText(`vinted-flips-prendas-${stamp}.csv`, itemsCSV);
  };

  return (
    <main className="mx-auto max-w-6xl pt-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm opacity-70">Vinted Flips</div>
          <h1 className="text-4xl font-semibold">Panel (beta)</h1>
        </div>

        <button onClick={signOut} className="vf-btn">
          Cerrar sesión
        </button>
      </header>

      {errorMsg && (
        <div className="mt-4 vf-panel p-4 border border-rose-500/20 bg-rose-500/10 text-rose-100">
          {errorMsg}
        </div>
      )}

      <PeriodChips period={period} onChange={(p) => setPeriod(p)} />

      {loading ? (
        <div className="mt-6 text-sm opacity-70">Cargando datos…</div>
      ) : (
        <>
          {tab === "summary" && <KpiCards kpis={kpis} />}
          {tab === "lots" && <LotsView lots={lots} />}
          {tab === "items" && <ItemsView items={items} />}
        </>
      )}

      {/* Bottom nav */}
      <BottomNav tab={tab} onNavigate={setTab} onAdd={onAdd} onExport={onExport} />

      {/* Action Sheet “+” */}
      {addOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 pb-[calc(env(safe-area-inset-bottom)+12px)] px-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-3xl vf-card">
              <div className="vf-card-inner">
                <div className="text-sm opacity-70">Añadir</div>
                <div className="mt-1 text-lg font-semibold">¿Qué quieres crear?</div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="vf-btn-primary"
                    onClick={() => {
                      setAddOpen(false);
                      setTab("items");
                      alert("Siguiente paso: modal/formulario para crear prenda (lo hacemos después).");
                    }}
                  >
                    Añadir prenda
                  </button>

                  <button
                    type="button"
                    className="vf-btn"
                    onClick={() => {
                      setAddOpen(false);
                      setTab("lots");
                      alert("Siguiente paso: modal/formulario para crear lote (lo hacemos después).");
                    }}
                  >
                    Añadir lote
                  </button>
                </div>

                <button
                  type="button"
                  className="mt-3 vf-btn w-full"
                  onClick={() => setAddOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
