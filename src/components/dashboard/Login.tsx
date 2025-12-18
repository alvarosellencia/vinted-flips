"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("alvaro@sellencia.com");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setMsg(null);
    const em = email.trim();
    if (!em) return;

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
    <main className="vf-container pt-14">
      <div className="vf-card max-w-xl">
        <div className="vf-card-inner">
          <div className="text-sm vf-muted">Vinted Flips</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Acceso</h1>
          <p className="mt-2 text-sm vf-muted">
            Inicia sesión para ver tus lotes y prendas (RLS activo).
          </p>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm vf-muted">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="vf-input"
              placeholder="tu@email.com"
            />
          </label>

          <button onClick={signIn} disabled={busy} className="mt-4 w-full vf-btn-primary">
            {busy ? "Enviando…" : "Enviarme magic link"}
          </button>

          {msg && <div className="mt-4 text-sm vf-muted">{msg}</div>}
        </div>
      </div>
    </main>
  );
}