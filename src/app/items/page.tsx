import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Package, Tag, Euro, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { updateItemStatus } from '@/lib/actions'; // Importamos la action (aunque aquí usaremos form server components)

export default async function ItemsPage() {
  const supabase = await createClient();

  // Traemos item + datos del lote para saber el coste unitario
  const { data: items } = await supabase
    .from('items')
    .select('*, lot:lots(id, name, total_cost, items_count)')
    .order('created_at', { ascending: false });

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <PageShell title="Inventario de Items">
      <div className="flex justify-end mb-6">
        <Link href="/items/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18} /> Nuevo Item
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item: any) => {
          // LÓGICA DE COSTE
          let cost = 0;
          let isFromLot = false;

          if (item.lot) {
            isFromLot = true;
            const lotCost = Number(item.lot.total_cost) || 0;
            const lotCount = Number(item.lot.items_count) || 1;
            cost = lotCost / lotCount;
          } else {
            cost = Number(item.purchase_cost) || 0;
          }

          const salePrice = Number(item.sale_price) || Number(item.price) || 0;
          const status = item.status?.toLowerCase() || 'for_sale';
          
          // Solo calculamos beneficio si está vendido o reservado (con precio pactado)
          const profit = salePrice - cost;
          const showProfit = status === 'sold';

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow group relative">
              {/* Badge de Lote */}
              {isFromLot && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 rounded-full">
                  📦 {item.lot.name}
                </div>
              )}

              <div className="flex justify-between items-start mb-2 pr-12">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  status === 'sold' ? 'bg-green-100 text-green-700' : 
                  status === 'reserved' ? 'bg-purple-100 text-purple-700' : 
                  status === 'returned' ? 'bg-red-100 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {status === 'for_sale' ? 'En Venta' : status}
                </span>
              </div>
              
              <Link href={`/items/${item.id}`} className="block">
                <h3 className="font-semibold text-slate-800 mb-1 truncate">{item.title || item.name}</h3>
                <div className="text-xs text-slate-400 mb-4 flex gap-2">
                  <span>Coste: {formatMoney(cost)}</span>
                  {isFromLot && <span>(Unitario Lote)</span>}
                </div>
              </Link>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                {/* PRECIO VENTA / BENEFICIO */}
                <div className="flex flex-col">
                    {showProfit ? (
                        <>
                            <span className="text-xs text-slate-400">Vendido por</span>
                            <span className="font-bold text-slate-900">{formatMoney(salePrice)}</span>
                            <span className={`text-xs font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {profit >= 0 ? '+' : ''}{formatMoney(profit)}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-xs text-slate-400">Precio</span>
                            <span className="font-bold text-slate-900">{formatMoney(salePrice)}</span>
                        </>
                    )}
                </div>

                {/* ACCIONES RÁPIDAS (Esto requiere interactividad cliente, por ahora ponemos link) */}
                <Link href={`/items/${item.id}`} className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-slate-600">
                    <Edit2 size={16} />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}

// Necesitamos importar iconos extras que usé
import { Plus, Edit2 } from 'lucide-react';