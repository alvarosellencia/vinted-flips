"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Login from "@/components/dashboard/Login";
import Dashboard from "@/components/dashboard/Dashboard";

export default function AuthGate() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        console.error("[AuthGate] getSession error:", error);
        setUserId(null);
        setLoading(false);
        return;
      }

      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const uid = session?.user?.id ?? null;
      setUserId(uid);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="text-sm opacity-70">Cargando sesión…</div>
      </main>
    );
  }

  if (!userId) return <Login />;

  return <Dashboard userId={userId} />;
}