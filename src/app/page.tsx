'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
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
  provider: string | null;
  notes: string | null;
};

type Item = {
  id: string;
  user_id: string;
  lot_id: string | null;
  lot_name: string | null;
  name: string;
  size: string | null;
  platform: string | null;
  purchase_cost: number | null;
  listing_date: string | null;
  sale_date: string | null;
  status: ItemStatus;
  sale_price: number | null;
  platform_fee: number | null;
  shipping_cost: number | null;
};

type LotSummary = {
  lotId: string;
  name: string;
  totalCost: number;
  itemsInLot: number;
  soldInPeriod: number;
  revenueInPeriod: number;
  profitItemsInPeriod: number;
  profitVsLotCost: number;
  roiVsLotCost: number | null;
  roiSoldItems: number | null;
};

type TabId = 'overview' | 'lots' | 'items';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const formatCurrency = (value: number | null | undefined): string => {
  const n = value ?? 0;
  return n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
};

const formatPercent = (value: number | null | undefined): string => {
  const n = value ?? 0;
  return `${n.toFixed(1)}%`;
};

const formatDateES = (value: string | null | undefined) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-ES');
};

const parseNumberInput = (raw: string): number | null => {
  const s = (raw ?? '').trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

function statusLabel(status: ItemStatus) {
  switch (status) {
    case 'sold':
      return 'Vendida';
    case 'reserved':
      return 'Reservada';
    case 'returned':
      return 'Devuelta';
    default:
      return 'En venta';
  }
}

function statusBadgeClass(status: ItemStatus) {
  switch (status) {
    case 'sold':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-600/40';
    case 'reserved':
      return 'bg-amber-500/15 text-amber-300 border-amber-600/40';
    case 'returned':
      return 'bg-rose-500/15 text-rose-300 border-rose-600/40';
    default:
      return 'bg-sky-500/15 text-sky-300 border-sky-600/40';
  }
}

/* ---------- Iconos (SVG inline) ---------- */
function IconTrash(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 16h10l1-16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconPencil(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
    </svg>
  );
}

function IconLogout(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 3v18" />
    </svg>
  );
}

function IconPlus(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function IconX(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        'h-10 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
        className
      )}
    />
  );
}

function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        'h-10 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
        className
      )}
    />
  );
}

/* ---------- Modal simple (mobile friendly) ---------- */
function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-auto rounded-t-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-0.5 text-xs text-slate-400">Pulsa ESC o toca fuera para cerrar.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 p-2 text-slate-200"
            aria-label="Cerrar"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function isDesktopNow() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 768px)').matches;
}

