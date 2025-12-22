"use client";

import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";

import PeriodChips, { PeriodKey } from "@/components/dashboard/PeriodChips";
import BottomNav, { TabKey } from "@/components/dashboard/BottomNav";
import AddMenuModal from "@/components/dashboard/modals/AddMenuModal";

import KpiCards from "@/components/dashboard/KpiCards";
import LotsView from "@/components/dashboard/LotsView";
import ItemsView from "@/components/dashboard/ItemsView";

type Row = Record<string, any>;

export default function Dashboard() {
  const [tab, setTab] = useState<TabKey>("summary");
  const [period, setPeriod] = useState<PeriodKey>("all");

  const [lots, setLots] = useState<Row[]>([]);
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);

    const { data: lotData, error: lotErr } = await supabase
      .from("lots")
      .select("*")
      .order("purchase_date", { ascending: false });

    const { data: itemData, error: itemErr } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (lotErr) console.error(lotErr);
    if (itemErr) console.error(itemErr);

    const l = (lotData ?? []) as Row[];
    const it = (itemData ?? []) as Row[];

    const lotNameById = new Map<string, string>();
    l.forEach((x) => lotNameById.set(String(x.id), String(x.name ?? "")));

    const it2 = it.map((x) => {
      const lotId = x.lot_id ? String(x.lot_id) : "";
      return {
        ...x,
        lot_name: x.lot_name ?? (lotId ? lotNameById.get(lotId) ?? "" : ""),
      };
    });

    setLots(l);
    setItems(it2);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  const exportCsv = () => {
    const rows = tab === "lots" ? lots : tab === "items" ? items : [];
    if (!rows.length) {
      alert("No hay datos para exportar en esta pestaña.");
      return;
    }

    const cols = Array.from(
      rows.reduce((set, r) => {
        Object.keys(r).forEach((k) => set.add(k));
        return set;
      }, new Set<string>())
    );

    const esc = (v: any) => {
      const s = v === null || v === undefined ? "" : String(v);
      const needs = /[",\n]/.test(s);
      const cleaned = s.replace(/"/g, '""');
      return needs ? `"${cleaned}"` : cleaned;
    };

    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const headerRight = useMemo(() => {
    return (
      <button className="vf-btn" type="button" onClick={onLogout}>
        Cerrar sesión
      </button>
    );
  }, []);

  return (
    <div className="vf-shell">
      <div className="vf-container">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="vf-brand">Vinted Flips</div>
            <h1 className="vf-h1">Panel (beta)</h1>
          </div>
          {headerRight}
        </header>

        <section className="mt-6 vf-card">
          <div className="vf-card-inner">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black">Periodo</div>
                <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
                  Afecta a KPIs y resumen por lote (según fecha de venta).
                </div>
              </div>
              <div className="text-sm" style={{ color: "var(--vf-muted)" }}>
                Todo
              </div>
            </div>

            <PeriodChips value={period} onChange={setPeriod} />
          </div>
        </section>

        <div className="mt-6">
          {loading ? (
            <div className="vf-card">
              <div className="vf-card-inner">Cargando datos…</div>
            </div>
          ) : tab === "summary" ? (
            <KpiCards lots={lots} items={items} period={period} />
          ) : tab === "lots" ? (
            <LotsView lots={lots} />
          ) : (
            <ItemsView items={items} lots={lots} />
          )}
        </div>

        <BottomNav
          active={tab}
          onNavigate={setTab}
          onAdd={() => setAddOpen(true)}
          onExport={exportCsv}
        />

        <AddMenuModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onAddItem={() => {
            setAddOpen(false);
            // Aquí conectamos ItemFormModal en el siguiente paso (pero ya sin alerts feos).
            console.log("Abrir modal: añadir prenda");
          }}
          onAddLot={() => {
            setAddOpen(false);
            console.log("Abrir modal: añadir lote");
          }}
        />
      </div>
    </div>
  );
}
