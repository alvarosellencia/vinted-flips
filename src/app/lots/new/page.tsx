import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createLot } from '@/lib/actions';

export default function NewLotPage() {
  return (
    <PageShell title="Nuevo Lote">
      <Card className="max-w-lg mx-auto">
        <form action={createLot} className="space-y-6">
          
          <Input 
            name="name" 
            label="Nombre del Lote" 
            placeholder="Ej: Lote Camisas Vintage #4" 
            required 
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="total_cost" 
              label="Coste Total (€)" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              required 
            />
            <Input 
              name="items_count" 
              label="Nº de Items" 
              type="number" 
              placeholder="Ej: 20" 
              required 
            />
          </div>

          <Input 
            name="date" 
            label="Fecha de Compra" 
            type="date" 
            defaultValue={new Date().toISOString().split('T')[0]} 
          />

          <div className="pt-4 flex justify-end gap-3">
             {/* El botón de cancelar es un simple enlace atrás */}
             <a href="/lots" className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
              Cancelar
            </a>
            <button 
              type="submit" 
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm"
            >
              Crear Lote
            </button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}