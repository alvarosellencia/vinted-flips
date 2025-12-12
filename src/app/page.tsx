"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

type Lot = {
  id: string;
  name: string;
  purchase_date: string | null;
  items_count: number | null;
  total_cost: number | null;
  unit_cost: number | null;
};

type ItemStatus = "for_sale" | "sold" | "reserved" | "returned";

type Item = {
  id: string;
  lot_id: string | null;
  name: string;
  size: string | null;
  listing_date: string | null;
  sale_date: string | null;
  status: ItemStatus;
  purchase_cost: number | null;
  sale_price: number | null;
  platform_fee: number | null;
  shipping_cost: number | null;
};

export default function HomePage() {
  const [session, setSession] = useState<any>(null);

  // Lotes
  const [lots, setLots] = useState<Lot[]>([]);
  const [loadingLots, setLoadingLots] = useState<boolean>(false);

  // Prendas
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);

  // Formulario lote
  const [lotName, setLotName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [itemsCount, setItemsCount] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [savingLot, setSavingLot] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);

  // Formulario prenda
  const [itemLotId, setItemLotId] = useState<string>("");
  const [itemName, setItemName] = useState("");
  const [itemSize, setItemSize] = useState("");
  const [itemListingDate, setItemListingDate] = useState("");
  const [itemSaleDate, setItemSaleDate] = useState("");
  const [itemStatus, setItemStatus] = useState<ItemStatus>("for_sale");
  const [itemPurchaseCost, setItemPurchaseCost] = useState("");
  const [itemSalePrice, setItemSalePrice] = useState("");
  const [itemPlatformFee, setItemPlatformFee] = useState("");
  const [itemShippingCost, setItemShippingCost] = useState("");
  const [savingItem, setSavingItem] = useState(false);
  const [itemFormError, setItemFormError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Filtros por fecha de venta (para KPIs y resumen por lote)
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Filtros de la tabla de prendas
  const [filterLotIdTable, setFilterLotIdTable] = useState<string>("all");
  const [filterStatusTable, setFilterStatusTable] =
    useState<"all" | ItemStatus>("all");

  // Helpers
  const getItemProfit = (item: Item): number => {
    const purchase = item.purchase_cost ?? 0;
    const sale = item.sale_price ?? 0;
    const fee = item.platform_fee ?? 0;
    const ship = item.shipping_cost ?? 0;
    return sale - purchase - fee - ship;
  };

  const getItemDaysToSell = (item: Item): number | null => {
    if (!item.listing_date || !item.sale_date) return null;
    const start = new Date(item.listing_date);
    const end = new Date(item.sale_date);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return days;
  };

  const isInDateFilter = (saleDate: string | null): boolean => {
    if (!filterFrom && !filterTo) return true;
    if (!saleDate) return false;
    const sale = new Date(saleDate);
    if (filterFrom) {
      const from = new Date(filterFrom);
      if (sale < from) return false;
    }
    if (filterTo) {
      const to = new Date(filterTo);
      to.setHours(23, 59, 59, 999);
      if (sale > to) return false;
    }
    return true;
  };

  // --- Carga de datos ---

  const fetchLots = async () => {
    if (!session) return;
    setLoadingLots(true);
    const { data, error } = await supabase
      .from("lots")
      .select("*")
      .order("purchase_date", { ascending: false });

    if (error) {
      console.error("Error cargando lotes:", error);
    } else {
      setLots((data || []) as Lot[]);
    }
    setLoadingLots(false);
  };

  const fetchItems = async () => {
    if (!session) return;
    setLoadingItems(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("listing_date", { ascending: false });

    if (error) {
      console.error("Error cargando prendas:", error);
    } else {
      setItems((data || []) as Item[]);
    }
    setLoadingItems(false);
  };

  // --- Auth ---

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchLots();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // --- Crear / editar lote ---

  const resetLotForm = () => {
    setLotName("");
    setPurchaseDate("");
    setItemsCount("");
    setTotalCost("");
    setEditingLot(null);
    setFormError(null);
  };

  const handleSubmitLot = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!lotName.trim()) {
      setFormError("El nombre del lote es obligatorio.");
      return;
    }
    if (!itemsCount) {
      setFormError("El número de prendas es obligatorio.");
      return;
    }
    if (!totalCost) {
      setFormError("El coste total del lote es obligatorio.");
      return;
    }

    const itemsCountNumber = parseInt(itemsCount, 10);
    const totalCostNumber = parseFloat(totalCost.replace(",", "."));

    if (isNaN(itemsCountNumber) || itemsCountNumber <= 0) {
      setFormError("El número de prendas debe ser mayor que 0.");
      return;
    }
    if (isNaN(totalCostNumber) || totalCostNumber < 0) {
      setFormError("El coste total debe ser un número válido (>= 0).");
      return;
    }

    const unitCost =
      itemsCountNumber > 0 && totalCostNumber > 0
        ? totalCostNumber / itemsCountNumber
        : 0;

    try {
      setSavingLot(true);

      if (editingLot) {
        const { error } = await supabase
          .from("lots")
          .update({
            name: lotName.trim(),
            purchase_date: purchaseDate || null,
            items_count: itemsCountNumber,
            total_cost: totalCostNumber,
            unit_cost: unitCost,
          })
          .eq("id", editingLot.id)
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error actualizando lote:", error);
          setFormError("Ha ocurrido un error al actualizar el lote.");
          return;
        }
      } else {
        const { error } = await supabase.from("lots").insert([
          {
            user_id: session.user.id,
            name: lotName.trim(),
            purchase_date: purchaseDate || null,
            items_count: itemsCountNumber,
            total_cost: totalCostNumber,
            unit_cost: unitCost,
          },
        ]);

        if (error) {
          console.error("Error creando lote:", error);
          setFormError("Ha ocurrido un error al guardar el lote.");
          return;
        }
      }

      resetLotForm();
      await fetchLots();
    } finally {
      setSavingLot(false);
    }
  };

  // --- Crear / editar prenda ---

  const resetItemForm = () => {
    setItemLotId("");
    setItemName("");
    setItemSize("");
    setItemListingDate("");
    setItemSaleDate("");
    setItemStatus("for_sale");
    setItemPurchaseCost("");
    setItemSalePrice("");
    setItemPlatformFee("");
    setItemShippingCost("");
    setEditingItem(null);
    setItemFormError(null);
  };

  const handleSubmitItem = async (e: FormEvent) => {
    e.preventDefault();
    setItemFormError(null);

    if (!itemName.trim()) {
      setItemFormError("El nombre de la prenda es obligatorio.");
      return;
    }

    let purchaseCostNumber: number | null = null;

    if (itemPurchaseCost.trim()) {
      purchaseCostNumber = parseFloat(itemPurchaseCost.replace(",", "."));
      if (isNaN(purchaseCostNumber) || purchaseCostNumber <= 0) {
        setItemFormError("El coste de compra debe ser un número mayor que 0.");
        return;
      }
    } else if (itemLotId) {
      const lot = lots.find((l) => l.id === itemLotId);
      if (!lot || lot.unit_cost == null) {
        setItemFormError(
          "No se ha podido obtener el coste unitario del lote seleccionado."
        );
        return;
      }
      purchaseCostNumber = lot.unit_cost;
    } else {
      setItemFormError(
        "Debes seleccionar un lote o indicar el coste de compra manualmente."
      );
      return;
    }

    const salePriceNumber =
      itemSalePrice.trim() === ""
        ? null
        : parseFloat(itemSalePrice.replace(",", "."));
    if (
      salePriceNumber !== null &&
      (isNaN(salePriceNumber) || salePriceNumber < 0)
    ) {
      setItemFormError("El precio de venta debe ser un número válido.");
      return;
    }

    const platformFeeNumber =
      itemPlatformFee.trim() === ""
        ? 0
        : parseFloat(itemPlatformFee.replace(",", "."));
    if (isNaN(platformFeeNumber) || platformFeeNumber < 0) {
      setItemFormError("La comisión debe ser un número válido.");
      return;
    }

    const shippingCostNumber =
      itemShippingCost.trim() === ""
        ? 0
        : parseFloat(itemShippingCost.replace(",", "."));
    if (isNaN(shippingCostNumber) || shippingCostNumber < 0) {
      setItemFormError("El coste de envío debe ser un número válido.");
      return;
    }

    try {
      setSavingItem(true);

      if (editingItem) {
        const { error } = await supabase
          .from("items")
          .update({
            lot_id: itemLotId || null,
            name: itemName.trim(),
            size: itemSize || null,
            listing_date: itemListingDate || null,
            sale_date: itemSaleDate || null,
            status: itemStatus,
            purchase_cost: purchaseCostNumber,
            sale_price: salePriceNumber,
            platform_fee: platformFeeNumber,
            shipping_cost: shippingCostNumber,
          })
          .eq("id", editingItem.id)
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error actualizando prenda:", error);
          setItemFormError("Ha ocurrido un error al actualizar la prenda.");
          return;
        }
      } else {
        const { error } = await supabase.from("items").insert([
          {
            user_id: session.user.id,
            lot_id: itemLotId || null,
            name: itemName.trim(),
            size: itemSize || null,
            listing_date: itemListingDate || null,
            sale_date: itemSaleDate || null,
            status: itemStatus,
            purchase_cost: purchaseCostNumber,
            sale_price: salePriceNumber,
            platform_fee: platformFeeNumber,
            shipping_cost: shippingCostNumber,
          },
        ]);

        if (error) {
          console.error("Error creando prenda:", error);
          setItemFormError("Ha ocurrido un error al guardar la prenda.");
          return;
        }
      }

      resetItemForm();
      await fetchItems();
    } finally {
      setSavingItem(false);
    }
  };

  // --- Borrar lote + prendas del lote ---

  const handleDeleteLot = async (lotId: string) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres borrar este lote y todas sus prendas asociadas? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    const { error: itemsError } = await supabase
      .from("items")
      .delete()
      .eq("lot_id", lotId);
    if (itemsError) {
      console.error("Error borrando prendas del lote:", itemsError);
      alert("Ha ocurrido un error al borrar las prendas del lote.");
      return;
    }

    const { error: lotError } = await supabase
      .from("lots")
      .delete()
      .eq("id", lotId);
    if (lotError) {
      console.error("Error borrando lote:", lotError);
      alert("Ha ocurrido un error al borrar el lote.");
      return;
    }

    if (editingLot && editingLot.id === lotId) {
      resetLotForm();
    }

    await fetchLots();
    await fetchItems();
  };

  // --- Borrar prenda individual ---

  const handleDeleteItem = async (itemId: string) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres borrar esta prenda? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) {
      console.error("Error borrando prenda:", error);
      alert("Ha ocurrido un error al borrar la prenda.");
      return;
    }

    if (editingItem && editingItem.id === itemId) {
      resetItemForm();
    }

    await fetchItems();
  };

  // --- MÉTRICAS GLOBALES ---

  const soldItemsAll = items.filter((item) => item.status === "sold");
  const soldItems = soldItemsAll.filter((item) =>
    isInDateFilter(item.sale_date)
  );

  const lotsCostTotal = lots.reduce(
    (sum, lot) => sum + (lot.total_cost ?? 0),
    0
  );

  const singleItems = items.filter((item) => !item.lot_id);
  const singlesCostTotal = singleItems.reduce(
    (sum, item) => sum + (item.purchase_cost ?? 0),
    0
  );

  const totalRevenueSold = soldItems.reduce(
    (sum, item) => sum + (item.sale_price ?? 0),
    0
  );
  const totalFeesSold = soldItems.reduce(
    (sum, item) => sum + (item.platform_fee ?? 0),
    0
  );
  const totalShippingSold = soldItems.reduce(
    (sum, item) => sum + (item.shipping_cost ?? 0),
    0
  );

  // Beneficio total = ingresos - (coste lotes + coste prendas sueltas + comisiones + envíos)
  const totalExpensesAll =
    lotsCostTotal + singlesCostTotal + totalFeesSold + totalShippingSold;
  const globalProfit = totalRevenueSold - totalExpensesAll;
  const globalProfitClass =
    globalProfit >= 0 ? "text-emerald-400" : "text-red-400";

  // Beneficio sobre lotes
  const soldItemsFromLots = soldItems.filter((item) => item.lot_id !== null);
  const lotRevenueSold = soldItemsFromLots.reduce(
    (sum, item) => sum + (item.sale_price ?? 0),
    0
  );
  const lotFeesSold = soldItemsFromLots.reduce(
    (sum, item) => sum + (item.platform_fee ?? 0),
    0
  );
  const lotShippingSold = soldItemsFromLots.reduce(
    (sum, item) => sum + (item.shipping_cost ?? 0),
    0
  );
  const lotProfit =
    lotRevenueSold - lotsCostTotal - lotFeesSold - lotShippingSold;
  const lotProfitClass = lotProfit >= 0 ? "text-emerald-400" : "text-red-400";

  // Margen sobre prendas vendidas (ROI usando coste por prenda)
  const costSoldItems = soldItems.reduce(
    (sum, item) => sum + (item.purchase_cost ?? 0),
    0
  );
  const profitFromSoldItems = soldItems.reduce(
    (sum, item) => sum + getItemProfit(item),
    0
  );
  const marginSoldItems =
    costSoldItems > 0 ? profitFromSoldItems / costSoldItems : null;

  // Media de días para vender
  const soldDays = soldItems
    .map((item) => getItemDaysToSell(item))
    .filter((d): d is number => d != null);
  const avgDaysToSell =
    soldDays.length > 0
      ? soldDays.reduce((sum, d) => sum + d, 0) / soldDays.length
      : null;

  // --- Resumen por lote (periodo filtrado) ---

  const lotsWithMetrics = lots.map((lot) => {
    const lotItemsAll = items.filter((item) => item.lot_id === lot.id);
    const lotSoldItems = soldItems.filter((item) => item.lot_id === lot.id);

    const lotRevenue = lotSoldItems.reduce(
      (sum, item) => sum + (item.sale_price ?? 0),
      0
    );
    const lotFees = lotSoldItems.reduce(
      (sum, item) => sum + (item.platform_fee ?? 0),
      0
    );
    const lotShipping = lotSoldItems.reduce(
      (sum, item) => sum + (item.shipping_cost ?? 0),
      0
    );
    const lotSoldCost = lotSoldItems.reduce(
      (sum, item) => sum + (item.purchase_cost ?? 0),
      0
    );

    const lotTotalCost = lot.total_cost ?? 0;

    const profitVsLot =
      lotRevenue - lotTotalCost - lotFees - lotShipping;
    const profitVsSoldCost =
      lotRevenue - lotSoldCost - lotFees - lotShipping;

    const roiVsLotCost =
      lotTotalCost > 0 ? profitVsLot / lotTotalCost : null;
    const roiVsSoldCost =
      lotSoldCost > 0 ? profitVsSoldCost / lotSoldCost : null;

    return {
      lot,
      totalItems: lotItemsAll.length,
      soldItems: lotSoldItems.length,
      revenue: lotRevenue,
      lotTotalCost,
      profitVsLot,
      roiVsLotCost,
      roiVsSoldCost,
    };
  });

  // --- Filtros tabla de prendas (por lote y estado) ---

  const itemsForTable = items.filter((item) => {
    // Filtro por lote
    if (filterLotIdTable === "no_lot") {
      if (item.lot_id) return false; // solo prendas sin lote
    } else if (filterLotIdTable !== "all") {
      if (item.lot_id !== filterLotIdTable) return false; // solo prendas del lote seleccionado
    }

    // Filtro por estado
    if (filterStatusTable !== "all") {
      if (item.status !== filterStatusTable) return false;
    }

    return true;
  });

  // --- Render ---

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-semibold mb-4 text-center">
            Accede a tu panel de lotes
          </h1>
          <p className="text-sm text-slate-600 mb-4 text-center">
            Regístrate o inicia sesión para gestionar tus lotes y prendas.
          </p>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Panel de lotes y prendas (beta)
        </h1>
        <button
          className="text-sm underline"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <section className="px-6 py-6 max-w-6xl mx-auto space-y-10">
        {/* FILTROS TIEMPO (KPIs + RESUMEN LOTE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold mb-1">Filtros de periodo</p>
            <p className="text-[11px] text-slate-400">
              Aplican a las métricas y al resumen por lote (según fecha de
              venta). Si dejas los campos vacíos se usa todo el histórico de
              ventas.
            </p>
          </div>
          <div className="flex gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Desde (fecha venta)
              </label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Hasta (fecha venta)
              </label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Beneficio total</p>
            <p className={`text-xl font-semibold ${globalProfitClass}`}>
              {globalProfit.toFixed(2)}€
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Ingresos ventas (todas las prendas vendidas en el periodo):{" "}
              {totalRevenueSold.toFixed(2)}€
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Gastos totales (lotes + prendas sueltas + comisiones + envíos):{" "}
              {totalExpensesAll.toFixed(2)}€
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Beneficio sobre lotes</p>
            <p className={`text-xl font-semibold ${lotProfitClass}`}>
              {lotProfit.toFixed(2)}€
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Ingresos prendas de lote vendidas (periodo):{" "}
              {lotRevenueSold.toFixed(2)}€
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Coste lotes: {lotsCostTotal.toFixed(2)}€ · Comisiones+envíos
              lotes (periodo): {(lotFeesSold + lotShippingSold).toFixed(2)}€
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">
              Margen sobre prendas vendidas
            </p>
            <p className="text-xl font-semibold">
              {marginSoldItems != null
                ? `${(marginSoldItems * 100).toFixed(1)}%`
                : "-"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              ROI calculado sobre el coste de las prendas vendidas en el
              periodo.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">
              Media de días para vender
            </p>
            <p className="text-xl font-semibold">
              {avgDaysToSell != null ? avgDaysToSell.toFixed(1) : "-"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Solo prendas vendidas con fecha de publicación y venta.
            </p>
          </div>
        </div>

        {/* FORM LOTE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-semibold">
              {editingLot ? "Editar lote" : "Añadir nuevo lote"}
            </h2>
            {editingLot && (
              <button
                type="button"
                onClick={resetLotForm}
                className="text-xs text-slate-300 underline"
              >
                Cancelar edición
              </button>
            )}
          </div>
          <form
            className="grid gap-3 md:grid-cols-4 md:items-end"
            onSubmit={handleSubmitLot}
          >
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">
                Nombre del lote
              </label>
              <input
                type="text"
                value={lotName}
                onChange={(e) => setLotName(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Ej: Lote jerseys invierno"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Fecha compra
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Nº prendas
              </label>
              <input
                type="number"
                min={1}
                value={itemsCount}
                onChange={(e) => setItemsCount(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Ej: 10"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Coste total (€)
              </label>
              <input
                type="text"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Ej: 50"
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-3 mt-2">
              <button
                type="submit"
                disabled={savingLot}
                className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingLot
                  ? "Guardando..."
                  : editingLot
                  ? "Guardar cambios"
                  : "Guardar lote"}
              </button>
              {formError && (
                <p className="text-xs text-red-400">{formError}</p>
              )}
            </div>
          </form>
        </div>

        {/* LISTA LOTES */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Lotes</h2>
          {loadingLots ? (
            <p>Cargando lotes...</p>
          ) : lots.length === 0 ? (
            <p>No tienes lotes todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-800">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 text-left">Lote</th>
                    <th className="px-3 py-2 text-left">Fecha compra</th>
                    <th className="px-3 py-2 text-right">Prendas</th>
                    <th className="px-3 py-2 text-right">Coste total</th>
                    <th className="px-3 py-2 text-right">Coste unit.</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => (
                    <tr key={lot.id} className="border-t border-slate-800">
                      <td className="px-3 py-2">{lot.name}</td>
                      <td className="px-3 py-2">
                        {lot.purchase_date ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {lot.items_count ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {lot.total_cost != null
                          ? `${lot.total_cost.toFixed(2)}€`
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {lot.unit_cost != null
                          ? `${lot.unit_cost.toFixed(2)}€`
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Editar lote */}
                          <button
                            type="button"
                            aria-label="Editar lote"
                            onClick={() => {
                              setEditingLot(lot);
                              setLotName(lot.name);
                              setPurchaseDate(lot.purchase_date ?? "");
                              setItemsCount(
                                lot.items_count != null
                                  ? String(lot.items_count)
                                  : ""
                              );
                              setTotalCost(
                                lot.total_cost != null
                                  ? String(lot.total_cost)
                                  : ""
                              );
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded border border-slate-700 hover:bg-slate-800 text-slate-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path d="M5 13.5V15h1.5l7.086-7.086-1.5-1.5L5 13.5z" />
                              <path d="M14.207 3.293a1 1 0 0 1 1.414 0l1.086 1.086a1 1 0 0 1 0 1.414l-1.086 1.086-2.5-2.5 1.086-1.086z" />
                            </svg>
                          </button>

                          {/* Eliminar lote */}
                          <button
                            type="button"
                            aria-label="Eliminar lote"
                            onClick={() => handleDeleteLot(lot.id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded border border-red-700 hover:bg-red-900/60 text-red-300"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path d="M6 7h2v9H6zM12 7h2v9h-2z" />
                              <path d="M4 5h12v2H4z" />
                              <path d="M8 3h4v2H8z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RESUMEN POR LOTE */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Resumen por lote (periodo filtrado)
          </h2>
          {lotsWithMetrics.every((m) => m.soldItems === 0) ? (
            <p className="text-sm text-slate-400">
              No hay prendas vendidas en el periodo seleccionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-800">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 text-left">Lote</th>
                    <th className="px-3 py-2 text-right">Coste lote</th>
                    <th className="px-3 py-2 text-right">Prendas lote</th>
                    <th className="px-3 py-2 text-right">
                      Vendidas periodo
                    </th>
                    <th className="px-3 py-2 text-right">
                      Ingresos periodo
                    </th>
                    <th className="px-3 py-2 text-right">
                      Beneficio (vs lote)
                    </th>
                    <th className="px-3 py-2 text-right">
                      ROI coste lote
                    </th>
                    <th className="px-3 py-2 text-right">
                      ROI prendas vendidas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lotsWithMetrics.map((entry) => (
                    <tr
                      key={entry.lot.id}
                      className="border-t border-slate-800"
                    >
                      <td className="px-3 py-2">{entry.lot.name}</td>
                      <td className="px-3 py-2 text-right">
                        {entry.lotTotalCost
                          ? `${entry.lotTotalCost.toFixed(2)}€`
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.totalItems}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.soldItems}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.revenue.toFixed(2)}€
                      </td>
                      <td
                        className={
                          "px-3 py-2 text-right " +
                          (entry.profitVsLot < 0 ? "text-red-400" : "")
                        }
                      >
                        {entry.profitVsLot.toFixed(2)}€
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.roiVsLotCost != null
                          ? `${(entry.roiVsLotCost * 100).toFixed(1)}%`
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.roiVsSoldCost != null
                          ? `${(entry.roiVsSoldCost * 100).toFixed(1)}%`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FORM PRENDA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-semibold">
              {editingItem ? "Editar prenda" : "Añadir nueva prenda"}
            </h2>
            {editingItem && (
              <button
                type="button"
                onClick={resetItemForm}
                className="text-xs text-slate-300 underline"
              >
                Cancelar edición
              </button>
            )}
          </div>
          <form
            className="grid gap-3 md:grid-cols-4 md:items-end"
            onSubmit={handleSubmitItem}
          >
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">
                Nombre de la prenda
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Ej: Jersey vintage azul"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Lote (opcional)
              </label>
              <select
                value={itemLotId}
                onChange={(e) => setItemLotId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
              >
                <option value="">Sin lote</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Talla
              </label>
              <input
                type="text"
                value={itemSize}
                onChange={(e) => setItemSize(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Ej: M / 38 / 40"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Fecha publicación
              </label>
              <input
                type="date"
                value={itemListingDate}
                onChange={(e) => setItemListingDate(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Fecha venta (si vendida)
              </label>
              <input
                type="date"
                value={itemSaleDate}
                onChange={(e) => setItemSaleDate(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={itemStatus}
                onChange={(e) =>
                  setItemStatus(e.target.value as ItemStatus)
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
              >
                <option value="for_sale">En venta</option>
                <option value="sold">Vendida</option>
                <option value="reserved">Reservada</option>
                <option value="returned">Devuelta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Coste compra (€)
              </label>
              <input
                type="text"
                value={itemPurchaseCost}
                onChange={(e) => setItemPurchaseCost(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Si vacío + lote ⇒ usa coste unit."
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Precio venta (€)
              </label>
              <input
                type="text"
                value={itemSalePrice}
                onChange={(e) => setItemSalePrice(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Ej: 25"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Comisión plataforma (€)
              </label>
              <input
                type="text"
                value={itemPlatformFee}
                onChange={(e) => setItemPlatformFee(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Ej: 2"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Coste envío asumido (€)
              </label>
              <input
                type="text"
                value={itemShippingCost}
                onChange={(e) => setItemShippingCost(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                placeholder="Ej: 4"
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-3 mt-2">
              <button
                type="submit"
                disabled={savingItem}
                className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingItem
                  ? "Guardando..."
                  : editingItem
                  ? "Guardar cambios"
                  : "Guardar prenda"}
              </button>
              {itemFormError && (
                <p className="text-xs text-red-400">{itemFormError}</p>
              )}
            </div>
          </form>
        </div>

        {/* LISTA PRENDAS */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold">Prendas</h2>
            <div className="flex gap-3">
              {/* Filtro por lote */}
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Filtrar por lote
                </label>
                <select
                  value={filterLotIdTable}
                  onChange={(e) => setFilterLotIdTable(e.target.value)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                >
                  <option value="all">Todos</option>
                  <option value="no_lot">Sin lote</option>
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Estado
                </label>
                <select
                  value={filterStatusTable}
                  onChange={(e) =>
                    setFilterStatusTable(
                      e.target.value as "all" | ItemStatus
                    )
                  }
                  className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                >
                  <option value="all">Todos</option>
                  <option value="for_sale">En venta</option>
                  <option value="sold">Vendida</option>
                  <option value="reserved">Reservada</option>
                  <option value="returned">Devuelta</option>
                </select>
              </div>
            </div>
          </div>

          {loadingItems ? (
            <p>Cargando prendas...</p>
          ) : itemsForTable.length === 0 ? (
            <p>No hay prendas que cumplan los filtros seleccionados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-800">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 text-left">Prenda</th>
                    <th className="px-3 py-2 text-left">Lote</th>
                    <th className="px-3 py-2 text-left">Talla</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">F. pub.</th>
                    <th className="px-3 py-2 text-left">F. venta</th>
                    <th className="px-3 py-2 text-right">Coste</th>
                    <th className="px-3 py-2 text-right">Venta</th>
                    <th className="px-3 py-2 text-right">Beneficio</th>
                    <th className="px-3 py-2 text-right">Días venta</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsForTable.map((item) => {
                    const lot = lots.find((l) => l.id === item.lot_id);
                    const profit = getItemProfit(item);
                    const daysToSell = getItemDaysToSell(item);

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-800"
                      >
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">
                          {lot ? lot.name : "-"}
                        </td>
                        <td className="px-3 py-2">{item.size ?? "-"}</td>
                        <td className="px-3 py-2">
                          {item.status === "for_sale" && "En venta"}
                          {item.status === "sold" && "Vendida"}
                          {item.status === "reserved" && "Reservada"}
                          {item.status === "returned" && "Devuelta"}
                        </td>
                        <td className="px-3 py-2">
                          {item.listing_date ?? "-"}
                        </td>
                        <td className="px-3 py-2">
                          {item.sale_date ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.purchase_cost != null
                            ? `${item.purchase_cost.toFixed(2)}€`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.sale_price != null
                            ? `${item.sale_price.toFixed(2)}€`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.sale_price != null
                            ? `${profit.toFixed(2)}€`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {daysToSell != null ? daysToSell : "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Editar prenda */}
                            <button
                              type="button"
                              aria-label="Editar prenda"
                              onClick={() => {
                                setEditingItem(item);
                                setItemLotId(item.lot_id ?? "");
                                setItemName(item.name);
                                setItemSize(item.size ?? "");
                                setItemListingDate(
                                  item.listing_date ?? ""
                                );
                                setItemSaleDate(item.sale_date ?? "");
                                setItemStatus(item.status);
                                setItemPurchaseCost(
                                  item.purchase_cost != null
                                    ? String(item.purchase_cost)
                                    : ""
                                );
                                setItemSalePrice(
                                  item.sale_price != null
                                    ? String(item.sale_price)
                                    : ""
                                );
                                setItemPlatformFee(
                                  item.platform_fee != null
                                    ? String(item.platform_fee)
                                    : ""
                                );
                                setItemShippingCost(
                                  item.shipping_cost != null
                                    ? String(item.shipping_cost)
                                    : ""
                                );
                              }}
                              className="inline-flex items-center justify-center w-7 h-7 rounded border border-slate-700 hover:bg-slate-800 text-slate-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path d="M5 13.5V15h1.5l7.086-7.086-1.5-1.5L5 13.5z" />
                                <path d="M14.207 3.293a1 1 0 0 1 1.414 0l1.086 1.086a1 1 0 0 1 0 1.414l-1.086 1.086-2.5-2.5 1.086-1.086z" />
                              </svg>
                            </button>

                            {/* Eliminar prenda */}
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded border border-red-700 hover:bg-red-900/60 text-red-300"
                              type="button"
                              aria-label="Eliminar prenda"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path d="M6 7h2v9H6zM12 7h2v9h-2z" />
                                <path d="M4 5h12v2H4z" />
                                <path d="M8 3h4v2H8z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
