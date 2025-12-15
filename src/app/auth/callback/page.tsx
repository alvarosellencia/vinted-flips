"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Procesando inicio de sesión...");

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);

        // A) Errores que pueden venir en query (?error=..., ?error_code=..., ?error_description=...)
        const err = url.searchParams.get("error");
        const errCode = url.searchParams.get("error_code");
        const errDesc = url.searchParams.get("error_description");
        if (err || errCode || errDesc) {
          setMsg(
            `Error de login: ${errCode ?? err ?? "unknown"}${
              errDesc ? ` · ${decodeURIComponent(errDesc)}` : ""
            }`
          );
          return;
        }

        // 1) PKCE code (?code=...)
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace("/");
          return;
        }

        // 2) Hash (#access_token=...&refresh_token=...)
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.replace("#", ""));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (error) throw error;

            // Limpia el hash para que no se “reprocese” en refresh
            window.history.replaceState(null, "", "/auth/callback");

            router.replace("/");
            return;
          }
        }

        setMsg("Callback sin token válido. Vuelve a iniciar sesión y abre el magic link en el mismo navegador/perfil.");
      } catch (e: any) {
        setMsg("Error al procesar sesión: " + (e?.message ?? String(e)));
      }
    })();
  }, [router]);

  return (
    <main className="p-6 text-center">
      <div className="text-lg font-semibold">Vinted Flips</div>
      <div className="mt-3 text-sm">{msg}</div>
    </main>
  );
}