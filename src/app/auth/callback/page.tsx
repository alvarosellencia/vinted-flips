"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Procesando login...");

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Fuerza a Supabase a leer el #access_token del hash (si viene así)
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
        }

        router.replace("/");
      } catch (e: any) {
        setMsg(e?.message ?? String(e));
      }
    })();
  }, [router]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Vinted Flips</h1>
      <p className="mt-4">{msg}</p>
    </main>
  );
}
