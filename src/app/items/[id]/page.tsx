import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { redirect } from 'next/navigation';

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Obtener datos del item
  const { data: item } = await supabase.from('items').select('*').eq('id', id).single();

  if (!item) return <div>Item no encontrado</div>;

  // 2. Server Action para guardar cambios
  async function updateItem(formData: FormData) {
    'use server';
    const supabase = await createClient();
    
    const title = formData.get('title') as string;
    const price = Number(formData.get('price'));
    const purchase_price = Number(formData.get('purchase_price'));
    const status = formData.get('status') as string;

    await supabase.from('items').update({ 
      title, 
      price,
      purchase_price, // Asegúrate de que esta columna existe en tu DB
      status
    }).eq('id', id);

    redirect('/');
  }

  return (
    <PageShell title={`Editar: ${item.title}`}>
      <Card className="max-w-xl mx-auto">
        <form action={updateItem} className="space-y-4">
          <Input 
            name="title" 
            label="Título" 
            defaultValue={item.title} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="purchase_price" 
              label="Coste (Compra)" 
              type="number" 
              step="0.01" 
              defaultValue={item.purchase_price || 0} 
            />
            <Input 
              name="price" 
              label="Precio (Venta)" 
              type="number" 
              step="0.01" 
              defaultValue={item.price} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Estado</label>
            <select 
              name="status" 
              defaultValue={item.status}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="for_sale">En Venta</option>
              <option value="sold">Vendido</option>
              <option value="reserved">Reservado</option>
              <option value="returned">Devuelto</option>
            </select>
          </div>
          
          <div className="pt-6 flex gap-2 justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">
              Guardar Cambios
            </button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}