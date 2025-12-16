// src/components/dashboard/Dashboard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import type { ItemRow, LotRow } from "../../lib/types";
import {
  derivePeriod,
  fmtEUR,
  inPeriodBySaleDate,
  netRevenue,
  PeriodMode,
  resolveLotForItem,
  resolvedPurchaseCost,
} from "../../lib/metrics";

import PeriodChips from "./PeriodChips";
import KpiCards from "./KpiCards";
import ItemsView from "./ItemsView";
import LotsView from "./LotsView";
import BottomNav from "./BottomNav";

type View = "summary" | "items" | "lots";

type DashboardProps = {
  userId?: string;
};

export default function Dashboard({ userId }: DashboardProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("summary");
  const [loading, setLoading] = useState(true);

  const [lots, setLots] = useState<LotRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Period
  const [periodMode, setPeriodMode] = useState<PeriodMode>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { from, to } = useMemo(
    () => derivePeriod(periodMode, customFrom, customTo),
    [periodMode, customFrom, customTo]
  );

  const loadAll = async () => {
    setLoading(true);
    setError(null);

    // Deriva el userId: prioridad al prop (si viene), si no, desde la sesión.
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) console.warn(sessionErr);

    const uid = userId ?? sessionData.session?.user?.id;

    if (!uid) {
      setError("No se pudo obtener el userId de la sesión. Cierra sesión y vuelve a entrar con el magic link.");
      setLots([]);
      setItems([]);
      setLoading(false);
      return;
    }

    // Filtra por user_id (RLS + claridad)
    const lotsRes = await supabase
      .from("lots")
      .select("*")
      .eq("user_id", uid)
      .order("purchase_date", { ascending: false });

    if (lotsRes.error) {
      setError(lotsRes.error.message);
      setLoading(false);
      return;
    }

    const itemsRes = await supabase
      .from("items")
      .select("*")
      .eq("user_id", uid)
      .order("listing_date", { ascending: false });

    if (itemsRes.error) {
      setError(itemsRes.error.message);
      setLoading(false);
      return;
    }

    setLots((lotsRes.data ?? []) as LotRow[]);
    setItems((itemsRes.data ?? []) as ItemRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // KPIs
  const kpis = useMemo(() => {
    const soldInPeriod = items.filter((it) => it.status === "sold" && inPeriodBySaleDate(it, from, to));
    const netSoldPeriod = soldInPeriod.reduce((acc, it) => acc + netRevenue(it), 0);

    const totalLotsCost = lots.reduce((acc, l) => acc + (l.total_cost ?? 0), 0);

    const singlesPurchase = items
      .filter((it) => !it.lot_id && !it.lot_name)
      .reduce((acc, it) => acc + (it.purchase_cost ?? 0), 0);

    const totalProfit = netSoldPeriod - (totalLotsCost + singlesPurchase);

    const lotItemsInPeriod = items.filter((it) => {
      const hasLot = Boolean(resolveLotForItem(it, lots));
      if (!hasLot) return false;
      if (it.status !== "sold" && it.status !== "reserved") return false;
      return inPeriodBySaleDate(it, from, to);
    });

    const lotIncomePeriod = lotItemsInPeriod.reduce((acc, it) => acc + netRevenue(it), 0);
    const lotProfit = lotIncomePeriod - totalLotsCost;

    const profitSold = soldInPeriod.reduce((acc, it) => {
      const income = netRevenue(it);
      const cost = resolvedPurchaseCost(it, lots);
      return acc + (income - cost);
    }, 0);
    const soldMargin = netSoldPeriod > 0 ? profitSold / netSoldPeriod : null;

    const days = soldInPeriod
      .filter((it) => it.listing_date && it.sale_date)
      .map((it) => {
        const a = new Date(it.listing_date + "T00:00:00").getTime();
        const b = new Date(it.sale_date + "T00:00:00").getTime();
        return Math.max(0, (b - a) / (1000 * 60 * 60 * 24));
      });

    const avgDaysToSell = days.length ? days.reduce((s, x) => s + x, 0) / days.length : null;

    return { totalProfit, lotProfit, soldMargin, avgDaysToSell };
  }, [items, lots, from, to]);

  // Resumen por lote
  const lotsSummary = useMemo(() => {
    return lots.map((lot) => {
      const cost = lot.total_cost ?? 0;

      const lotItems = items.filter((it) => {
        const resolved = resolveLotForItem(it, lots);
        return resolved?.id === lot.id;
      });

      const soldInPeriod = lotItems.filter((it) => it.status === "sold" && inPeriodBySaleDate(it, from, to));
      const revenuePeriod = soldInPeriod.reduce((acc, it) => acc + netRevenue(it), 0);
      const soldCountPeriod = soldInPeriod.length;

      const incomeCurrent = lotItems
        .filter((it) => it.status === "sold" || it.status === "reserved")
        .reduce((acc, it) => acc + netRevenue(it), 0);

      const profitCurrent = incomeCurrent - cost;

      return { lot, cost, soldCountPeriod, revenuePeriod, profitCurrent };
    });
  }, [lots, items, from, to]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const onAdd = () => {
    alert("Añadir: lo conectamos luego (modal crear Lote / Prenda).");
  };

  if (loading) {
    return (
      <main className="w-full">
        <div className="mx-auto max-w-5xl py-7">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">Cargando…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full">
      <div className="mx-auto max-w-5xl pt-7">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm opacity-70">Vinted Flips</div>
            <h1 className="text-2xl font-semibold">Panel (beta)</h1>
          </div>

          <button
            onClick={signOut}
            className="vf-btn"
          >
            Cerrar sesión
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl border border-white/10 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {view === "summary" && (
          <>
            <PeriodChips
              mode={periodMode}
              setMode={setPeriodMode}
              customFrom={customFrom}
              setCustomFrom={setCustomFrom}
              customTo={customTo}
              setCustomTo={setCustomTo}
            />

            <div className="mt-4">
              <KpiCards kpis={kpis} />
            </div>

            <section className="mt-4">
              <h2 className="text-xl font-semibold">Resumen por lote (periodo filtrado)</h2>

              <div className="mt-3 space-y-3">
                {lotsSummary.map(({ lot, cost, soldCountPeriod, revenuePeriod, profitCurrent }) => {
                  const profitCls = profitCurrent >= 0 ? "text-emerald-300" : "text-rose-300";
                  const roiCost = cost > 0 ? profitCurrent / cost : null;

                  return (
                    <div key={lot.id} className="vf-card">
                      <div className="vf-card-inner">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate text-lg font-semibold">{lot.name}</div>
                            <div className="mt-1 text-sm opacity-75">
                              Coste: {fmtEUR(cost)} · Vendidas (periodo): {soldCountPeriod} · Ingresos (periodo):{" "}
                              {fmtEUR(revenuePeriod)}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div className="vf-panel p-3">
                                <div className="opacity-70">ROI coste (actual)</div>
                                <div className="mt-1 font-semibold">
                                  {roiCost == null ? "—" : (roiCost * 100).toFixed(1) + "%"}
                                </div>
                              </div>

                              <div className="vf-panel p-3">
                                <div className="opacity-70">ROI vendidas</div>
                                <div className="mt-1 font-semibold">
                                  {cost > 0 ? ((revenuePeriod / cost) * 100).toFixed(1) + "%" : "—"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={`shrink-0 text-lg font-semibold ${profitCls}`}>{fmtEUR(profitCurrent)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {lots.length === 0 && (
                  <div className="vf-card">
                    <div className="vf-card-inner opacity-75">Aún no tienes lotes.</div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {view === "items" && <ItemsView lots={lots} items={items} />}
        {view === "lots" && <LotsView lots={lots} items={items} />}

        <BottomNav view={view} onChange={setView} onAdd={onAdd} onRefresh={loadAll} />
      </div>
    </main>
  );
}