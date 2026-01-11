'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // 1. Importamos la función, no la variable

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 2. Instanciamos el cliente dentro del efecto
    const supabase = createClient();
    
    const signOut = async () => {
      await supabase.auth.signOut();
      router.replace('/login');
      router.refresh();
    };

    signOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-500 animate-pulse">Cerrando sesión...</div>
    </div>
  );
}