// src/lib/types.ts
export type LotRow = {
  id: string;
  user_id: string;
  name: string;
  purchase_date: string | null;
  items_count: number | null;
  total_cost: number | null;
  unit_cost: number | null;
  provider: string | null;
  created_at?: string | null;
};

export type ItemStatus = "available" | "reserved" | "sold";

export type ItemRow = {
  id: string;
  user_id: string;
  name: string;

  status: ItemStatus;

  listing_date: string | null;
  sale_date: string | null;

  lot_id: string | null;
  lot_name: string | null;

  // Ingresos y costes
  sale_price: number | null;      // precio venta (bruto)
  platform_fee: number | null;    // comisión plataforma
  shipping_cost: number | null;   // coste envío (si lo contabilizas)
  purchase_cost: number | null;   // coste prenda suelta (si no va en lote)

  created_at?: string | null;
};
