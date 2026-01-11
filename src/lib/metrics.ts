// Interfaces alineadas EXACTAMENTE con tus CSV
interface Lot {
  id: string;
  total_cost: number;   // CSV: total_cost
  items_count: number;  // CSV: items_count
  purchase_date: string; // CSV: purchase_date
}

interface Item {
  id: string;
  lot_id: string | null; // CSV: lot_id
  status: 'for_sale' | 'reserved' | 'sold' | 'returned';
  purchase_cost: number | null; // CSV: purchase_cost
  sale_price: number | null;    // CSV: sale_price
  platform_fee: number | null;  // CSV: platform_fee
  shipping_cost: number | null; // CSV: shipping_cost
  sale_date: string | null;     // CSV: sale_date
  listing_date: string | null;  // CSV: listing_date
}

// ---------------------------------------------------------
// 1. CÁLCULO DE COSTE UNITARIO (Núcleo del sistema)
// ---------------------------------------------------------
export function calculateItemCost(item: Item, lotMap: Map<string, Lot>): { cost: number; isEstimated: boolean } {
  // CASO A: Coste explícito en el item (Sobrescribe lote)
  if (item.purchase_cost !== null && item.purchase_cost > 0) {
    return { cost: Number(item.purchase_cost), isEstimated: false };
  }

  // CASO B: Pertenece a un lote (Prorrateo)
  if (item.lot_id && lotMap.has(item.lot_id)) {
    const lot = lotMap.get(item.lot_id)!;
    if (lot.items_count > 0) {
      return { 
        cost: Number(lot.total_cost) / Number(lot.items_count), 
        isEstimated: true 
      };
    }
    // Error: Lote existe pero count es 0 (División por cero)
    return { cost: 0, isEstimated: true }; 
  }

  // CASO C: Sin datos (Item suelto sin coste o lote huerfano)
  return { cost: 0, isEstimated: false };
}

// ---------------------------------------------------------
// 2. CÁLCULO DE BENEFICIO UNITARIO
// ---------------------------------------------------------
export function calculateItemProfit(item: Item, cost: number): number | null {
  if (item.status !== 'sold') return null;

  // Tratamos nulos como 0 para la resta, pero el resultado puede ser negativo
  const revenue = Number(item.sale_price) || 0;
  const fees = Number(item.platform_fee) || 0;
  const shipping = Number(item.shipping_cost) || 0;

  return revenue - fees - shipping - cost;
}

// ---------------------------------------------------------
// 3. GENERACIÓN DE DASHBOARD (KPIs)
// ---------------------------------------------------------
export function generateDashboardMetrics(items: Item[], lots: Lot[]) {
  // Indexar lotes para búsqueda rápida O(1)
  const lotMap = new Map(lots.map(l => [l.id, l]));
  
  let totalRevenue = 0;
  let totalProfit = 0;
  let soldCount = 0;
  let inventoryValue = 0;
  
  // A. Calcular Gastos Totales (Cashflow Out)
  const totalLotCost = lots.reduce((acc, l) => acc + Number(l.total_cost || 0), 0);
  const totalLooseItemCost = items
    .filter(i => !i.lot_id && i.purchase_cost)
    .reduce((acc, i) => acc + Number(i.purchase_cost || 0), 0);
    
  const totalInvested = totalLotCost + totalLooseItemCost;

  // B. Iterar Items
  items.forEach(item => {
    const { cost } = calculateItemCost(item, lotMap);
    
    // Si está vendido -> Sumar a Ventas y Beneficios
    if (item.status === 'sold') {
      const profit = calculateItemProfit(item, cost);
      
      // Solo sumamos si profit no es null (doble check de seguridad)
      if (profit !== null) {
        totalRevenue += Number(item.sale_price || 0);
        totalProfit += profit;
        soldCount++;
      }
    } 
    // Si está en venta/reservado -> Sumar a Valor Inventario
    else if (item.status === 'for_sale' || item.status === 'reserved') {
      inventoryValue += cost;
    }
  });

  return {
    kpis: {
      total_items: items.length,
      sold_items: soldCount,
      active_items: items.filter(i => i.status === 'for_sale' || i.status === 'reserved').length,
      gross_revenue: totalRevenue,
      net_profit: totalProfit,
      total_invested: totalInvested,
      inventory_value: inventoryValue,
      roi_global: totalInvested > 0 ? ((totalRevenue - totalInvested) / totalInvested) * 100 : 0
    }
  };
}

// ---------------------------------------------------------
// 4. SERIES TEMPORALES (Gráficas)
// ---------------------------------------------------------
export function generateTimeSeries(items: Item[], lots: Lot[]) {
  // Mapas para agrupar por mes "YYYY-MM"
  const salesByMonth = new Map<string, number>();
  const purchasesByMonth = new Map<string, number>();

  // 1. Agrupar Ventas (Beneficio) usando sale_date
  items.forEach(item => {
    if (item.status === 'sold' && item.sale_date) {
      const month = item.sale_date.substring(0, 7); // "2025-12"
      // Recalcular coste para obtener beneficio neto en la gráfica
      // Nota: Si performance es crítico, pasar estos datos pre-calculados
      // ... (Lógica simplificada para ejemplo)
      const current = salesByMonth.get(month) || 0;
      // Aquí podrías sumar Revenue o Profit según lo que quieras graficar. 
      // El prompt pide "beneficio por mes".
      // ...
    }
  });

  // 2. Agrupar Compras usando purchase_date (Lotes)
  lots.forEach(lot => {
    if (lot.purchase_date) {
      const month = lot.purchase_date.substring(0, 7);
      const current = purchasesByMonth.get(month) || 0;
      purchasesByMonth.set(month, current + Number(lot.total_cost));
    }
  });

  // Devuelve array ordenado para Recharts
  // ...
}