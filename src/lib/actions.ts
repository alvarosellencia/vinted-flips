'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- ACCIÓN: CREAR LOTE ---
export async function createLot(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const total_cost = Number(formData.get('total_cost'));
  const items_count = Number(formData.get('items_count'));
  const date = formData.get('date') as string;

  // Calculamos el coste unitario automáticamente
  // Evitamos dividir por cero
  const unit_cost = items_count > 0 ? (total_cost / items_count) : 0;

  const { error } = await supabase.from('lots').insert({
    name,
    total_cost,
    items_count,
    unit_cost, 
    purchase_date: date || new Date().toISOString()
  });

  if (error) {
    console.error('Error creando lote:', error);
    // Podríamos devolver el error, pero por ahora redirigimos
  }

  revalidatePath('/lots'); // Refrescar la lista de lotes
  redirect('/lots');       // Volver a la página de lotes
}

// --- ACCIÓN: CREAR ITEM ---
export async function createItem(formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get('title') as string;
  const status = formData.get('status') as string;
  const lot_id = formData.get('lot_id') as string;
  
  const purchase_cost = Number(formData.get('purchase_cost'));
  const sale_price = Number(formData.get('sale_price'));
  
  // Lógica: Si seleccionó "Ninguno" (value="none"), enviamos null a la BD
  const finalLotId = lot_id === 'none' ? null : lot_id;

  const { error } = await supabase.from('items').insert({
    title,
    status: status || 'for_sale',
    lot_id: finalLotId,
    purchase_cost: purchase_cost || 0, // Si es de lote, esto se ignora visualmente luego
    sale_price: sale_price || 0
  });

  if (error) {
    console.error('Error creando item:', error);
  }

  revalidatePath('/items');
  revalidatePath('/'); // Actualizar dashboard
  redirect('/items');
}