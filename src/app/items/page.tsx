import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Package, Tag, Euro, Calendar, TrendingDown } from 'lucide-react';

export default async function ItemsPage() {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error cargando items:', error);
    return <div>Error al cargar datos. Revisa la consola.</div>;
  }

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <PageShell title="Inventario de Items">
      {(!items || items.length === 0) ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-slate-100 p-4 rounded-full">
            <Package size={48} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No hay items todavía</h3>
          <p className="text-slate-500 max-w-sm">
            Añade tus primeras prendas en Supabase.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  item.status?.toLowerCase() === 'sold' ? 'bg-green-100 text-green-700' : 
                  item.status?.toLowerCase() === 'reserved' ? 'bg-orange-100 text-orange-700' : 
                  'bg-blue-50 text-blue-700'
                }`}>
                  {item.status || 'En venta'}
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-semibold text-slate-800 mb-4 line-clamp-1 group-hover:text-indigo-600">
                {item.title || item.name || 'Sin título'}
              </h3>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                {/* Coste de Compra */}
                <div className="flex items-center gap-1 text-slate-400 text-xs" title="Coste de compra">
                  <TrendingDown size={12} />
                  <span>{formatMoney(item.purchase_cost || 0)}</span>
                </div>

                {/* Precio de Venta */}
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Euro size={14} className="text-slate-400" />
                  {/* AQUÍ ESTABA EL ERROR: Usamos sale_price o price */}
                  {formatMoney(item.sale_price || item.price || 0)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}