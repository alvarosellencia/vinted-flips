'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const origin = window.location.origin
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback` }
      })
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setError(err?.message ?? 'Error enviando el enlace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Vinted Flips</h1>
        <p className="text-sm text-gray-500 mt-1">
          Entra con enlace mágico (Supabase).
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#7B1DF7] text-white py-2 text-sm font-medium shadow-sm disabled:opacity-60"
          >
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </button>

          {sent && (
            <p className="text-sm text-green-700">
              Enlace enviado. Revisa tu email.
            </p>
          )}

          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      </div>
    </div>
  )
}
