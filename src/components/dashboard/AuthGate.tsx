// src/components/dashboard/AuthGate.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Dashboard from "./Dashboard";
import Login from "./Login";

export default function AuthGate() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">Cargando…</div>
      </main>
    );
  }

  if (!userId) return <Login />;

  return <Dashboard userId={userId} />;
}
type Props = {
  onSignOut?: () => Promise<void>;
  children: React.ReactNode;
};
