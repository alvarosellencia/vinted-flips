import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { SummaryView } from '@/components/dashboard/SummaryView';

export const revalidate = 0; 

export default async function HomePage() {
  const supabase = await createClient();

  const [itemsRes, lotsRes] = await Promise.all([
    supabase.from('items').select('*').order('created_at', { ascending: false }),
    supabase.from('lots').select('*').order('created_at', { ascending: false })
  ]);

  const items = itemsRes.data || [];
  const lots = lotsRes.data || [];

  // LÓGICA DE NEGOCIO CORREGIDA (purchase_cost)
  const soldItems = items.filter(i => i.status === 'sold');
  
  // Ingresos: leemos sale_price (si es nulo, price)
  const totalRevenue = soldItems.reduce((acc, item) => acc + (Number(item.sale_price) || Number(item.price) || 0), 0);

  // Gastos: total_cost de lotes + purchase_cost de items sueltos
  const totalLotCost = lots.reduce((acc, lot) => acc + (Number(lot.total_cost) || 0), 0); 
  
  const looseItems = items.filter(i => !i.lot_id); 
  // AQUÍ ESTÁ LA CORRECCIÓN CLAVE: .purchase_cost
  const totalLooseItemCost = looseItems.reduce((acc, item) => acc + (Number(item.purchase_cost) || 0), 0);

  const totalInvestment = totalLotCost + totalLooseItemCost;
  const netProfit = totalRevenue - totalInvestment;

  // Gráfica
  const chartDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    chartDataMap.set(dateStr, 0);
  }

  soldItems.forEach(item => {
    const dateRef = item.sale_date || item.created_at;
    const date = new Date(dateRef).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    if (chartDataMap.has(date)) {
      const amount = Number(item.sale_price) || Number(item.price) || 0;
      chartDataMap.set(date, chartDataMap.get(date) + amount);
    }
  });

  const chartData = Array.from(chartDataMap, ([date, amount]) => ({ date, amount }));

  const dashboardData = {
    revenue: totalRevenue,
    investment: totalInvestment,
    profit: netProfit,
    activeCount: items.filter(i => i.status === 'for_sale' || i.status === 'reserved').length,
    recentSales: soldItems.slice(0, 5),
    chartData: chartData
  };

  return (
    <PageShell title="Panel de Control">
      <SummaryView data={dashboardData} />
    </PageShell>
  );
}