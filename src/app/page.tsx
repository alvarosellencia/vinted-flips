'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type ItemStatus = 'for_sale' | 'sold' | 'reserved' | 'returned';

type Lot = {
  id: string;
  user_id: string;
  name: string;
  purchase_date: string | null;
  items_count: number | null;
  total_cost: number | null;
  unit_cost: number | null;
  provider?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

type Item = {
  id: string;
  user_id: string;

  lot_id: string | null;
  lot_name?: string | null;

  name: string;
  size: string | null;
  platform?: string | null;

  purchase_cost: number | null;
  listing_date: string | null;
  sale_date: string | null;

  status: ItemStatus;

  sale_price: number | null;
  platform_fee: number | null;
  shipping_cost: number | null;

  created_at?: string;
  updated_at?: string;
};

function eur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
    Number.isFinite(n) ? n : 0
  );
}
function pct(n: number) {
  if (!Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}
function parseYMD(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
function clampNumber(v: any, fallback = 0) {
  const n = typeof v === 'number' ? v : v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

type Tab = 'summary' | 'items' | 'lots';
type Preset = 'all' | 'this_month' | 'last_30' | 'custom';

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-5 w-5 items-center justify-center">{children}</span>;
}
function TrashIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M9 3h6m-8 4h10m-9 0 1 14h6l1-14M10 11v7m4-7v7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Icon>
  );
}
function PencilIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 20h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Icon>
  );
}
function HomeIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </Icon>
  );
}
function TagIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M20 13l-7 7-10-10V3h7l10 10z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M7.5 7.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </Icon>
  );
}
function BoxIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M21 8.5 12 3 3 8.5 12 14l9-5.5z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M3 8.5V20l9 5 9-5V8.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M12 14v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Icon>
  );
}
function PlusIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </Icon>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition',
        active
          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
          : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
      ].join(' ')}
      type="button"
    >
      {children}
    </button>
  );
}

