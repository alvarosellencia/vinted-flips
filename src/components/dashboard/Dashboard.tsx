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

export default function Dashboard({ userId }: { userId: string }) {
  const [tab, setTab] = useState<TabKey>("summary");
  const [period, setPeriod] = useState<PeriodKey>("all");
  const [refreshToken, setRefreshToken] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [lots, setLots] = useState<LotRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);

  const dateFrom = useMemo(() => {
    if (period === "month") return startOfMonthISO();
    if (period === "last30") return last30ISO();
    return null; // all/custom => sin filtro (de momento)
  }, [period]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErrorMsg(null);

      try {
        // OJO: asumo tablas "lots" e "items" con columna user_id.
        // Si tus tablas se llaman distinto, dime el nombre exacto y lo ajusto.
        let lotsQ = supabase.from("lots").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        let itemsQ = supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false });

        if (dateFrom) {
          // si filtras por periodo: uso sold_at como referencia típica.
          // Si tu columna se llama distinto (sale_date / sold_date), lo ajustamos.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, dateFrom, refreshToken]);

  const kpis: Kpis = useMemo(() => {
    // Cálculo tolerante: si faltan campos, no revienta.
    // Ajustaremos a tu esquema real cuando me confirmes columnas exactas.
    const sold = items.filter((it) => String(it.status ?? "").toLowerCase() === "sold" || !!it.sold_at);

    const sum = (arr: any[], field: string) =>
      arr.reduce((acc, x) => acc + (Number(x?.[field]) || 0), 0);

    const net = sum(sold, "net_income"); // recomendado: net_income
    const cost = sum(sold, "cost"); // recomendado: cost

    const totalProfit = net - cost;

    // beneficio “sobre lotes”: si tienes cost_lot en items o lot_cost prorrateado, lo ajustamos.
    // por ahora: mismo totalProfit (no invento datos).
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
    // AuthGate se encarga de mostrar login al perder sesión.
  };

  const onAdd = () => {
    // De momento: placeholder. Aquí abriremos modal “añadir prenda/lote”.
    // No rompo la app: simplemente te lo dejo listo.
    alert("Añadir (pendiente de implementar modal).");
  };

  const onSync = () => {
    setRefreshToken((n) => n + 1);
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

      <BottomNav tab={tab} onNavigate={setTab} onAdd={onAdd} onSync={onSync} />
    </main>
  );
}