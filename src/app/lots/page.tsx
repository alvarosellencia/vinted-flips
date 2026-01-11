import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Layers, Box, Calendar } from 'lucide-react';

export default async function LotsPage() {
  const supabase = await createClient();

  const { data: lots, error } = await supabase
    .from('lots')
    .select('*')
    .order('created_at', { ascending: false });

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <PageShell title="Gestión de Lotes">
      {(!lots || lots.length === 0) ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-slate-100 p-4 rounded-full">
            <Layers size={48} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No tienes lotes registrados</h3>
          <p className="text-slate-500">
            Los lotes agrupan varios items para controlar costes de compra masiva.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {lots.map((lot: any) => (
            <Card key={lot.id} className="hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                  <Box size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">
                    {lot.name || lot.description || 'Lote sin nombre'}
                  </h4>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(lot.date || lot.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    {/* AQUÍ ESTABA EL ERROR: Usamos total_cost */}
                    <span className="font-medium text-slate-700">Coste: {formatMoney(lot.total_cost || 0)}</span>
                  </div>
                </div>
                <div className="text-right">
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    Activo
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}