function Card({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle?: string;
  tone?: 'good' | 'bad' | 'neutral';
}) {
  const valueClass =
    tone === 'good'
      ? 'text-emerald-300'
      : tone === 'bad'
      ? 'text-rose-300'
      : 'text-white';
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
      <div className="text-xs text-white/60">{title}</div>
      <div className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</div>
      {subtitle ? <div className="mt-2 text-xs text-white/50">{subtitle}</div> : null}
    </div>
  );
}

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('summary');
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState<Lot[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [sessionReady, setSessionReady] = useState(false);

  // Periodo
  const [preset, setPreset] = useState<Preset>('all');
  const [from, setFrom] = useState<string>(''); // YYYY-MM-DD
  const [to, setTo] = useState<string>(''); // YYYY-MM-DD

  // Items filters
  const [statusTab, setStatusTab] = useState<'all' | ItemStatus>('all');
  const [q, setQ] = useState('');
  const [lotFilterId, setLotFilterId] = useState<string>('all');
  const [order, setOrder] = useState<'listing_desc' | 'listing_asc' | 'sale_desc' | 'sale_asc'>(
    'listing_desc'
  );

  // Modales simples
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);

  const [editLot, setEditLot] = useState<Lot | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);

  // Form lot
  const [lotName, setLotName] = useState('');
  const [lotPurchaseDate, setLotPurchaseDate] = useState('');
  const [lotItemsCount, setLotItemsCount] = useState<number | ''>('');
  const [lotTotalCost, setLotTotalCost] = useState<number | ''>('');

  // Form item
  const [itemName, setItemName] = useState('');
  const [itemSize, setItemSize] = useState('');
  const [itemLotId, setItemLotId] = useState<string>(''); // '' = sin lote
  const [itemListingDate, setItemListingDate] = useState('');
  const [itemSaleDate, setItemSaleDate] = useState('');
  const [itemStatus, setItemStatus] = useState<ItemStatus>('for_sale');
  const [itemPurchaseCost, setItemPurchaseCost] = useState<number | ''>('');
  const [itemSalePrice, setItemSalePrice] = useState<number | ''>('');
  const [itemPlatformFee, setItemPlatformFee] = useState<number | ''>('');
  const [itemShippingCost, setItemShippingCost] = useState<number | ''>('');

  // ---- auth / data
  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSessionReady(true);
      setLoading(false);
    }
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      setLots([]);
      setItems([]);
      setLoading(false);
      return;
    }

    const [lotsRes, itemsRes] = await Promise.all([
      supabase.from('lots').select('*').order('purchase_date', { ascending: false }),
      supabase.from('items').select('*').order('created_at', { ascending: false }),
    ]);

    if (!lotsRes.error) setLots((lotsRes.data as any[]) as Lot[]);
    if (!itemsRes.error) setItems((itemsRes.data as any[]) as Item[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!sessionReady) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady]);

  // ---- presets periodo
  useEffect(() => {
    const today = new Date();
    const ymd = (d: Date) => d.toISOString().slice(0, 10);

    if (preset === 'all') {
      setFrom('');
      setTo('');
      return;
    }
    if (preset === 'this_month') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      setFrom(ymd(first));
      setTo(ymd(today));
      return;
    }
    if (preset === 'last_30') {
      const d = new Date(today);
      d.setDate(d.getDate() - 30);
      setFrom(ymd(d));
      setTo(ymd(today));
      return;
    }
  }, [preset]);

  const lotsById = useMemo(() => {
    const m = new Map<string, Lot>();
    lots.forEach((l) => m.set(l.id, l));
    return m;
  }, [lots]);

  const lotsByName = useMemo(() => {
    const m = new Map<string, Lot>();
    lots.forEach((l) => m.set(l.name.trim().toLowerCase(), l));
    return m;
  }, [lots]);

  function normalizeLotName(s: string | null | undefined) {
    const v = (s ?? '').trim().toLowerCase();
    if (!v) return '';
    if (v === 'null' || v === 'none' || v === '-' || v === '—' || v === 'sin lote') return '';
    return v;
  }

  // CLAVE: Solo consideramos "prenda de lote" si enlaza a lote real
  function belongsToRealLot(it: Item): boolean {
    if (it.lot_id && lotsById.has(it.lot_id)) return true;
    const ln = normalizeLotName(it.lot_name ?? null);
    if (!ln) return false;
    return lotsByName.has(ln);
  }

  function getLotForItem(it: Item): Lot | null {
    if (it.lot_id && lotsById.has(it.lot_id)) return lotsById.get(it.lot_id)!;
    const ln = normalizeLotName(it.lot_name ?? null);
    if (ln && lotsByName.has(ln)) return lotsByName.get(ln)!;
    return null;
  }

  function itemUnitCost(it: Item): number {
    const pc = clampNumber(it.purchase_cost, NaN);
    if (Number.isFinite(pc) && pc > 0) return pc;
    const l = getLotForItem(it);
    const uc = l ? clampNumber(l.unit_cost, NaN) : NaN;
    if (Number.isFinite(uc) && uc >= 0) return uc;
    return 0;
  }

  function itemNetRevenue(it: Item): number {
    const price = clampNumber(it.sale_price, 0);
    const fee = clampNumber(it.platform_fee, 0);
    const ship = clampNumber(it.shipping_cost, 0);
    return price - fee - ship;
  }

  function inSaleRange(it: Item): boolean {
    if (!from && !to) return true;
    const d = parseYMD(it.sale_date);
    if (!d) return false;
    const f = parseYMD(from);
    const t = parseYMD(to);
    if (f && d < f) return false;
    if (t && d > t) return false;
    return true;
  }

  // ---------------- KPIs (blindados) ----------------
  const totalLotCost = useMemo(
    () => lots.reduce((acc, l) => acc + clampNumber(l.total_cost, 0), 0),
    [lots]
  );

  // coste prendas sueltas = items que NO pertenecen a un lote real
  const totalStandaloneCost = useMemo(() => {
    return items
      .filter((it) => !belongsToRealLot(it))
      .reduce((acc, it) => acc + clampNumber(it.purchase_cost, 0), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lots]);

  const standaloneMissingCostCount = useMemo(() => {
    return items.filter((it) => !belongsToRealLot(it) && clampNumber(it.purchase_cost, 0) <= 0).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lots]);

  const soldInRange = useMemo(
    () => items.filter((it) => it.status === 'sold' && inSaleRange(it)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, from, to]
  );

  // ingresos vendidos netos (todos)
  const revenueSoldNet = useMemo(
    () => soldInRange.reduce((acc, it) => acc + itemNetRevenue(it), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [soldInRange]
  );

  // ingresos vendidos netos SOLO de lotes reales
  const revenueLotsSoldNet = useMemo(() => {
    return soldInRange
      .filter((it) => belongsToRealLot(it))
      .reduce((acc, it) => acc + itemNetRevenue(it), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soldInRange, lots]);

  // beneficio unitario vendido (para margen)
  const profitSoldUnit = useMemo(() => {
    return soldInRange.reduce((acc, it) => acc + (itemNetRevenue(it) - itemUnitCost(it)), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soldInRange, lots]);

  const marginSold = useMemo(() => {
    if (revenueSoldNet <= 0) return NaN;
    return profitSoldUnit / revenueSoldNet;
  }, [profitSoldUnit, revenueSoldNet]);

  const avgDaysToSell = useMemo(() => {
    const withDates = soldInRange
      .map((it) => {
        const a = parseYMD(it.listing_date);
        const b = parseYMD(it.sale_date);
        if (!a || !b) return null;
        const d = daysBetween(a, b);
        return Number.isFinite(d) && d >= 0 ? d : null;
      })
      .filter((x): x is number => x !== null);

    if (withDates.length === 0) return NaN;
    return withDates.reduce((acc, n) => acc + n, 0) / withDates.length;
  }, [soldInRange]);

  // KPI: beneficio total (cash basis)
  const kpiBenefitTotal = useMemo(() => {
    return revenueSoldNet - (totalLotCost + totalStandaloneCost);
  }, [revenueSoldNet, totalLotCost, totalStandaloneCost]);

  // KPI: beneficio sobre lotes (SOLO VENDIDAS)
  const kpiBenefitLots = useMemo(() => {
    return revenueLotsSoldNet - totalLotCost;
  }, [revenueLotsSoldNet, totalLotCost]);

  // -------- Resumen por lote: mostramos realizado vs potencial --------
  const lotCards = useMemo(() => {
    return lots
      .map((l) => {
        const wanted = l.name.trim().toLowerCase();
        const lotItems = items.filter((it) => {
          const byId = it.lot_id && it.lot_id === l.id;
          const byName = normalizeLotName(it.lot_name ?? null) === wanted;
          return byId || byName;
        });

        const soldLot = lotItems.filter((it) => it.status === 'sold' && inSaleRange(it));
        const reservedLot = lotItems.filter((it) => it.status === 'reserved' && inSaleRange(it));

        const revSold = soldLot.reduce((acc, it) => acc + itemNetRevenue(it), 0);
        const revRes = reservedLot.reduce((acc, it) => acc + itemNetRevenue(it), 0);

        const cost = clampNumber(l.total_cost, 0);

        const balanceReal = revSold - cost; // SOLO VENDIDAS
        const balancePotential = (revSold + revRes) - cost; // VENDIDAS + RESERVADAS

        const roiReal = cost > 0 ? balanceReal / cost : NaN;

        return {
          lot: l,
          cost,
          soldCount: soldLot.length,
          reservedCount: reservedLot.length,
          revenueSold: revSold,
          revenueReserved: revRes,
          balanceReal,
          balancePotential,
          roiReal,
        };
      })
      .sort((a, b) => a.lot.name.localeCompare(b.lot.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lots, items, from, to]);

  // -------- Items view filtering --------
  const selectedLot = useMemo(() => {
    if (lotFilterId === 'all') return null;
    return lotsById.get(lotFilterId) ?? null;
  }, [lotFilterId, lotsById]);

  const filteredItems = useMemo(() => {
    let arr = [...items];

    if (statusTab !== 'all') arr = arr.filter((it) => it.status === statusTab);

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      arr = arr.filter((it) => {
        const lotN = (getLotForItem(it)?.name ?? (it.lot_name ?? '')).toLowerCase();
        return (
          it.name.toLowerCase().includes(needle) ||
          (it.size ?? '').toLowerCase().includes(needle) ||
          lotN.includes(needle)
        );
      });
    }

    if (selectedLot) {
      const wantedName = selectedLot.name.trim().toLowerCase();
      arr = arr.filter((it) => {
        const byId = it.lot_id && it.lot_id === selectedLot.id;
        const byName = normalizeLotName(it.lot_name ?? null) === wantedName;
        return byId || byName;
      });
    }

    const getListing = (it: Item) => parseYMD(it.listing_date)?.getTime() ?? 0;
    const getSale = (it: Item) => parseYMD(it.sale_date)?.getTime() ?? 0;

    arr.sort((a, b) => {
      if (order === 'listing_desc') return getListing(b) - getListing(a);
      if (order === 'listing_asc') return getListing(a) - getListing(b);
      if (order === 'sale_desc') return getSale(b) - getSale(a);
      return getSale(a) - getSale(b);
    });

    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, statusTab, q, selectedLot, order, lots]);

  const statusCounts = useMemo(() => {
    const base = { all: items.length, for_sale: 0, sold: 0, reserved: 0, returned: 0 };
    items.forEach((it) => {
      base[it.status] += 1;
    });
    return base;
  }, [items]);

  const itemsTotals = useMemo(() => {
    const arr = filteredItems;
    const sumSalePrice = arr.reduce((acc, it) => acc + clampNumber(it.sale_price, 0), 0);
    const sumNetRevenue = arr.reduce((acc, it) => acc + itemNetRevenue(it), 0);
    return { sumSalePrice, sumNetRevenue };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  // -------- CRUD: Lots --------
  function openCreateLot() {
    setEditLot(null);
    setLotName('');
    setLotPurchaseDate('');
    setLotItemsCount('');
    setLotTotalCost('');
    setShowLotForm(true);
    setShowAddMenu(false);
  }
  function openEditLot(l: Lot) {
    setEditLot(l);
    setLotName(l.name ?? '');
    setLotPurchaseDate(l.purchase_date ?? '');
    setLotItemsCount(l.items_count ?? '');
    setLotTotalCost(l.total_cost ?? '');
    setShowLotForm(true);
  }
  async function saveLot() {
    const name = lotName.trim();
    if (!name) return alert('Pon un nombre de lote.');

    const itemsCount = lotItemsCount === '' ? null : Number(lotItemsCount);
    const totalCost = lotTotalCost === '' ? null : Number(lotTotalCost);

    const unit =
      itemsCount && itemsCount > 0 && totalCost != null
        ? Number((totalCost / itemsCount).toFixed(2))
        : null;

    const payload = {
      name,
      purchase_date: lotPurchaseDate || null,
      items_count: itemsCount,
      total_cost: totalCost,
      unit_cost: unit,
      updated_at: new Date().toISOString(),
    };

    if (editLot) {
      const { error } = await supabase.from('lots').update(payload).eq('id', editLot.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from('lots').insert(payload);
      if (error) return alert(error.message);
    }

    setShowLotForm(false);
    await refresh();
  }
  async function deleteLot(l: Lot) {
    if (!confirm(`¿Eliminar el lote "${l.name}"? (Las prendas quedan sin lote)`)) return;
    const { error } = await supabase.from('lots').delete().eq('id', l.id);
    if (error) return alert(error.message);
    await refresh();
  }

  // -------- CRUD: Items --------
  function openCreateItem() {
    setEditItem(null);
    setItemName('');
    setItemSize('');
    setItemLotId('');
    setItemListingDate('');
    setItemSaleDate('');
    setItemStatus('for_sale');
    setItemPurchaseCost('');
    setItemSalePrice('');
    setItemPlatformFee('');
    setItemShippingCost('');
    setShowItemForm(true);
    setShowAddMenu(false);
  }
  function openEditItem(it: Item) {
    setEditItem(it);
    setItemName(it.name ?? '');
    setItemSize(it.size ?? '');
    setItemLotId(it.lot_id ?? '');
    setItemListingDate(it.listing_date ?? '');
    setItemSaleDate(it.sale_date ?? '');
    setItemStatus(it.status);
    setItemPurchaseCost(it.purchase_cost ?? '');
    setItemSalePrice(it.sale_price ?? '');
    setItemPlatformFee(it.platform_fee ?? '');
    setItemShippingCost(it.shipping_cost ?? '');
    setShowItemForm(true);
  }
  async function saveItem() {
    const name = itemName.trim();
    if (!name) return alert('Pon un nombre de prenda.');

    const payload: any = {
      name,
      size: itemSize || null,
      lot_id: itemLotId || null,
      listing_date: itemListingDate || null,
      sale_date: itemSaleDate || null,
      status: itemStatus,
      purchase_cost: itemPurchaseCost === '' ? null : Number(itemPurchaseCost),
      sale_price: itemSalePrice === '' ? null : Number(itemSalePrice),
      platform_fee: itemPlatformFee === '' ? 0 : Number(itemPlatformFee),
      shipping_cost: itemShippingCost === '' ? 0 : Number(itemShippingCost),
      updated_at: new Date().toISOString(),
    };

    if (editItem) {
      const { error } = await supabase.from('items').update(payload).eq('id', editItem.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from('items').insert(payload);
      if (error) return alert(error.message);
    }

    setShowItemForm(false);
    await refresh();
  }
  async function deleteItem(it: Item) {
    if (!confirm(`¿Borrar "${it.name}"?`)) return;
    const { error } = await supabase.from('items').delete().eq('id', it.id);
    if (error) return alert(error.message);
    await refresh();
  }
  async function quickStatus(it: Item, s: ItemStatus) {
    const patch: any = { status: s, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('items').update(patch).eq('id', it.id);
    if (error) return alert(error.message);
    await refresh();
  }

  function kpiTone(n: number) {
    if (!Number.isFinite(n)) return 'neutral' as const;
    if (n > 0) return 'good' as const;
    if (n < 0) return 'bad' as const;
    return 'neutral' as const;
  }

  return (
    <div className="min-h-screen bg-[#070B18] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070B18]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm text-white/60">Vinted Flips</div>
            <div className="text-lg font-semibold">Panel (beta)</div>
          </div>
          <button onClick={signOut} className="text-sm text-white/70 hover:text-white" type="button">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Cargando datos…
          </div>
        ) : (
          <>
            {/* SUMMARY */}
            {tab === 'summary' ? (
              <div className="space-y-5">
                {/* Periodo */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">Periodo</div>
                      <div className="mt-1 text-xs text-white/50">
                        Afecta a KPIs y resumen por lote (según <b>fecha de venta</b>).
                      </div>
                    </div>
                    <div className="text-xs text-white/50">
                      {from || to ? (
                        <span>
                          {from || '…'} → {to || '…'}
                        </span>
                      ) : (
                        <span>Todo</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill active={preset === 'all'} onClick={() => setPreset('all')}>
                      Todo
                    </Pill>
                    <Pill active={preset === 'this_month'} onClick={() => setPreset('this_month')}>
                      Este mes
                    </Pill>
                    <Pill active={preset === 'last_30'} onClick={() => setPreset('last_30')}>
                      Últimos 30 días
                    </Pill>
                    <Pill active={preset === 'custom'} onClick={() => setPreset('custom')}>
                      Personalizado
                    </Pill>
                  </div>

                  {preset === 'custom' ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="block">
                        <div className="text-xs text-white/60">Desde (venta)</div>
                        <input
                          type="date"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                        />
                      </label>
                      <label className="block">
                        <div className="text-xs text-white/60">Hasta (venta)</div>
                        <input
                          type="date"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                        />
                      </label>
                    </div>
                  ) : null}
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <Card
                    title="Beneficio total"
                    value={eur(kpiBenefitTotal)}
                    tone={kpiTone(kpiBenefitTotal)}
                    subtitle="Ingresos (vendidas, neto) − (coste total lotes + coste prendas sueltas)."
                  />
                  <Card
                    title="Beneficio sobre lotes"
                    value={eur(kpiBenefitLots)}
                    tone={kpiTone(kpiBenefitLots)}
                    subtitle="Ingresos netos (solo vendidas de lotes) − coste total lotes."
                  />
                  <Card
                    title="Margen prendas vendidas"
                    value={Number.isFinite(marginSold) ? pct(marginSold) : '—'}
                    tone={Number.isFinite(marginSold) && marginSold >= 0 ? 'good' : 'neutral'}
                    subtitle="Beneficio unitario (vendidas) / ingresos netos (vendidas)."
                  />
                  <Card
                    title="Media días para vender"
                    value={Number.isFinite(avgDaysToSell) ? avgDaysToSell.toFixed(1) : '—'}
                    tone="neutral"
                    subtitle="Solo vendidas con fecha publicación + venta."
                  />
                </div>

                {/* DESGLOSE (para que no nos la cuelen los datos) */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold">Desglose (debug)</div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/60">Ingresos vendidos (neto)</div>
                      <div className="mt-1 font-semibold text-emerald-300">{eur(revenueSoldNet)}</div>
                      <div className="mt-1 text-xs text-white/50">Vendidas en periodo: {soldInRange.length}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/60">Coste total lotes</div>
                      <div className="mt-1 font-semibold text-white">{eur(totalLotCost)}</div>
                      <div className="mt-1 text-xs text-white/50">Lotes: {lots.length}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/60">Coste prendas sueltas</div>
                      <div className="mt-1 font-semibold text-white">{eur(totalStandaloneCost)}</div>
                      <div className="mt-1 text-xs text-rose-200/80">
                        Prendas sueltas con coste 0/NULL: {standaloneMissingCostCount}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/60">Ingresos vendidos de lotes (neto)</div>
                      <div className="mt-1 font-semibold text-emerald-300">{eur(revenueLotsSoldNet)}</div>
                      <div className="mt-1 text-xs text-white/50">
                        Nota: solo cuenta si la prenda enlaza a un lote real (lot_id o lot_name válido).
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen por lote */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Resumen por lote</div>
                      <div className="mt-1 text-xs text-white/50">
                        Balance realizado (solo vendidas). Reservadas se muestran como potencial.
                      </div>
                    </div>
                    <button
                      onClick={() => setTab('lots')}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                      type="button"
                    >
                      Ver lotes
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {lotCards.map((c) => {
                      const balTone =
                        c.balanceReal > 0
                          ? 'text-emerald-300'
                          : c.balanceReal < 0
                          ? 'text-rose-300'
                          : 'text-white';
                      const potTone =
                        c.balancePotential > 0
                          ? 'text-emerald-300/80'
                          : c.balancePotential < 0
                          ? 'text-rose-300/80'
                          : 'text-white/70';
                      return (
                        <div key={c.lot.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-base font-semibold">{c.lot.name}</div>
                              <div className="mt-1 text-xs text-white/60">
                                Coste: {eur(c.cost)} · Vendidas: {c.soldCount} · Reservadas: {c.reservedCount}
                              </div>
                              <div className="mt-1 text-xs text-white/60">
                                Ingresos vendidas: {eur(c.revenueSold)} · Reservadas: {eur(c.revenueReserved)}
                              </div>
                            </div>

                            <div className={`shrink-0 text-right`}>
                              <div className="text-xs text-white/50">Balance (vendidas)</div>
                              <div className={`text-lg font-semibold ${balTone}`}>{eur(c.balanceReal)}</div>
                              <div className={`mt-1 text-xs ${potTone}`}>
                                Con reservadas: {eur(c.balancePotential)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                              <div className="text-white/60">ROI (vendidas)</div>
                              <div className="mt-1 font-semibold">
                                {Number.isFinite(c.roiReal) ? pct(c.roiReal) : '—'}
                              </div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                              <div className="text-white/60">Ingresos vendidos</div>
                              <div className="mt-1 font-semibold">{eur(c.revenueSold)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {lotCards.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
                        No hay lotes aún.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* ITEMS */}
            {tab === 'items' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">Prendas</div>
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        openCreateItem();
                      }}
                      className="rounded-xl bg-sky-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-sky-400"
                      type="button"
                    >
                      + Prenda
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill active={statusTab === 'all'} onClick={() => setStatusTab('all')}>
                      Todas <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{statusCounts.all}</span>
                    </Pill>
                    <Pill active={statusTab === 'for_sale'} onClick={() => setStatusTab('for_sale')}>
                      En venta <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{statusCounts.for_sale}</span>
                    </Pill>
                    <Pill active={statusTab === 'sold'} onClick={() => setStatusTab('sold')}>
                      Vendidas <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{statusCounts.sold}</span>
                    </Pill>
                    <Pill active={statusTab === 'reserved'} onClick={() => setStatusTab('reserved')}>
                      Reservadas <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{statusCounts.reserved}</span>
                    </Pill>
                    <Pill active={statusTab === 'returned'} onClick={() => setStatusTab('returned')}>
                      Devueltas <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{statusCounts.returned}</span>
                    </Pill>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <label className="block md:col-span-1">
                      <div className="text-xs text-white/60">Buscar</div>
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Nombre, lote, talla…"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                      />
                    </label>

                    <label className="block md:col-span-1">
                      <div className="text-xs text-white/60">Lote</div>
                      <select
                        value={lotFilterId}
                        onChange={(e) => setLotFilterId(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                      >
                        <option value="all">Todos</option>
                        {lots.map((l) => (
                          <option value={l.id} key={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block md:col-span-1">
                      <div className="text-xs text-white/60">Orden</div>
                      <select
                        value={order}
                        onChange={(e) => setOrder(e.target.value as any)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                      >
                        <option value="listing_desc">Publicación (más reciente)</option>
                        <option value="listing_asc">Publicación (más antigua)</option>
                        <option value="sale_desc">Venta (más reciente)</option>
                        <option value="sale_asc">Venta (más antigua)</option>
                      </select>
                    </label>
                  </div>

                  {/* Totales según estado */}
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/60">Totales (según filtros)</div>
                    <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                      <div className="text-sm text-white/70">
                        Mostrando <b>{filteredItems.length}</b> prendas
                      </div>

                      <div className="text-right">
                        {statusTab === 'sold' || statusTab === 'reserved' ? (
                          <>
                            <div className="text-xs text-white/60">Ingresos (netos)</div>
                            <div className="text-lg font-semibold text-emerald-300">
                              {eur(itemsTotals.sumNetRevenue)}
                            </div>
                          </>
                        ) : statusTab === 'for_sale' ? (
                          <>
                            <div className="text-xs text-white/60">Valor en venta (precio)</div>
                            <div className="text-lg font-semibold text-white">{eur(itemsTotals.sumSalePrice)}</div>
                          </>
                        ) : statusTab === 'returned' ? (
                          <>
                            <div className="text-xs text-white/60">Valor devuelto (precio)</div>
                            <div className="text-lg font-semibold text-rose-300">{eur(itemsTotals.sumSalePrice)}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-white/60">Ingresos netos (vendidas+reservadas)</div>
                            <div className="text-lg font-semibold text-emerald-300">
                              {eur(
                                filteredItems
                                  .filter((it) => it.status === 'sold' || it.status === 'reserved')
                                  .reduce((acc, it) => acc + itemNetRevenue(it), 0)
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista prendas */}
                <div className="space-y-3">
                  {filteredItems.map((it) => {
                    const lot = getLotForItem(it);
                    const lotLabel = lot?.name ?? (normalizeLotName(it.lot_name ?? null) ? it.lot_name : '—');
                    const profit =
                      it.status === 'sold' || it.status === 'reserved'
                        ? itemNetRevenue(it) - itemUnitCost(it)
                        : 0;

                    const profitTone =
                      profit > 0 ? 'text-emerald-300' : profit < 0 ? 'text-rose-300' : 'text-white/70';

                    return (
                      <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold">{it.name}</div>
                            <div className="mt-1 text-xs text-white/60">
                              Lote: {lotLabel} · Talla: {it.size ?? '—'}
                            </div>
                          </div>

                          <div className={`shrink-0 text-right ${profitTone}`}>
                            <div className="text-xs text-white/50">Beneficio (unit.)</div>
                            <div className="text-base font-semibold">{eur(profit)}</div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/60">Coste</div>
                            <div className="mt-1 font-semibold">{eur(itemUnitCost(it))}</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/60">Precio</div>
                            <div className="mt-1 font-semibold">{eur(clampNumber(it.sale_price, 0))}</div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/60">F. pub.</div>
                            <div className="mt-1 font-semibold">{it.listing_date ?? '—'}</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/60">F. venta</div>
                            <div className="mt-1 font-semibold">{it.sale_date ?? '—'}</div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3">
                          <label className="block">
                            <div className="text-xs text-white/60">Estado (rápido)</div>
                            <select
                              value={it.status}
                              onChange={(e) => quickStatus(it, e.target.value as ItemStatus)}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                            >
                              <option value="for_sale">En venta</option>
                              <option value="sold">Vendida</option>
                              <option value="reserved">Reservada</option>
                              <option value="returned">Devuelta</option>
                            </select>
                          </label>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditItem(it)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                            type="button"
                          >
                            <PencilIcon /> Editar
                          </button>
                          <button
                            onClick={() => deleteItem(it)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20"
                            type="button"
                          >
                            <TrashIcon /> Borrar
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredItems.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
                      No hay prendas que coincidan con los filtros.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* LOTS */}
            {tab === 'lots' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">Lotes</div>
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        openCreateLot();
                      }}
                      className="rounded-xl bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
                      type="button"
                    >
                      + Lote
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-white/50">
                    Balance grande = solo <b>vendidas</b>. Debajo se muestra el potencial incluyendo reservadas.
                  </div>
                </div>

                <div className="space-y-3">
                  {lotCards.map((c) => {
                    const balTone =
                      c.balanceReal > 0 ? 'text-emerald-300' : c.balanceReal < 0 ? 'text-rose-300' : 'text-white';
                    const potTone =
                      c.balancePotential > 0
                        ? 'text-emerald-300/80'
                        : c.balancePotential < 0
                        ? 'text-rose-300/80'
                        : 'text-white/70';

                    const date = c.lot.purchase_date ?? '—';
                    return (
                      <div key={c.lot.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold">{c.lot.name}</div>
                            <div className="mt-1 text-xs text-white/60">
                              {date} · Prendas: {c.lot.items_count ?? '—'}
                            </div>
                            <div className="mt-1 text-xs text-white/60">
                              Coste: {eur(c.cost)} · Unit: {eur(clampNumber(c.lot.unit_cost, 0))}
                            </div>
                            <div className="mt-1 text-xs text-white/60">
                              Ingresos vendidas: {eur(c.revenueSold)} · Reservadas: {eur(c.revenueReserved)}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-xs text-white/50">Balance (vendidas)</div>
                            <div className={`text-lg font-semibold ${balTone}`}>{eur(c.balanceReal)}</div>
                            <div className={`mt-1 text-xs ${potTone}`}>Con reservadas: {eur(c.balancePotential)}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditLot(c.lot)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                            type="button"
                          >
                            <PencilIcon /> Editar
                          </button>
                          <button
                            onClick={() => deleteLot(c.lot)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20"
                            type="button"
                          >
                            <TrashIcon /> Borrar
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {lotCards.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
                      No hay lotes.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#070B18]/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-5 items-center px-4 py-3">
          <button
            onClick={() => setTab('summary')}
            className={[
              'flex flex-col items-center gap-1 text-xs',
              tab === 'summary' ? 'text-emerald-200' : 'text-white/60',
            ].join(' ')}
            type="button"
          >
            <HomeIcon />
            Resumen
          </button>

          <button
            onClick={() => setTab('lots')}
            className={[
              'flex flex-col items-center gap-1 text-xs',
              tab === 'lots' ? 'text-emerald-200' : 'text-white/60',
            ].join(' ')}
            type="button"
          >
            <BoxIcon />
            Lotes
          </button>

          <button
            onClick={() => setShowAddMenu(true)}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-black shadow-lg"
            type="button"
            aria-label="Añadir"
          >
            <PlusIcon />
          </button>

          <button
            onClick={() => setTab('items')}
            className={[
              'flex flex-col items-center gap-1 text-xs',
              tab === 'items' ? 'text-emerald-200' : 'text-white/60',
            ].join(' ')}
            type="button"
          >
            <TagIcon />
            Prendas
          </button>

          <button
            onClick={refresh}
            className="flex flex-col items-center gap-1 text-xs text-white/60 hover:text-white"
            type="button"
          >
            <span className="text-lg">↻</span>
            Refrescar
          </button>
        </div>
      </nav>

      {/* Add menu */}
      {showAddMenu ? (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/60" onClick={() => setShowAddMenu(false)} type="button" />
          <div className="absolute bottom-24 left-1/2 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0B1030] p-4 shadow-xl">
            <div className="text-sm font-semibold">Añadir</div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                onClick={openCreateLot}
                className="rounded-xl bg-emerald-400/90 px-4 py-3 text-left text-sm font-semibold text-black hover:bg-emerald-300"
                type="button"
              >
                + Lote
              </button>
              <button
                onClick={openCreateItem}
                className="rounded-xl bg-sky-500/90 px-4 py-3 text-left text-sm font-semibold text-black hover:bg-sky-400"
                type="button"
              >
                + Prenda
              </button>
              <button
                onClick={() => setShowAddMenu(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10"
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Lot form modal */}
      {showLotForm ? (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/60" onClick={() => setShowLotForm(false)} type="button" />
          <div className="absolute left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0B1030] p-5 shadow-xl">
            <div className="text-lg font-semibold">{editLot ? 'Editar lote' : 'Añadir lote'}</div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <div className="text-xs text-white/60">Nombre del lote</div>
                <input
                  value={lotName}
                  onChange={(e) => setLotName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Fecha compra</div>
                <input
                  type="date"
                  value={lotPurchaseDate}
                  onChange={(e) => setLotPurchaseDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Nº prendas</div>
                <input
                  type="number"
                  value={lotItemsCount}
                  onChange={(e) => setLotItemsCount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block md:col-span-2">
                <div className="text-xs text-white/60">Coste total (€)</div>
                <input
                  type="number"
                  value={lotTotalCost}
                  onChange={(e) => setLotTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
                <div className="mt-2 text-xs text-white/50">Unit cost se calcula automáticamente.</div>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLotForm(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={saveLot}
                className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
                type="button"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Item form modal */}
      {showItemForm ? (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/60" onClick={() => setShowItemForm(false)} type="button" />
          <div className="absolute left-1/2 top-1/2 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0B1030] p-5 shadow-xl">
            <div className="text-lg font-semibold">{editItem ? 'Editar prenda' : 'Añadir prenda'}</div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <div className="text-xs text-white/60">Nombre</div>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Talla</div>
                <input
                  value={itemSize}
                  onChange={(e) => setItemSize(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Lote (opcional)</div>
                <select
                  value={itemLotId}
                  onChange={(e) => setItemLotId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                >
                  <option value="">Sin lote</option>
                  {lots.map((l) => (
                    <option value={l.id} key={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Fecha publicación</div>
                <input
                  type="date"
                  value={itemListingDate}
                  onChange={(e) => setItemListingDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Fecha venta</div>
                <input
                  type="date"
                  value={itemSaleDate}
                  onChange={(e) => setItemSaleDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Estado</div>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value as ItemStatus)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                >
                  <option value="for_sale">En venta</option>
                  <option value="sold">Vendida</option>
                  <option value="reserved">Reservada</option>
                  <option value="returned">Devuelta</option>
                </select>
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Coste compra (€)</div>
                <input
                  type="number"
                  value={itemPurchaseCost}
                  onChange={(e) => setItemPurchaseCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Precio (€)</div>
                <input
                  type="number"
                  value={itemSalePrice}
                  onChange={(e) => setItemSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Platform fee (€)</div>
                <input
                  type="number"
                  value={itemPlatformFee}
                  onChange={(e) => setItemPlatformFee(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="block">
                <div className="text-xs text-white/60">Shipping cost (€)</div>
                <input
                  type="number"
                  value={itemShippingCost}
                  onChange={(e) => setItemShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-400/40"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowItemForm(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={saveItem}
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-black hover:bg-sky-400"
                type="button"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
