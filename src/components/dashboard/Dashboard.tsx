"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BottomNav, { NavKey } from "@/components/dashboard/BottomNav";
import PeriodChips, { PeriodKey } from "@/components/dashboard/PeriodChips";
import KpiCards from "@/components/dashboard/KpiCards";
import LotsView from "@/components/dashboard/LotsView";
import ItemsView from "@/components/dashboard/ItemsView";

export default function Dashboard({ userId }: { userId: string }) {
  const [tab, setTab] = useState<NavKey>("summary");
  const [period, setPeriod] = useState<PeriodKey>("all");
  const [error, setError] = useState<string | null>(null);

  // Trigger simple para refrescar datos en hijos (si lo usas)
  const [refreshToken, setRefreshToken] = useState(0);

  const onNavigate = useCallback((key: NavKey) => {
    setTab(key);
  }, []);

  const onAdd = useCallback(() => {
    // Aquí decides: abrir modal, ir a pantalla, etc.
    // Si ya tenías modal, enchúfalo aquí.
    // Por ahora: saltamos a “Prendas” (lo normal en resellers).
    setTab("items");
  }, []);

  const onSync = useCallback(() => {
    setError(null);
    setRefreshToken((x) => x + 1);
  }, []);

  // Opcional: limpiar errores cuando cambias tab
  useEffect(() => {
    setError(null);
  }, [tab]);

  const headerSubtitle = useMemo(() => {
    switch (tab) {
      case "summary":
        return "KPIs y resumen por lote.";
      case "lots":
        return "Gestiona tus lotes.";
      case "items":
        return "Gestiona tus prendas.";
      default:
        return "";
    }
  }, [tab]);

  return (
    <main className="mx-auto w-full max-w-6xl">
      <div className="pt-6 sm:pt-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm opacity-70">Vinted Flips</div>
            <h1 className="text-4xl font-semibold tracking-tight">Panel (beta)</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Si ya tienes botón real de logout en otro componente, úsalo */}
            <button className="vf-btn">Cerrar sesión</button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className="vf-card mt-6">
          <div className="vf-card-inner">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Periodo</div>
                <div className="mt-1 text-sm opacity-70">{headerSubtitle}</div>
              </div>
              <div className="text-sm opacity-70">{period === "all" ? "Todo" : ""}</div>
            </div>

            <div className="mt-4">
              <PeriodChips value={period} onChange={setPeriod} />
            </div>
          </div>
        </section>

        <div className="mt-6">
          {tab === "summary" && (
            <KpiCards userId={userId} period={period} refreshToken={refreshToken} />
          )}

          {tab === "lots" && (
            <LotsView userId={userId} period={period} refreshToken={refreshToken} />
          )}

          {tab === "items" && (
            <ItemsView userId={userId} period={period} refreshToken={refreshToken} />
          )}
        </div>
      </div>

      <BottomNav active={tab} onNavigate={onNavigate} onAdd={onAdd} onSync={onSync} />
    </main>
  );
}