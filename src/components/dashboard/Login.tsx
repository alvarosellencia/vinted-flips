// src/components/dashboard/Login.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setMsg(null);
    const em = email.trim();
    if (!em) {
      setMsg("Introduce un email válido.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: em,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);

    if (error) setMsg(error.message);
    else setMsg("Te he enviado un email para iniciar sesión (magic link). Ábrelo en este mismo navegador.");
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Vinted Flips</h1>
        <p className="mt-2 text-sm opacity-75">Inicia sesión para ver tus lotes y prendas (RLS activo).</p>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm opacity-75">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#070b16]/60 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/30"
            placeholder="tu@email.com"
          />
        </label>

        <button
          onClick={signIn}
          disabled={busy}
          className="mt-4 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-[#070b16] disabled:opacity-60"
        >
          {busy ? "Enviando…" : "Enviarme el magic link"}
        </button>

        {msg && <div className="mt-4 text-sm opacity-80">{msg}</div>}
      </div>
    </main>
  );
}
