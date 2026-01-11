'use client';

import { Card } from '@/components/ui/Card';
import { Edit2 } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface SummaryProps {
  data: {
    revenue: number;
    investment: number;
    profit: number;
    activeCount: number;
    recentSales: any[];
    chartData: any[];
  };
}

export function SummaryView({ data }: SummaryProps) {
  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="space-y-6">
      {/* 1. KPIs FINANCIEROS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Inversión Total</p>
          <h3 className="text-2xl font-bold text-slate-900">{formatMoney(data.investment)}</h3>
          <p className="text-xs text-slate-500">Lotes + Items sueltos</p>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Ventas Brutas</p>
          <h3 className="text-2xl font-bold text-slate-900">{formatMoney(data.revenue)}</h3>
          <p className="text-xs text-slate-500">Total facturado</p>
        </Card>

        <Card className={`border-l-4 ${data.profit >= 0 ? 'border-l-indigo-500' : 'border-l-red-500'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase">Beneficio Neto</p>
          <h3 className={`text-2xl font-bold ${data.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            {formatMoney(data.profit)}
          </h3>
          <p className="text-xs text-slate-500">Cashflow real</p>
        </Card>

        <Card className="border-l-4 border-l-orange-400">
          <p className="text-xs font-bold text-slate-400 uppercase">Stock Activo</p>
          <h3 className="text-2xl font-bold text-slate-900">{data.activeCount}</h3>
          <p className="text-xs text-slate-500">Items listos para vender</p>
        </Card>
      </div>

      {/* 2. GRÁFICA Y LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICA DE VENTAS */}
        <Card className="lg:col-span-2 min-h-[300px]" title="Ventas Últimos 7 Días">
          <div className="h-[250px] w-full mt-4">
            {data.chartData.some(d => d.amount > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
                No hay ventas en los últimos 7 días
              </div>
            )}
          </div>
        </Card>

        {/* ÚLTIMAS VENTAS CON BOTÓN EDITAR */}
        <Card title="Últimas Ventas">
          <div className="space-y-4">
            {data.recentSales.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center group border-b border-slate-50 pb-2 last:border-0">
                <div>
                  <p className="font-medium text-slate-800 text-sm truncate max-w-[120px]">{item.title}</p>
                  <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600 text-sm">{formatMoney(item.price)}</span>
                  <Link href={`/items/${item.id}`} className="p-1.5 bg-slate-100 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Edit2 size={14} />
                  </Link>
                </div>
              </div>
            ))}
            {data.recentSales.length === 0 && (
              <p className="text-slate-400 text-sm italic py-4 text-center">Sin ventas registradas.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}