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

  // --- LÓGICA DE NEGOCIO ROBUSTA ---
  const soldItems = items.filter(i => i.status === 'sold');
  
  // 1. INGRESOS: Intentamos leer 'sale_price', si falla probamos 'price'
  const totalRevenue = soldItems.reduce((acc, item) => {
    const val = Number(item.sale_price) || Number(item.price) || 0;
    return acc + val;
  }, 0);

  // 2. GASTOS LOTES: Intentamos 'total_cost', si falla probamos 'cost'
  const totalLotCost = lots.reduce((acc, lot) => {
    const val = Number(lot.total_cost) || Number(lot.cost) || 0;
    return acc + val;
  }, 0);
  
  // 3. GASTOS ITEMS SUELTOS: Intentamos 'purchase_cost', 'purchase_price', o 'cost'
  const looseItems = items.filter(i => !i.lot_id); 
  const totalLooseItemCost = looseItems.reduce((acc, item) => {
    const val = Number(item.purchase_cost) || Number(item.purchase_price) || Number(item.cost) || 0;
    return acc + val;
  }, 0);

  const totalInvestment = totalLotCost + totalLooseItemCost;
  const netProfit = totalRevenue - totalInvestment;

  // --- PREPARACIÓN GRÁFICA ---
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

  // --- DEBUG: Datos para el inspector ---
  const debugItem = soldItems[0] || items[0];
  const debugLot = lots[0];

  return (
    <PageShell title="Panel de Control">
      <SummaryView data={dashboardData} />

      {/* 👇 ZONA DE DIAGNÓSTICO (Solo visible temporalmente) 👇 */}
      <div className="mt-12 p-6 bg-slate-900 text-green-400 rounded-xl font-mono text-xs overflow-hidden shadow-2xl border border-slate-700">
        <h3 className="text-lg font-bold mb-4 text-white border-b border-slate-700 pb-2 flex items-center gap-2">
          🕵️‍♂️ MODO INSPECTOR DE DATOS
        </h3>
        <p className="mb-4 text-slate-400">
          Si arriba ves 0€, mira aquí abajo. Así es como recibimos los datos de Supabase.
          <br/>Busca si las columnas tienen valores o dicen <code>null</code>.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* INSPECCIÓN DE ITEMS */}
          <div>
            <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Ejemplo de Item</h4>
            <div className="bg-black p-4 rounded border border-slate-800 overflow-x-auto">
               <p className="mb-2 text-slate-500">// Buscamos: 'purchase_cost' y 'sale_price'</p>
               <pre>{JSON.stringify(debugItem, null, 2) || "⚠️ No se han encontrado Items"}</pre>
            </div>
          </div>
          
          {/* INSPECCIÓN DE LOTES */}
          <div>
            <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Ejemplo de Lote</h4>
             <div className="bg-black p-4 rounded border border-slate-800 overflow-x-auto">
               <p className="mb-2 text-slate-500">// Buscamos: 'total_cost'</p>
               <pre>{JSON.stringify(debugLot, null, 2) || "⚠️ No se han encontrado Lotes"}</pre>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}