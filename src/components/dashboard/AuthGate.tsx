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

    const syncUser = async () => {
      // getUser() is the safest way to ensure we have a real user (and id)
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;
      if (error) {
        // If token/session is invalid, consider as logged out.
        setUserId(null);
      } else {
        setUserId(data.user?.id ?? null);
      }
      setLoading(false);
    };

    // Initial load
    syncUser();

    // Keep in sync on login/logout/token refresh
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // While auth state changes, briefly show loading to avoid rendering
      // the dashboard with a transient/undefined user.
      setLoading(true);
      syncUser();
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

  // If there is no authenticated user, show login
  if (!userId) return <Login />;

  // Important: only render Dashboard once we have a real user id
  return <Dashboard />;
}