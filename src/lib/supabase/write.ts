import { supabase } from '@/lib/supabase/client'

function parseUnknownColumn(message?: string) {
  // "Could not find the 'notes' column of 'items' in the schema cache"
  if (!message) return null
  const m = message.match(/Could not find the '(.+?)' column of '(.+?)'/)
  if (!m) return null
  return { column: m[1], table: m[2] }
}

async function runWithOneRetry(
  table: 'lots' | 'items',
  action: 'insert' | 'update',
  payload: Record<string, any>,
  id?: string,
  uid?: string
) {
  const attempt = async (p: Record<string, any>) => {
    if (action === 'insert') return supabase.from(table).insert(p)
    // update
    const q = supabase.from(table).update(p).eq('id', id!)
    return uid ? q.eq('user_id', uid) : q
  }

  let res: any = await attempt(payload)
  if (!res?.error) return res

  const info = parseUnknownColumn(res.error.message)
  if (info?.table === table && payload[info.column] !== undefined) {
    const next = { ...payload }
    delete next[info.column]
    res = await attempt(next)
    return res
  }

  return res
}

export async function insertLot(payload: Record<string, any>) {
  return runWithOneRetry('lots', 'insert', payload)
}

export async function updateLot(id: string, uid: string, payload: Record<string, any>) {
  return runWithOneRetry('lots', 'update', payload, id, uid)
}

export async function deleteLot(id: string, uid: string) {
  return supabase.from('lots').delete().eq('id', id).eq('user_id', uid)
}

export async function insertItem(payload: Record<string, any>) {
  // fallback name/title si tu tabla usa title
  let res = await runWithOneRetry('items', 'insert', payload)
  if (!res?.error) return res

  const info = parseUnknownColumn(res.error.message)
  if (info?.table === 'items' && info.column === 'name' && payload.name) {
    const p2 = { ...payload }
    delete p2.name
    p2.title = payload.name
    res = await runWithOneRetry('items', 'insert', p2)
    return res
  }

  return res
}

export async function updateItem(id: string, uid: string, payload: Record<string, any>) {
  let res = await runWithOneRetry('items', 'update', payload, id, uid)
  if (!res?.error) return res

  const info = parseUnknownColumn(res.error.message)
  if (info?.table === 'items' && info.column === 'name' && payload.name) {
    const p2 = { ...payload }
    delete p2.name
    p2.title = payload.name
    res = await runWithOneRetry('items', 'update', p2, id, uid)
    return res
  }

  return res
}

export async function deleteItem(id: string, uid: string) {
  return supabase.from('items').delete().eq('id', id).eq('user_id', uid)
}
