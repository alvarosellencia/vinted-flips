import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { SummaryView } from '@/components/dashboard/SummaryView';

export const revalidate = 0; 

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Cargar TODO: Items y Lotes en paralelo
  const [itemsRes, lotsRes] = await Promise.all([
    supabase.from('items').select('*').order('created_at', { ascending: false }),
    supabase.from('lots').select('*').order('created_at', { ascending: false })
  ]);

  const items = itemsRes.data || [];
  const lots = lotsRes.data || [];

  // 2. CÁLCULO DE FINANZAS (Lógica de Negocio Real)
  
  // A. INGRESOS (Solo lo que realmente se ha vendido)
  // Asumimos que la columna de precio de venta es 'sale_price' o 'price' (usamos sale_price según CSV)
  const soldItems = items.filter(i => i.status === 'sold');
  // Nota: Tu CSV tiene 'sale_price', pero a veces en código usamos 'price'. 
  // Aquí intentamos leer sale_price, y si no existe, price.
  const totalRevenue = soldItems.reduce((acc, item) => acc + (Number(item.sale_price) || Number(item.price) || 0), 0);

  // B. GASTOS (Coste Lotes + Coste Items Sueltos)
  // Corrección: Usamos 'total_cost' para lotes según tu CSV
  const totalLotCost = lots.reduce((acc, lot) => acc + (Number(lot.total_cost) || 0), 0); 
  
  // Items sueltos son los que NO tienen lot_id
  // Corrección CRÍTICA: Usamos 'purchase_cost' según tu CSV
  const looseItems = items.filter(i => !i.lot_id); 
  const totalLooseItemCost = looseItems.reduce((acc, item) => acc + (Number(item.purchase_cost) || 0), 0);

  const totalInvestment = totalLotCost + totalLooseItemCost;
  const netProfit = totalRevenue - totalInvestment;

  // C. PREPARAR DATOS PARA GRÁFICA (Últimos 7 días)
  const chartDataMap = new Map();
  
  // Inicializar los últimos 7 días con 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    chartDataMap.set(dateStr, 0);
  }

  // Rellenar con ventas reales
  soldItems.forEach(item => {
    // Usamos sale_date si existe, si no created_at
    const dateRef = item.sale_date || item.created_at;
    const date = new Date(dateRef).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    
    if (chartDataMap.has(date)) {
      const amount = Number(item.sale_price) || Number(item.price) || 0;
      chartDataMap.set(date, chartDataMap.get(date) + amount);
    }
  });

  // Convertimos a array para Recharts
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