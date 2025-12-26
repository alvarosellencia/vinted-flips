'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import { supabase } from '@/lib/supabase/client'

export default function DebugPage() {
  const [loading, setLoading] = useState(true)
  const [uid, setUid] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [lotsCount, setLotsCount] = useState<number>(0)
  const [itemsCount, setItemsCount] = useState<number>(0)
  const [lotsSample, setLotsSample] = useState<any[]>([])
  const [itemsSample, setItemsSample] = useState<any[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)

        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr

        const user = userData.user
        setUid(user?.id ?? null)
        setEmail(user?.email ?? null)

        if (!user?.id) {
          setErr('No hay sesión activa.')
          return
        }

        const [lotsRes, itemsRes] = await Promise.all([
          supabase.from('lots').select('*', { count: 'exact' }).eq('user_id', user.id).limit(3),
          supabase.from('items').select('*', { count: 'exact' }).eq('user_id', user.id).limit(3),
        ])

        if (lotsRes.error) throw lotsRes.error
        if (itemsRes.error) throw itemsRes.error

        setLotsCount(lotsRes.count ?? 0)
        setItemsCount(itemsRes.count ?? 0)
        setLotsSample(lotsRes.data ?? [])
        setItemsSample(itemsRes.data ?? [])
      } catch (e: any) {
        setErr(e?.message ?? 'Error desconocido')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-medium">Debug Supabase</div>
        <div className="text-xs text-gray-500 mt-1">
          Esto sirve para comprobar si estás logueado con el usuario correcto y si tus datos tienen el user_id correcto.
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="text-sm text-gray-500">Cargando…</div>
        ) : err ? (
          <div className="text-sm text-red-600">{err}</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-500 text-xs">User</div>
              <div className="font-medium break-words">{email ?? '—'}</div>
              <div className="text-xs text-gray-500 break-words">{uid ?? '—'}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 p-3">
                <div className="text-xs text-gray-500">lots (count)</div>
                <div className="text-lg font-semibold">{lotsCount}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 p-3">
                <div className="text-xs text-gray-500">items (count)</div>
                <div className="text-lg font-semibold">{itemsCount}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">Lots sample (3)</div>
              <pre className="text-[11px] overflow-x-auto rounded-2xl bg-gray-50 p-3 border border-gray-200">
{JSON.stringify(lotsSample, null, 2)}
              </pre>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">Items sample (3)</div>
              <pre className="text-[11px] overflow-x-auto rounded-2xl bg-gray-50 p-3 border border-gray-200">
{JSON.stringify(itemsSample, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
