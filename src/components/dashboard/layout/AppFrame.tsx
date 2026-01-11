'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Package, Layers, LogOut, Menu } from 'lucide-react';

// Configuración de Navegación
const NAV_ITEMS = [
  { 
    label: 'Resumen', 
    href: '/', 
    icon: LayoutDashboard 
  },
  { 
    label: 'Items', 
    href: '/items', 
    icon: Package 
  },
  { 
    label: 'Lotes', 
    href: '/lots', 
    icon: Layers 
  },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh(); // Limpia datos en caché
      router.push('/login'); // Redirige al login
    } catch (error) {
      console.error('Error al salir:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ========================================
        SIDEBAR (DESKTOP)
        ========================================
      */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 bottom-0 z-40">
        <div className="p-6">
          <div className="font-bold text-xl text-indigo-600 tracking-tight flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-1 rounded">VF</span>
            VintedFlips
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sección de Usuario / Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <LogOut size={18} className="group-hover:text-red-600 text-slate-400" />
            {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* ========================================
        MAIN CONTENT WRAPPER
        ========================================
        ml-0 md:ml-64 empuja el contenido a la derecha en desktop para respetar el sidebar fijo
      */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 transition-all duration-300">
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
          {children}
        </div>
      </div>

      {/* ========================================
        BOTTOM NAV (MOBILE)
        ========================================
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[64px] ${
                 isActive ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Icon size={20} className={isActive ? 'fill-current opacity-20' : ''} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
        {/* Botón Logout Mobile (Opcional, pequeño) */}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-2 rounded-lg min-w-[64px] text-slate-400 hover:text-red-500"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium mt-1">Salir</span>
        </button>
      </nav>
    </div>
  );
}