export type TransactionType = 'VENTA' | 'COMPRA' | 'GASTO';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: TransactionType;
  platform?: 'Vinted' | 'Wallapop' | 'Ebay';
  status: 'completed' | 'pending';
}

export interface KpiData {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
}

// TIPOS AÑADIDOS PARA COMPATIBILIDAD
export type ItemStatusDb = 'for_sale' | 'reserved' | 'sold' | 'returned';

export interface Item {
  id: string;
  title: string;
  status: ItemStatusDb;
  price: number;
}

export interface Lot {
  id: string;
  description: string;
  cost: number;
  date: string;
}