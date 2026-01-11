import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { SummaryView } from '@/components/dashboard/SummaryView';

export const revalidate = 0; 

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Cargar TODO: Items y Lotes
  const [itemsRes, lotsRes] = await Promise.all([
    supabase.from('items').select('*').order('created_at', { ascending: false }),
    supabase.from('lots').select('*').order('created_at', { ascending: false })
  ]);

  const items = itemsRes.data || [];
  const lots = lotsRes.data || [];

  // 2. FILTRADO INTELIGENTE (La corrección clave está aquí 👇)
  // Convertimos a minúsculas antes de comparar para aceptar 'Sold', 'sold', 'SOLD'
  const soldItems = items.filter(i => i.status?.toLowerCase() === 'sold');
  
  // 3. CÁLCULO DE INGRESOS
  const totalRevenue = soldItems.reduce((acc, item) => {
    // Leemos sale_price, si falla leemos price
    const val = Number(item.sale_price) || Number(item.price) || 0;
    return acc + val;
  }, 0);

  // 4. CÁLCULO DE GASTOS (INVERSIÓN)
  const totalLotCost = lots.reduce((acc, lot) => {
    const val = Number(lot.total_cost) || Number(lot.cost) || 0;
    return acc + val;
  }, 0);
  
  const looseItems = items.filter(i => !i.lot_id); 
  const totalLooseItemCost = looseItems.reduce((acc, item) => {
    // Leemos purchase_cost (prioridad), si falla probamos otros
    const val = Number(item.purchase_cost) || Number(item.purchase_price) || Number(item.cost) || 0;
    return acc + val;
  }, 0);

  const totalInvestment = totalLotCost + totalLooseItemCost;
  const netProfit = totalRevenue - totalInvestment;

  // 5. GRÁFICA DE VENTAS
  const chartDataMap = new Map();
  // Inicializar últimos 7 días
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    chartDataMap.set(dateStr, 0);
  }

  soldItems.forEach(item => {
    // Usamos sale_date si existe, si no created_at
    const dateRef = item.sale_date || item.created_at;
    const date = new Date(dateRef).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    
    if (chartDataMap.has(date)) {
      const amount = Number(item.sale_price) || Number(item.price) || 0;
      chartDataMap.set(date, chartDataMap.get(date) + amount);
    }
  });

  const chartData = Array.from(chartDataMap, ([date, amount]) => ({ date, amount }));

  // Contar items activos (for_sale o reserved)
  const activeCount = items.filter(i => {
    const s = i.status?.toLowerCase();
    return s === 'for_sale' || s === 'reserved';
  }).length;

  const dashboardData = {
    revenue: totalRevenue,
    investment: totalInvestment,
    profit: netProfit,
    activeCount: activeCount,
    recentSales: soldItems.slice(0, 5),
    chartData: chartData
  };

  return (
    <PageShell title="Panel de Control">
      <SummaryView data={dashboardData} />
    </PageShell>
  );
}