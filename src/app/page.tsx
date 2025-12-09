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

  // Items
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);

  // Formulario de lote
  const [lotName, setLotName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [itemsCount, setItemsCount] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [savingLot, setSavingLot] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Formulario de prenda (item)
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

  // Filtros de fecha (por fecha de venta)
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Helpers para métricas de cada prenda
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
    if (!filterFrom && !filterTo) return true; // sin filtros, todo entra
    if (!saleDate) return false;

    const sale = new Date(saleDate);
    if (filterFrom) {
      const from = new Date(filterFrom);
      if (sale < from) return false;
    }
    if (filterTo) {
      const to = new Date(filterTo);
      // incluir el día completo "hasta"
      to.setHours(23, 59, 59, 999);
      if (sale > to) return false;
    }
    return true;
  };

  // --- Funciones de carga de datos ---

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

  // --- Auth: sesión y cambios de sesión ---

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

  // Cuando hay sesión, cargamos lotes e items
  useEffect(() => {
    if (!session) return;
    fetchLots();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // --- Crear lote ---

  const handleCreateLot = async (e: FormEvent) => {
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
      setFormError("El número de prendas debe ser un número mayor que 0.");
      return;
    }
    if (isNaN(totalCostNumber) || totalCostNumber <= 0) {
      setFormError("El coste total debe ser un número mayor que 0.");
      return;
    }

    const unitCost = totalCostNumber / itemsCountNumber;

    try {
      setSavingLot(true);

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

      // Limpiar formulario
      setLotName("");
      setPurchaseDate("");
      setItemsCount("");
      setTotalCost("");

      // Recargar lotes
      await fetchLots();
    } finally {
      setSavingLot(false);
    }
  };

  // --- Crear prenda (item) ---

  const handleCreateItem = async (e: FormEvent) => {
    e.preventDefault();
    setItemFormError(null);

    if (!itemName.trim()) {
      setItemFormError("El nombre de la prenda es obligatorio.");
      return;
    }

    // Coste de compra: o lo indica el usuario o se usa el coste unitario del lote
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

      // Limpiar formulario
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

      // Recargar items
      await fetchItems();
    } finally {
      setSavingItem(false);
    }
  };

  // --- BORRAR LOTE (y sus prendas asociadas de prueba) ---

  const handleDeleteLot = async (lotId: string) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres borrar este lote y todas sus prendas asociadas? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    // Primero borramos las prendas del lote (por seguridad)
    const { error: itemsError } = await supabase
      .from("items")
      .delete()
      .eq("lot_id", lotId);

    if (itemsError) {
      console.error("Error borrando prendas del lote:", itemsError);
      alert("Ha ocurrido un error al borrar las prendas del lote.");
      return;
    }

    // Luego borramos el lote
    const { error: lotError } = await supabase
      .from("lots")
      .delete()
      .eq("id", lotId);

    if (lotError) {
      console.error("Error borrando lote:", lotError);
      alert("Ha ocurrido un error al borrar el lote.");
      return;
    }

    // Recargar datos en memoria
    await fetchLots();
    await fetchItems();
  };

  // --- BORRAR PRENDA INDIVIDUAL ---

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

    await fetchItems();
  };

  // --- MÉTRICAS AGREGADAS (con filtros) ---

  // Solo prendas vendidas
  const soldItemsAll = items.filter((item) => item.status === "sold");

  // Aplicar filtro por fecha de venta
  const soldItems = soldItemsAll.filter((item) =>
    isInDateFilter(item.sale_date)
  );

  const totalLotsCost = lots.reduce(
    (sum, lot) => sum + (lot.total_cost ?? 0),
    0
  );

  const totalSoldCost = soldItems.reduce(
    (sum, item) => sum + (item.purchase_cost ?? 0),
    0
  );

  const totalSoldRevenue = soldItems.reduce(
    (sum, item) => sum + (item.sale_price ?? 0),
    0
  );

  const totalSoldPlatformFees = soldItems.reduce(
    (sum, item) => sum + (item.platform_fee ?? 0),
    0
  );

  const totalSoldShipping = soldItems.reduce(
    (sum, item) => sum + (item.shipping_cost ?? 0),
    0
  );

  const totalProfit = soldItems.reduce(
    (sum, item) => sum + getItemProfit(item),
    0
  );

  const soldDays = soldItems
    .map((item) => getItemDaysToSell(item))
    .filter((d): d is number => d != null);

  const avgDaysToSell =
    soldDays.length > 0
      ? soldDays.reduce((sum, d) => sum + d, 0) / soldDays.length
      : null;

  const roiVsSoldCost =
    totalSoldCost > 0 ? totalProfit / totalSoldCost : null;

  const roiVsLotsCost =
    totalLotsCost > 0 ? totalProfit / totalLotsCost : null;

  // Resumen por lote usando los soldItems filtrados
  const lotsWithMetrics = lots.map((lot) => {
    const lotItems = items.filter((item) => item.lot_id === lot.id);
    const lotSoldItems = soldItems.filter((item) => item.lot_id === lot.id);

    const lotSoldRevenue = lotSoldItems.reduce(
      (sum, item) => sum + (item.sale_price ?? 0),
      0
    );
    const lotSoldCost = lotSoldItems.reduce(
      (sum, item) => sum + (item.purchase_cost ?? 0),
      0
    );
    const lotProfit = lotSoldItems.reduce(
      (sum, item) => sum + getItemProfit(item),
      0
    );
    const lotRoi = lotSoldCost > 0 ? lotProfit / lotSoldCost : null;

    return {
      lot,
      totalItems: lotItems.length,
      soldItems: lotSoldItems.length,
      revenue: lotSoldRevenue,
      cost: lotSoldCost,
      profit: lotProfit,
      roi: lotRoi,
    };
  });

  // --- Render ---

  // Si no hay sesión, mostramos login
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

  // Si hay sesión, mostramos todo
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
        {/* FILTROS DE FECHA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold mb-1">Filtros de periodo</p>
            <p className="text-[11px] text-slate-400">
              Aplican a las métricas y al resumen por lote (según fecha de
              venta). Si dejas los campos vacíos se usa todo el histórico.
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

        {/* MÉTRICAS GLOBALES */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Beneficio total</p>
            <p className="text-xl font-semibold">
              {totalProfit.toFixed(2)}€
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Ingresos menos gastos de prendas vendidas en el periodo
              seleccionado.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              ROI sobre coste total lotes:{" "}
              {roiVsLotsCost != null
                ? `${(roiVsLotsCost * 100).toFixed(1)}%`
                : "-"}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Ingresos por ventas</p>
            <p className="text-xl font-semibold">
              {totalSoldRevenue.toFixed(2)}€
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Comisiones + envíos:{" "}
              {(totalSoldPlatformFees + totalSoldShipping).toFixed(2)}€
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">
              ROI coste prendas vendidas
            </p>
            <p className="text-xl font-semibold">
              {roiVsSoldCost != null
                ? `${(roiVsSoldCost * 100).toFixed(1)}%`
                : "-"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Beneficio / coste de prendas vendidas en el periodo.
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

        {/* FORMULARIO LOTE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Añadir nuevo lote</h2>
          <form
            className="grid gap-3 md:grid-cols-4 md:items-end"
            onSubmit={handleCreateLot}
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
                {savingLot ? "Guardando..." : "Guardar lote"}
              </button>
              {formError && (
                <p className="text-xs text-red-400">{formError}</p>
              )}
            </div>
          </form>
        </div>

        {/* LISTADO DE LOTES */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Lotes</h2>
          {loadingLots ? (
            <p>Cargando lotes...</p>
          ) : lots.length === 0 ? (
            <p>
              Todavía no tienes lotes. Añade el primero con el formulario
              superior.
            </p>
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
                        <button
                          onClick={() => handleDeleteLot(lot.id)}
                          className="text-xs text-red-300 underline"
                        >
                          Eliminar
                        </button>
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
              No hay prendas vendidas en el periodo seleccionado. Ajusta
              las fechas o registra ventas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-800">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 text-left">Lote</th>
                    <th className="px-3 py-2 text-right">
                      Prendas lote
                    </th>
                    <th className="px-3 py-2 text-right">
                      Vendidas periodo
                    </th>
                    <th className="px-3 py-2 text-right">
                      Ingresos periodo
                    </th>
                    <th className="px-3 py-2 text-right">
                      Beneficio periodo
                    </th>
                    <th className="px-3 py-2 text-right">
                      ROI periodo (prendas vendidas)
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
                        {entry.totalItems}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.soldItems}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.revenue.toFixed(2)}€
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.profit.toFixed(2)}€
                      </td>
                      <td className="px-3 py-2 text-right">
                        {entry.roi != null
                          ? `${(entry.roi * 100).toFixed(1)}%`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FORMULARIO PRENDA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Añadir nueva prenda</h2>
          <form
            className="grid gap-3 md:grid-cols-4 md:items-end"
            onSubmit={handleCreateItem}
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
                {savingItem ? "Guardando..." : "Guardar prenda"}
              </button>
              {itemFormError && (
                <p className="text-xs text-red-400">{itemFormError}</p>
              )}
            </div>
          </form>
        </div>

        {/* LISTADO DE PRENDAS */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Prendas</h2>
          {loadingItems ? (
            <p>Cargando prendas...</p>
          ) : items.length === 0 ? (
            <p>
              Todavía no has registrado prendas. Añade la primera con el
              formulario anterior.
            </p>
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
                  {items.map((item) => {
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
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-xs text-red-300 underline"
                          >
                            Eliminar
                          </button>
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
