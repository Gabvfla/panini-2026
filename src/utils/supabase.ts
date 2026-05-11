const RAW_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_URL = RAW_URL.replace(/\/+$/, '').replace(/\/rest\/v1.*$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function authHeaders(token: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    ...extra,
  }
}

export interface AuthUser {
  id: string
  email: string
}

export interface Session {
  access_token: string
  user: AuthUser
}

async function authRequest(path: string, method: string, body: unknown, token?: string): Promise<unknown> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token ?? SUPABASE_ANON_KEY}`,
  }
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try { msg = JSON.parse(text).error_description ?? JSON.parse(text).message ?? text } catch { /* */ }
    throw new Error(msg)
  }
  if (!text) return null
  return JSON.parse(text)
}

export async function signUp(email: string, password: string): Promise<Session> {
  const data = await authRequest('/auth/v1/signup', 'POST', { email, password }) as Session
  if (!data?.access_token) throw new Error('Erro ao criar conta')
  return data
}

export async function signIn(email: string, password: string): Promise<Session> {
  const data = await authRequest('/auth/v1/token?grant_type=password', 'POST', { email, password }) as Session
  if (!data?.access_token) throw new Error('Email ou senha incorretos')
  return data
}

export async function signOut(token: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: authHeaders(token),
  })
}

export interface StickerRow {
  sticker_id: string
  status: string
  duplicate_count: number
}

export async function loadStickers(token: string): Promise<StickerRow[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/stickers?select=sticker_id,status,duplicate_count`,
    { headers: authHeaders(token) }
  )
  if (!res.ok) return []
  return res.json()
}

export async function upsertSticker(token: string, row: StickerRow): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/stickers`, {
    method: 'POST',
    headers: authHeaders(token, { 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(row),
  })
}

export async function upsertAllStickers(token: string, rows: StickerRow[]): Promise<void> {
  if (rows.length === 0) return
  const CHUNK = 200
  const headers = authHeaders(token, { 'Prefer': 'resolution=merge-duplicates,return=minimal' })
  for (let i = 0; i < rows.length; i += CHUNK) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/stickers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(rows.slice(i, i + CHUNK)),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('upsertAllStickers error:', text)
    }
  }
}