export default function HomePage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [lots, setLots] = useState<Lot[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- MODALES (mobile) ---
  const [lotModalOpen, setLotModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  // --- formulario lote ---
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [lotName, setLotName] = useState('');
  const [lotPurchaseDate, setLotPurchaseDate] = useState('');
  const [lotItemsCount, setLotItemsCount] = useState('');
  const [lotTotalCost, setLotTotalCost] = useState('');
  const [lotProvider, setLotProvider] = useState('');
  const [lotNotes, setLotNotes] = useState('');
  const [lotSaving, setLotSaving] = useState(false);

  // --- formulario prenda ---
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemLotId, setItemLotId] = useState<string | 'none'>('none');
  const [itemSize, setItemSize] = useState('');
  const [itemListingDate, setItemListingDate] = useState('');
  const [itemSaleDate, setItemSaleDate] = useState('');
  const [itemStatus, setItemStatus] = useState<ItemStatus>('for_sale');
  const [itemPurchaseCost, setItemPurchaseCost] = useState('');
  const [itemSalePrice, setItemSalePrice] = useState('');
  const [itemPlatformFee, setItemPlatformFee] = useState('');
  const [itemShippingCost, setItemShippingCost] = useState('');
  const [itemSaving, setItemSaving] = useState(false);
  const [showAdvancedCosts, setShowAdvancedCosts] = useState(false);

  // --- filtros de listado prendas ---
  const [itemsQuery, setItemsQuery] = useState('');
  const [itemsStatusFilter, setItemsStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [itemsLotFilter, setItemsLotFilter] = useState<string | 'all'>('all');

  // --- login simple con enlace mágico ---
  const [authEmail, setAuthEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');

  const loadData = useCallback(async (currentUser: User) => {
    const [lotsRes, itemsRes] = await Promise.all([
      supabase
        .from('lots')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('purchase_date', { ascending: false }),
      supabase
        .from('items')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('listing_date', { ascending: false }),
    ]);

    if (!lotsRes.error && lotsRes.data) setLots(lotsRes.data as Lot[]);
    if (!itemsRes.error && itemsRes.data) setItems(itemsRes.data as Item[]);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
        await loadData(data.user);
      }
      setInitialLoading(false);
    };
    void init();
  }, [loadData]);

  // --- métricas globales (filtrado por fecha de venta) ---
  const metrics = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const soldItems = items.filter((item) => {
      if (item.status !== 'sold' || !item.sale_date) return false;
      const d = new Date(item.sale_date);
      if (Number.isNaN(d.getTime())) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    let totalRevenue = 0;
    let lotRevenue = 0;
    let looseItemsCost = 0;
    let profitOnSoldItems = 0;

    let daysAccumulator = 0;
    let daysCount = 0;

    for (const item of soldItems) {
      const sale = item.sale_price ?? 0;
      const fee = item.platform_fee ?? 0;
      const ship = item.shipping_cost ?? 0;
      const cost = item.purchase_cost ?? 0;

      totalRevenue += sale;
      if (item.lot_id) lotRevenue += sale;
      else looseItemsCost += cost;

      profitOnSoldItems += sale - fee - ship - cost;

      if (item.listing_date && item.sale_date) {
        const ld = new Date(item.listing_date);
        const sd = new Date(item.sale_date);
        const diffMs = sd.getTime() - ld.getTime();
        if (!Number.isNaN(diffMs) && diffMs >= 0) {
          daysAccumulator += diffMs / (1000 * 60 * 60 * 24);
          daysCount++;
        }
      }
    }

    const lotCost = lots.reduce((acc, lot) => acc + (lot.total_cost ?? 0), 0);

    const totalProfit = totalRevenue - lotCost - looseItemsCost;
    const lotsProfit = lotRevenue - lotCost;
    const marginPercent = totalRevenue > 0 ? (profitOnSoldItems / totalRevenue) * 100 : 0;
    const avgDaysToSell = daysCount > 0 ? daysAccumulator / daysCount : 0;

    return { totalRevenue, totalProfit, lotsProfit, itemsMarginPercent: marginPercent, avgDaysToSell };
  }, [items, lots, startDate, endDate]);

  // --- resumen por lote (periodo filtrado) ---
  const lotSummaries = useMemo<LotSummary[]>(() => {
    if (!lots.length) return [];

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const soldItems = items.filter((item) => {
      if (item.status !== 'sold' || !item.sale_date) return false;
      const d = new Date(item.sale_date);
      if (Number.isNaN(d.getTime())) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    const byLot = new Map<string, LotSummary>();

    for (const lot of lots) {
      byLot.set(lot.id, {
        lotId: lot.id,
        name: lot.name,
        totalCost: lot.total_cost ?? 0,
        itemsInLot: lot.items_count ?? 0,
        soldInPeriod: 0,
        revenueInPeriod: 0,
        profitItemsInPeriod: 0,
        profitVsLotCost: 0,
        roiVsLotCost: null,
        roiSoldItems: null,
      });
    }

    for (const item of soldItems) {
      if (!item.lot_id) continue;
      const summary = byLot.get(item.lot_id);
      if (!summary) continue;

      summary.soldInPeriod += 1;

      const sale = item.sale_price ?? 0;
      const fee = item.platform_fee ?? 0;
      const ship = item.shipping_cost ?? 0;
      const cost = item.purchase_cost ?? 0;

      summary.revenueInPeriod += sale;
      summary.profitItemsInPeriod += sale - fee - ship - cost;
    }

    for (const summary of byLot.values()) {
      summary.profitVsLotCost = summary.revenueInPeriod - summary.totalCost;
      summary.roiVsLotCost = summary.totalCost > 0 ? (summary.profitVsLotCost / summary.totalCost) * 100 : null;
      summary.roiSoldItems =
        summary.revenueInPeriod > 0 ? (summary.profitItemsInPeriod / summary.revenueInPeriod) * 100 : null;
    }

    return Array.from(byLot.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
  }, [items, lots, startDate, endDate]);

  const lotSummaryById = useMemo(() => {
    const map = new Map<string, LotSummary>();
    for (const ls of lotSummaries) map.set(ls.lotId, ls);
    return map;
  }, [lotSummaries]);

  // --- listado prendas filtrado ---
  const filteredItems = useMemo(() => {
    const q = itemsQuery.trim().toLowerCase();
    return items.filter((it) => {
      if (itemsStatusFilter !== 'all' && it.status !== itemsStatusFilter) return false;
      if (itemsLotFilter !== 'all') {
        if ((it.lot_id ?? 'none') !== itemsLotFilter) return false;
      }
      if (q) {
        const hay = `${it.name ?? ''} ${it.lot_name ?? ''} ${it.size ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, itemsQuery, itemsStatusFilter, itemsLotFilter]);

  // --- acciones auth ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) setAuthError(error.message);
      else setAuthMessage('Te hemos enviado un email con el enlace de acceso. Revisa tu bandeja de entrada.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setLots([]);
    setItems([]);
  };

  // --- helpers formulario lote ---
  const resetLotForm = () => {
    setEditingLotId(null);
    setLotName('');
    setLotPurchaseDate('');
    setLotItemsCount('');
    setLotTotalCost('');
    setLotProvider('');
    setLotNotes('');
  };

  const openNewLot = () => {
    resetLotForm();
    setActiveTab('lots');
    setLotModalOpen(true);
  };

  const handleEditLot = (lot: Lot) => {
    setEditingLotId(lot.id);
    setLotName(lot.name);
    setLotPurchaseDate(lot.purchase_date ?? '');
    setLotItemsCount(lot.items_count != null ? String(lot.items_count) : '');
    setLotTotalCost(lot.total_cost != null ? String(lot.total_cost) : '');
    setLotProvider(lot.provider ?? '');
    setLotNotes(lot.notes ?? '');
    setActiveTab('lots');

    if (isDesktopNow()) {
      setTimeout(() => {
        document.getElementById('lot-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      setLotModalOpen(true);
    }
  };

  const handleSubmitLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!lotName.trim()) return;

    setLotSaving(true);
    try {
      const itemsCountNum = lotItemsCount.trim() ? parseInt(lotItemsCount, 10) : null;
      const totalCostNum = parseNumberInput(lotTotalCost);
      const unitCost =
        itemsCountNum && itemsCountNum > 0 && totalCostNum != null ? totalCostNum / itemsCountNum : null;

      const payload = {
        user_id: user.id,
        name: lotName.trim(),
        purchase_date: lotPurchaseDate || null,
        items_count: itemsCountNum,
        total_cost: totalCostNum,
        unit_cost: unitCost,
        provider: lotProvider || null,
        notes: lotNotes || null,
      };

      if (editingLotId) {
        await supabase.from('lots').update(payload).eq('id', editingLotId).eq('user_id', user.id);
      } else {
        await supabase.from('lots').insert(payload);
      }

      resetLotForm();
      setLotModalOpen(false);
      await loadData(user);
    } finally {
      setLotSaving(false);
    }
  };

  const handleDeleteLot = async (lotId: string) => {
    if (!user) return;
    const ok = window.confirm('¿Seguro que quieres eliminar este lote? Las prendas seguirán existiendo pero sin lote.');
    if (!ok) return;

    await supabase.from('lots').delete().eq('id', lotId).eq('user_id', user.id);
    await loadData(user);
  };

  // --- helpers formulario prenda ---
  const resetItemForm = () => {
    setEditingItemId(null);
    setItemName('');
    setItemLotId('none');
    setItemSize('');
    setItemListingDate('');
    setItemSaleDate('');
    setItemStatus('for_sale');
    setItemPurchaseCost('');
    setItemSalePrice('');
    setItemPlatformFee('');
    setItemShippingCost('');
    setShowAdvancedCosts(false);
  };

  const openNewItem = () => {
    resetItemForm();
    setActiveTab('items');
    setItemModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setItemName(item.name ?? '');
    setItemLotId(item.lot_id ? item.lot_id : 'none');
    setItemSize(item.size ?? '');
    setItemListingDate(item.listing_date ?? '');
    setItemSaleDate(item.sale_date ?? '');
    setItemStatus(item.status ?? 'for_sale');

    setItemPurchaseCost(item.purchase_cost != null ? String(item.purchase_cost) : '');
    setItemSalePrice(item.sale_price != null ? String(item.sale_price) : '');

    const fee = item.platform_fee ?? 0;
    const ship = item.shipping_cost ?? 0;
    const shouldShowAdv = fee !== 0 || ship !== 0;
    setShowAdvancedCosts(shouldShowAdv);
    setItemPlatformFee(shouldShowAdv ? String(fee) : '');
    setItemShippingCost(shouldShowAdv ? String(ship) : '');

    setActiveTab('items');

    if (isDesktopNow()) {
      setTimeout(() => {
        document.getElementById('item-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      setItemModalOpen(true);
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!itemName.trim()) return;

    setItemSaving(true);
    try {
      const lot = itemLotId !== 'none' ? lots.find((l) => l.id === itemLotId) ?? null : null;

      const salePriceNum = parseNumberInput(itemSalePrice);
      const purchaseCostFromInput = parseNumberInput(itemPurchaseCost);
      const purchaseCostNum = purchaseCostFromInput ?? lot?.unit_cost ?? null;

      const platformFeeNum = showAdvancedCosts ? parseNumberInput(itemPlatformFee) ?? 0 : 0;
      const shippingCostNum = showAdvancedCosts ? parseNumberInput(itemShippingCost) ?? 0 : 0;

      const isSold = itemStatus === 'sold';

      const payload = {
        user_id: user.id,
        lot_id: lot ? lot.id : null,
        lot_name: lot ? lot.name : null,
        name: itemName.trim(),
        size: itemSize || null,
        platform: 'Vinted',
        listing_date: itemListingDate || null,
        sale_date: isSold ? itemSaleDate || null : null,
        status: itemStatus,
        purchase_cost: purchaseCostNum,
        sale_price: isSold ? salePriceNum : null,
        platform_fee: platformFeeNum,
        shipping_cost: shippingCostNum,
      };

      if (editingItemId) {
        await supabase.from('items').update(payload).eq('id', editingItemId).eq('user_id', user.id);
      } else {
        await supabase.from('items').insert(payload);
      }

      resetItemForm();
      setItemModalOpen(false);
      await loadData(user);
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    const ok = window.confirm('¿Seguro que quieres eliminar esta prenda? Esta acción no se puede deshacer.');
    if (!ok) return;

    await supabase.from('items').delete().eq('id', itemId).eq('user_id', user.id);
    await loadData(user);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Resumen' },
    { id: 'lots', label: 'Lotes' },
    { id: 'items', label: 'Prendas' },
  ];

  const LotForm = (
    <form
      onSubmit={handleSubmitLot}
      className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3 sm:text-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Nombre del lote</label>
        <Input value={lotName} onChange={(e) => setLotName(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Fecha compra</label>
        <Input type="date" value={lotPurchaseDate} onChange={(e) => setLotPurchaseDate(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Nº prendas</label>
        <Input
          type="number"
          min={0}
          value={lotItemsCount}
          onChange={(e) => setLotItemsCount(e.target.value)}
          placeholder="Ej: 10"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Coste total (€)</label>
        <Input
          type="number"
          step="0.01"
          min={0}
          value={lotTotalCost}
          onChange={(e) => setLotTotalCost(e.target.value)}
          placeholder="Ej: 300"
        />
        <p className="text-[11px] text-slate-500">
          Coste unitario calculado:{' '}
          {(() => {
            const c = parseNumberInput(lotTotalCost);
            const n = lotItemsCount.trim() ? parseInt(lotItemsCount, 10) : null;
            if (!c || !n || n <= 0) return '—';
            return formatCurrency(c / n);
          })()}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Proveedor</label>
        <Input value={lotProvider} onChange={(e) => setLotProvider(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="flex flex-col gap-1 lg:col-span-2">
        <label className="text-slate-300">Notas</label>
        <Input value={lotNotes} onChange={(e) => setLotNotes(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="mt-1 flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-3">
        {editingLotId && (
          <button
            type="button"
            onClick={() => {
              resetLotForm();
              setLotModalOpen(false);
            }}
            className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-500"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={lotSaving}
          className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {lotSaving ? 'Guardando…' : editingLotId ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );

  const ItemForm = (
    <form
      onSubmit={handleSubmitItem}
      className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3 sm:text-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Nombre</label>
        <Input value={itemName} onChange={(e) => setItemName(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Lote (opcional)</label>
        <Select value={itemLotId} onChange={(e) => setItemLotId(e.target.value as any)}>
          <option value="none">Sin lote</option>
          {lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Talla</label>
        <Input value={itemSize} onChange={(e) => setItemSize(e.target.value)} placeholder="Ej: M / 38" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Fecha publicación</label>
        <Input type="date" value={itemListingDate} onChange={(e) => setItemListingDate(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Estado</label>
        <Select value={itemStatus} onChange={(e) => setItemStatus(e.target.value as ItemStatus)}>
          <option value="for_sale">En venta</option>
          <option value="sold">Vendida</option>
          <option value="reserved">Reservada</option>
          <option value="returned">Devuelta</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-300">Coste compra (€)</label>
        <Input
          type="number"
          step="0.01"
          min={0}
          value={itemPurchaseCost}
          onChange={(e) => setItemPurchaseCost(e.target.value)}
          placeholder="Si vacío y tiene lote → coste unit."
        />
      </div>

      {itemStatus === 'sold' && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-slate-300">Fecha venta</label>
            <Input type="date" value={itemSaleDate} onChange={(e) => setItemSaleDate(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-300">Precio venta (€)</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={itemSalePrice}
              onChange={(e) => setItemSalePrice(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
        <button
          type="button"
          onClick={() => setShowAdvancedCosts((v) => !v)}
          className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-500"
        >
          {showAdvancedCosts ? 'Ocultar costes avanzados' : 'Mostrar costes avanzados'}
        </button>
      </div>

      {showAdvancedCosts && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-slate-300">Comisión plataforma (€)</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={itemPlatformFee}
              onChange={(e) => setItemPlatformFee(e.target.value)}
              placeholder="Normalmente 0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-300">Envío asumido (€)</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={itemShippingCost}
              onChange={(e) => setItemShippingCost(e.target.value)}
              placeholder="Normalmente 0"
            />
          </div>
        </>
      )}

      <div className="mt-1 flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-3">
        {editingItemId && (
          <button
            type="button"
            onClick={() => {
              resetItemForm();
              setItemModalOpen(false);
            }}
            className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-500"
          >
            Cancelar edición
          </button>
        )}
        <button
          type="submit"
          disabled={itemSaving}
          className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {itemSaving ? 'Guardando…' : editingItemId ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 pt-16">
          <p className="text-sm text-slate-400">Cargando sesión y datos de Supabase…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-3 pb-24 pt-4 sm:px-6 lg:px-8">
        {/* HEADER + TABS STICKY */}
        <div className="sticky top-0 z-30 -mx-3 mb-4 border-b border-slate-800 bg-slate-950/80 px-3 pb-3 pt-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold sm:text-xl">Vinted Flips</h1>
              <p className="text-xs text-slate-400 sm:text-sm">Panel de lotes y prendas (beta)</p>
            </div>

            {user && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
              >
                <IconLogout className="h-4 w-4" />
                <span>Salir</span>
              </button>
            )}
          </header>

          {/* Tabs */}
          {user && (
            <nav className="mt-3">
              <div className="inline-flex w-full justify-between gap-1 rounded-full bg-slate-900/80 p-1 text-xs sm:w-auto sm:justify-start sm:text-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cx(
                      'w-full rounded-full px-3 py-2 transition sm:w-auto',
                      activeTab === tab.id
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>

        {/* LOGIN */}
        {!user ? (
          <section className="mt-12 flex justify-center">
            <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6">
              <h2 className="text-base font-semibold sm:text-lg">Accede a tu panel</h2>
              <p className="mt-1 text-xs text-slate-400">
                Introduce tu email y te enviaremos un enlace mágico para entrar.
              </p>

              <form onSubmit={handleLogin} className="mt-4 space-y-3 text-xs sm:text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-300">Email</label>
                  <Input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                </div>

                {authMessage && <p className="text-xs text-emerald-400">{authMessage}</p>}
                {authError && <p className="text-xs text-rose-400">{authError}</p>}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authLoading ? 'Enviando enlace…' : 'Enviar enlace de acceso'}
                </button>
              </form>
            </div>
          </section>
        ) : (
          <>
            {/* MODALES MOBILE */}
            <Modal
              open={lotModalOpen}
              title={editingLotId ? 'Editar lote' : 'Nuevo lote'}
              onClose={() => {
                setLotModalOpen(false);
              }}
            >
              {LotForm}
            </Modal>

            <Modal
              open={itemModalOpen}
              title={editingItemId ? 'Editar prenda' : 'Nueva prenda'}
              onClose={() => {
                setItemModalOpen(false);
              }}
            >
              {ItemForm}
            </Modal>

            {/* FILTROS PERIODO + KPIS */}
            <section className="mb-6 space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-sm font-medium sm:text-base">Filtros de periodo</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Aplica a métricas y resumen por lote (según fecha de venta).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Desde (venta)</label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Hasta (venta)</label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="text-xs font-medium text-slate-400">Beneficio total</p>
                  <p
                    className={cx(
                      'mt-2 text-lg font-semibold sm:text-xl',
                      metrics.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {formatCurrency(metrics.totalProfit)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">Ingresos − lotes − prendas sueltas vendidas.</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="text-xs font-medium text-slate-400">Beneficio sobre lotes</p>
                  <p
                    className={cx(
                      'mt-2 text-lg font-semibold sm:text-xl',
                      metrics.lotsProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {formatCurrency(metrics.lotsProfit)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">Ventas de lote − coste total lotes.</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="text-xs font-medium text-slate-400">Margen prendas vendidas</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-300 sm:text-xl">
                    {formatPercent(metrics.itemsMarginPercent)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">Beneficio sobre ventas (solo vendidas).</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="text-xs font-medium text-slate-400">Media días para vender</p>
                  <p className="mt-2 text-lg font-semibold text-sky-300 sm:text-xl">
                    {metrics.avgDaysToSell.toFixed(1)} días
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">Publicación → venta.</p>
                </div>
              </div>
            </section>

            {/* CONTENIDO */}
            {activeTab === 'overview' && (
              <section className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
                  <h2 className="text-sm font-semibold sm:text-base">Resumen por lote (periodo filtrado)</h2>

                  {lotSummaries.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-400">
                      Aún no tienes lotes o todavía no has vendido prendas de lote en este periodo.
                    </p>
                  ) : (
                    <>
                      <div className="mt-3 hidden overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 text-xs md:block">
                        <table className="min-w-full divide-y divide-slate-800">
                          <thead className="bg-slate-950/80">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">Lote</th>
                              <th className="px-3 py-2 text-right font-medium">Coste lote</th>
                              <th className="px-3 py-2 text-right font-medium">Prendas lote</th>
                              <th className="px-3 py-2 text-right font-medium">Vendidas periodo</th>
                              <th className="px-3 py-2 text-right font-medium">Ingresos periodo</th>
                              <th className="px-3 py-2 text-right font-medium">Beneficio vs lote</th>
                              <th className="px-3 py-2 text-right font-medium">ROI coste</th>
                              <th className="px-3 py-2 text-right font-medium">ROI vendidas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {lotSummaries.map((ls) => (
                              <tr key={ls.lotId}>
                                <td className="px-3 py-2">{ls.name}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(ls.totalCost)}</td>
                                <td className="px-3 py-2 text-right">{ls.itemsInLot}</td>
                                <td className="px-3 py-2 text-right">{ls.soldInPeriod}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(ls.revenueInPeriod)}</td>
                                <td
                                  className={cx(
                                    'px-3 py-2 text-right',
                                    ls.profitVsLotCost >= 0 ? 'text-emerald-300' : 'text-rose-300'
                                  )}
                                >
                                  {formatCurrency(ls.profitVsLotCost)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {ls.roiVsLotCost != null ? formatPercent(ls.roiVsLotCost) : '—'}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {ls.roiSoldItems != null ? formatPercent(ls.roiSoldItems) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-3 space-y-3 text-xs md:hidden">
                        {lotSummaries.map((ls) => (
                          <div key={ls.lotId} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">{ls.name}</p>
                                <p className="text-[11px] text-slate-400">
                                  Coste: {formatCurrency(ls.totalCost)} · Prendas: {ls.itemsInLot}
                                </p>
                              </div>
                              <span
                                className={cx(
                                  'text-xs font-semibold',
                                  ls.profitVsLotCost >= 0 ? 'text-emerald-300' : 'text-rose-300'
                                )}
                              >
                                {formatCurrency(ls.profitVsLotCost)}
                              </span>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[11px] text-slate-400">Vendidas</p>
                                <p className="text-xs font-medium">{ls.soldInPeriod}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400">Ingresos</p>
                                <p className="text-xs font-medium">{formatCurrency(ls.revenueInPeriod)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400">ROI coste</p>
                                <p className="text-xs font-medium">
                                  {ls.roiVsLotCost != null ? formatPercent(ls.roiVsLotCost) : '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400">ROI vendidas</p>
                                <p className="text-xs font-medium">
                                  {ls.roiSoldItems != null ? formatPercent(ls.roiSoldItems) : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'lots' && (
              <section className="space-y-4">
                {/* FORM DESKTOP */}
                <div id="lot-form" className="hidden rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4 md:block">
                  <h2 className="text-sm font-semibold sm:text-base">
                    {editingLotId ? 'Editar lote' : 'Añadir nuevo lote'}
                  </h2>
                  <div className="mt-3">{LotForm}</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold sm:text-base">Lotes</h3>
                    <button
                      type="button"
                      onClick={() => (isDesktopNow() ? null : openNewLot())}
                      className="md:hidden rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950"
                    >
                      + Lote
                    </button>
                  </div>

                  {lots.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-400">Aún no has creado ningún lote.</p>
                  ) : (
                    <>
                      <div className="mt-3 hidden overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 text-xs md:block">
                        <table className="min-w-full divide-y divide-slate-800">
                          <thead className="bg-slate-950/80">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">Lote</th>
                              <th className="px-3 py-2 text-left font-medium">Fecha compra</th>
                              <th className="px-3 py-2 text-right font-medium">Prendas</th>
                              <th className="px-3 py-2 text-right font-medium">Coste total</th>
                              <th className="px-3 py-2 text-right font-medium">Coste unit.</th>
                              <th className="px-3 py-2 text-right font-medium">Beneficio vs lote</th>
                              <th className="px-3 py-2 text-right font-medium">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {lots.map((lot) => {
                              const summary = lotSummaryById.get(lot.id);
                              return (
                                <tr key={lot.id}>
                                  <td className="px-3 py-2">{lot.name}</td>
                                  <td className="px-3 py-2">{formatDateES(lot.purchase_date)}</td>
                                  <td className="px-3 py-2 text-right">{lot.items_count ?? '—'}</td>
                                  <td className="px-3 py-2 text-right">
                                    {lot.total_cost != null ? formatCurrency(lot.total_cost) : '—'}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {lot.unit_cost != null ? formatCurrency(lot.unit_cost) : '—'}
                                  </td>
                                  <td
                                    className={cx(
                                      'px-3 py-2 text-right',
                                      (summary?.profitVsLotCost ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'
                                    )}
                                  >
                                    {summary ? formatCurrency(summary.profitVsLotCost) : '—'}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleEditLot(lot)}
                                      className="inline-flex items-center justify-center rounded-md border border-slate-700 px-2 py-2 text-sky-300 hover:border-sky-600/60 hover:text-sky-200"
                                      aria-label="Editar lote"
                                    >
                                      <IconPencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLot(lot.id)}
                                      className="ml-2 inline-flex items-center justify-center rounded-md border border-slate-700 px-2 py-2 text-rose-300 hover:border-rose-600/60 hover:text-rose-200"
                                      aria-label="Eliminar lote"
                                    >
                                      <IconTrash className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-3 space-y-3 text-xs md:hidden">
                        {lots.map((lot) => {
                          const summary = lotSummaryById.get(lot.id);
                          return (
                            <div key={lot.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{lot.name}</p>
                                  <p className="text-[11px] text-slate-400">
                                    {formatDateES(lot.purchase_date)} · Prendas: {lot.items_count ?? '—'}
                                  </p>
                                  <p className="mt-1 text-[11px] text-slate-400">
                                    Coste: {lot.total_cost != null ? formatCurrency(lot.total_cost) : '—'} · Unit:{' '}
                                    {lot.unit_cost != null ? formatCurrency(lot.unit_cost) : '—'}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p
                                    className={cx(
                                      'text-xs font-semibold',
                                      (summary?.profitVsLotCost ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'
                                    )}
                                  >
                                    {summary ? formatCurrency(summary.profitVsLotCost) : '—'}
                                  </p>

                                  <div className="mt-2 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEditLot(lot)}
                                      className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-[11px] text-sky-200"
                                    >
                                      <IconPencil className="h-4 w-4" />
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLot(lot.id)}
                                      className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-[11px] text-rose-200"
                                    >
                                      <IconTrash className="h-4 w-4" />
                                      Borrar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'items' && (
              <section className="space-y-4">
                {/* FORM DESKTOP */}
                <div id="item-form" className="hidden rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4 md:block">
                  <h2 className="text-sm font-semibold sm:text-base">
                    {editingItemId ? 'Editar prenda' : 'Añadir nueva prenda'}
                  </h2>
                  <div className="mt-3">{ItemForm}</div>
                </div>

                {/* Filtros + listado */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold sm:text-base">Prendas</h3>
                    <button
                      type="button"
                      onClick={() => (isDesktopNow() ? null : openNewItem())}
                      className="md:hidden rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950"
                    >
                      + Prenda
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Buscar</label>
                      <Input
                        value={itemsQuery}
                        onChange={(e) => setItemsQuery(e.target.value)}
                        placeholder="Nombre, lote, talla…"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Estado</label>
                      <Select value={itemsStatusFilter} onChange={(e) => setItemsStatusFilter(e.target.value as any)}>
                        <option value="all">Todos</option>
                        <option value="for_sale">En venta</option>
                        <option value="sold">Vendida</option>
                        <option value="reserved">Reservada</option>
                        <option value="returned">Devuelta</option>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Lote</label>
                      <Select value={itemsLotFilter} onChange={(e) => setItemsLotFilter(e.target.value as any)}>
                        <option value="all">Todos</option>
                        <option value="none">Sin lote</option>
                        {lots.map((lot) => (
                          <option key={lot.id} value={lot.id}>
                            {lot.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Mostrando <span className="text-slate-200 font-medium">{filteredItems.length}</span> prendas.
                  </p>

                  {filteredItems.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-400">No hay prendas que coincidan con los filtros.</p>
                  ) : (
                    <>
                      {/* Tabla desktop */}
                      <div className="mt-3 hidden overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 text-xs md:block">
                        <table className="min-w-full divide-y divide-slate-800">
                          <thead className="bg-slate-950/80">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">Prenda</th>
                              <th className="px-3 py-2 text-left font-medium">Lote</th>
                              <th className="px-3 py-2 text-left font-medium">Talla</th>
                              <th className="px-3 py-2 text-left font-medium">Estado</th>
                              <th className="px-3 py-2 text-left font-medium">F. pub.</th>
                              <th className="px-3 py-2 text-left font-medium">F. venta</th>
                              <th className="px-3 py-2 text-right font-medium">Coste</th>
                              <th className="px-3 py-2 text-right font-medium">Venta</th>
                              <th className="px-3 py-2 text-right font-medium">Beneficio</th>
                              <th className="px-3 py-2 text-right font-medium">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {filteredItems.map((item) => {
                              const sale = item.sale_price ?? 0;
                              const fee = item.platform_fee ?? 0;
                              const ship = item.shipping_cost ?? 0;
                              const cost = item.purchase_cost ?? 0;
                              const profit = sale - fee - ship - cost;

                              return (
                                <tr key={item.id}>
                                  <td className="px-3 py-2">{item.name}</td>
                                  <td className="px-3 py-2">{item.lot_name ?? '—'}</td>
                                  <td className="px-3 py-2">{item.size ?? '—'}</td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={cx(
                                        'inline-flex items-center rounded-full border px-2 py-1 text-[11px]',
                                        statusBadgeClass(item.status)
                                      )}
                                    >
                                      {statusLabel(item.status)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">{formatDateES(item.listing_date)}</td>
                                  <td className="px-3 py-2">{formatDateES(item.sale_date)}</td>
                                  <td className="px-3 py-2 text-right">
                                    {item.purchase_cost != null ? formatCurrency(item.purchase_cost) : '—'}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {item.sale_price != null ? formatCurrency(item.sale_price) : '—'}
                                  </td>
                                  <td
                                    className={cx(
                                      'px-3 py-2 text-right',
                                      item.sale_price == null
                                        ? 'text-slate-400'
                                        : profit >= 0
                                        ? 'text-emerald-300'
                                        : 'text-rose-300'
                                    )}
                                  >
                                    {item.sale_price != null ? formatCurrency(profit) : '—'}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleEditItem(item)}
                                      className="inline-flex items-center justify-center rounded-md border border-slate-700 px-2 py-2 text-sky-300 hover:border-sky-600/60 hover:text-sky-200"
                                      aria-label="Editar prenda"
                                    >
                                      <IconPencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="ml-2 inline-flex items-center justify-center rounded-md border border-slate-700 px-2 py-2 text-rose-300 hover:border-rose-600/60 hover:text-rose-200"
                                      aria-label="Eliminar prenda"
                                    >
                                      <IconTrash className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Cards mobile */}
                      <div className="mt-3 space-y-3 text-xs md:hidden">
                        {filteredItems.map((item) => {
                          const sale = item.sale_price ?? 0;
                          const fee = item.platform_fee ?? 0;
                          const ship = item.shipping_cost ?? 0;
                          const cost = item.purchase_cost ?? 0;
                          const profit = sale - fee - ship - cost;

                          return (
                            <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-[11px] text-slate-400">
                                    Lote: {item.lot_name ?? 'Sin lote'} · Talla: {item.size ?? '—'}
                                  </p>

                                  <div className="mt-2">
                                    <span
                                      className={cx(
                                        'inline-flex items-center rounded-full border px-2 py-1 text-[11px]',
                                        statusBadgeClass(item.status)
                                      )}
                                    >
                                      {statusLabel(item.status)}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p
                                    className={cx(
                                      'text-xs font-semibold',
                                      item.sale_price == null
                                        ? 'text-slate-400'
                                        : profit >= 0
                                        ? 'text-emerald-300'
                                        : 'text-rose-300'
                                    )}
                                  >
                                    {item.sale_price != null ? formatCurrency(profit) : '—'}
                                  </p>

                                  <div className="mt-2 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEditItem(item)}
                                      className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-[11px] text-sky-200"
                                    >
                                      <IconPencil className="h-4 w-4" />
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-[11px] text-rose-200"
                                    >
                                      <IconTrash className="h-4 w-4" />
                                      Borrar
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-[11px] text-slate-400">Coste</p>
                                  <p className="text-xs font-medium">
                                    {item.purchase_cost != null ? formatCurrency(item.purchase_cost) : '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-slate-400">Venta</p>
                                  <p className="text-xs font-medium">
                                    {item.sale_price != null ? formatCurrency(item.sale_price) : '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-slate-400">F. pub.</p>
                                  <p className="text-xs font-medium">{formatDateES(item.listing_date)}</p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-slate-400">F. venta</p>
                                  <p className="text-xs font-medium">{formatDateES(item.sale_date)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Botones flotantes en mobile */}
      {user && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-4 md:hidden">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-xs shadow-lg shadow-black/40">
            <button
              type="button"
              onClick={openNewLot}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950"
            >
              <IconPlus className="h-4 w-4" />
              Lote
            </button>
            <button
              type="button"
              onClick={openNewItem}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950"
            >
              <IconPlus className="h-4 w-4" />
              Prenda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
