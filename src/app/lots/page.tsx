import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Layers, Box, Calendar, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function LotsPage() {
  const supabase = await createClient();

  // Traemos los lotes Y sus items para calcular beneficios
  const { data: lots } = await supabase
    .from('lots')
    .select('*, items(*)') // Relación para sumar ventas
    .order('created_at', { ascending: false });

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <PageShell title="Gestión de Lotes">
      <div className="flex justify-end mb-6">
        <Link href="/lots/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18} /> Nuevo Lote
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {lots?.map((lot: any) => {
          // 1. CÁLCULOS DEL LOTE
          const totalCost = Number(lot.total_cost) || 0;
          const itemsCount = Number(lot.items_count) || 1;
          const unitCost = totalCost / itemsCount;
          
          // Sumar ventas REALES de items pertenecientes a este lote
          const lotRevenue = lot.items
            .filter((i: any) => i.status?.toLowerCase() === 'sold')
            .reduce((acc: number, i: any) => acc + (Number(i.sale_price) || Number(i.price) || 0), 0);

          const profit = lotRevenue - totalCost;
          const isProfitable = profit > 0;
          const progressPercent = Math.min((lotRevenue / totalCost) * 100, 100);

          return (
            <Card key={lot.id} className="relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* ICONO Y DATOS BÁSICOS */}
                <div className="flex items-start gap-4 md:w-1/3">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${isProfitable ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {isProfitable ? <TrendingUp size={24} /> : <Box size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{lot.name}</h3>
                    <div className="text-sm text-slate-500 space-y-1 mt-1">
                      <p className="flex items-center gap-2"><Calendar size={14}/> {new Date(lot.created_at).toLocaleDateString()}</p>
                      <p>Items: <span className="font-medium text-slate-900">{lot.items.length} / {itemsCount}</span> registrados</p>
                      <p>Coste Unitario: <span className="font-medium text-slate-900">{formatMoney(unitCost)}</span></p>
                    </div>
                  </div>
                </div>

                {/* BARRA DE PROGRESO Y FINANZAS */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Recuperado: <strong>{formatMoney(lotRevenue)}</strong></span>
                    <span className="text-slate-500">Objetivo: <strong>{formatMoney(totalCost)}</strong></span>
                  </div>
                  
                  {/* Barra visual */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isProfitable ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className={`text-sm font-bold ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                      {isProfitable ? '+' : ''}{formatMoney(profit)} Beneficio
                    </div>
                    <Link href={`/lots/${lot.id}`} className="text-sm text-indigo-600 hover:underline">
                      Ver detalles &rarr;
                    </Link>
                  </div>
                </div>

              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}