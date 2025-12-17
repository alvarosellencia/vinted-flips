"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PeriodChips, { PeriodValue } from "@/components/dashboard/PeriodChips";
import BottomNav, { TabKey } from "@/components/dashboard/BottomNav";

type Props = { userId: string };

export default function Dashboard({ userId }: Props) {
  const [tab, setTab] = useState<TabKey>("resumen");
  const [period, setPeriod] = useState<PeriodValue>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // KPIs / data
  const [kpiTotal, setKpiTotal] = useState<number>(0);
  const [kpiLots, setKpiLots] = useState<number>(0);

  const periodLabel = useMemo(() => {
    switch (period) {
      case "all":
        return "Todo";
      case "month":
        return "Este mes";
      case "30d":
        return "Últimos 30 días";
      case "custom":
        return "Personalizado";
      default:
        return "Todo";
    }
  }, [period]);

  async function loadData() {
    if (!userId) return; // blindaje
    setLoading(true);
    setError(null);

    try {
      // TODO: aquí metes tus queries reales (items, lots, KPIs, etc.)
      // IMPORTANTÍSIMO: filtra por userId si tu esquema usa user_id / owner_id
      //
      // EJEMPLO (ajusta tablas/columnas):
      // const { data: items, error: e1 } = await supabase
      //   .from("items")
      //   .select("*")
      //   .eq("user_id", userId);
      // if (e1) throw e1;

      // DEMO: deja algo visible para confirmar que sí entra a cargar en prod
      setKpiTotal(0);
      setKpiLots(0);
    } catch (e: any) {
      console.error("[Dashboard] loadData error:", e);
      setError(e?.message ?? "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, period]);

  const logout = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm opacity-80">Vinted Flips</div>
          <h1 className="text-3xl font-semibold tracking-tight">Panel (beta)</h1>
        </div>

        <button
          type="button"
          onClick={logout}
          className="vf-btn"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </header>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {/* Periodo */}
      <section className="vf-card mt-5">
        <div className="vf-card-inner">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xl font-semibold">Periodo</div>
              <div className="mt-1 text-sm opacity-75">
                Afecta a KPIs y resumen por lote (según fecha de venta).
              </div>
            </div>
            <div className="text-sm opacity-70">{periodLabel}</div>
          </div>

          <div className="mt-4">
            <PeriodChips value={period} onChange={setPeriod} />
          </div>
        </div>
      </section>

      {/* KPIs básicos (ejemplo) */}
      {tab === "resumen" && (
        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="vf-card">
            <div className="vf-card-inner">
              <div className="text-sm opacity-70">Beneficio total</div>
              <div className="mt-2 text-4xl font-semibold text-emerald-300">
                {kpiTotal.toFixed(2).replace(".", ",")} €
              </div>
              <div className="mt-2 text-sm opacity-75">
                Ingresos netos (vendidas, periodo) − (coste total lotes + coste prendas sueltas).
              </div>
            </div>
          </div>

          <div className="vf-card">
            <div className="vf-card-inner">
              <div className="text-sm opacity-70">Beneficio sobre lotes</div>
              <div className="mt-2 text-4xl font-semibold text-emerald-300">
                {kpiLots.toFixed(2).replace(".", ",")} €
              </div>
              <div className="mt-2 text-sm opacity-75">
                Ingresos netos (vendidas+reservadas con lote, periodo) − coste total lotes.
              </div>
            </div>
          </div>

          <div className="vf-card md:col-span-2">
            <div className="vf-card-inner flex items-center justify-between gap-3">
              <div className="text-sm opacity-75">
                {loading ? "Cargando datos…" : "Datos listos."}
              </div>
              <button type="button" className="vf-btn" onClick={loadData}>
                Refrescar
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tabs placeholders */}
      {tab === "lotes" && (
        <section className="vf-card mt-5">
          <div className="vf-card-inner">
            <div className="text-lg font-semibold">Lotes</div>
            <div className="mt-2 text-sm opacity-75">Aquí va tu vista de lotes.</div>
          </div>
        </section>
      )}

      {tab === "prendas" && (
        <section className="vf-card mt-5">
          <div className="vf-card-inner">
            <div className="text-lg font-semibold">Prendas</div>
            <div className="mt-2 text-sm opacity-75">Aquí va tu vista de prendas.</div>
          </div>
        </section>
      )}

      <BottomNav
        active={tab}
        onChange={setTab}
        onAdd={() => {
          // TODO: abre modal / create flow
          console.log("[BottomNav] add");
        }}
        onSync={loadData}
      />
    </main>
  );
}