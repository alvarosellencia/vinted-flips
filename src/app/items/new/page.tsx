import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createItem } from '@/lib/actions';

export default async function NewItemPage() {
  const supabase = await createClient();

  // 1. Obtener lotes para el desplegable
  const { data: lots } = await supabase
    .from('lots')
    .select('id, name')
    .order('created_at', { ascending: false });

  return (
    <PageShell title="Añadir Nuevo Item">
      <Card className="max-w-xl mx-auto">
        <form action={createItem} className="space-y-6">
          
          {/* TÍTULO */}
          <Input 
            name="title" 
            label="Título / Descripción" 
            placeholder="Ej: Camisa Ralph Lauren Azul L" 
            required 
          />

          {/* ESTADO Y LOTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Estado</label>
              <select 
                name="status" 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="for_sale">En Venta</option>
                <option value="sold">Vendido</option>
                <option value="reserved">Reservado</option>
                <option value="returned">Devuelto</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Pertenece a un Lote</label>
              <select 
                name="lot_id" 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">-- Ninguno (Item Suelto) --</option>
                {lots?.map((lot: any) => (
                  <option key={lot.id} value={lot.id}>
                    📦 {lot.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PRECIOS */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <Input 
                name="purchase_cost" 
                label="Coste de Compra (€)" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
              />
              <p className="text-[10px] text-slate-400 mt-1">
                * Si eliges un lote arriba, este coste se ignorará y se usará el del lote.
              </p>
            </div>

            <Input 
              name="sale_price" 
              label="Precio de Venta (€)" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <a href="/items" className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
              Cancelar
            </a>
            <button 
              type="submit" 
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm"
            >
              Guardar Item
            </button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}