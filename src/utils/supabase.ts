const RAW_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_URL = RAW_URL.replace(/\/+$/, '').replace(/\/rest\/v1.*$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function headers(token: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    ...extra,
  }
}

export interface AuthUser { id: string; email: string }
export interface Session { access_token: string; user: AuthUser }
export interface StickerRow { sticker_id: string; status: string; duplicate_count: number }

async function post(path: string, body: unknown, token?: string): Promise<unknown> {
  const hdrs: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token ?? SUPABASE_ANON_KEY}`,
  }
  const res = await fetch(`${SUPABASE_URL}${path}`, { method: 'POST', headers: hdrs, body: JSON.stringify(body) })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try { msg = JSON.parse(text).error_description ?? JSON.parse(text).message ?? text } catch { /* */ }
    throw new Error(msg)
  }
  return text ? JSON.parse(text) : null
}

export async function signUp(email: string, password: string): Promise<Session> {
  const data = await post('/auth/v1/signup', { email, password }) as Session
  if (!data?.access_token) throw new Error('Erro ao criar conta')
  return data
}

export async function signIn(email: string, password: string): Promise<Session> {
  const data = await post('/auth/v1/token?grant_type=password', { email, password }) as Session
  if (!data?.access_token) throw new Error('Email ou senha incorretos')
  return data
}

export async function signOut(token: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: headers(token) })
}

export async function loadStickers(token: string): Promise<StickerRow[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/stickers?select=sticker_id,status,duplicate_count`, { headers: headers(token) })
  if (!res.ok) { console.error('loadStickers failed:', await res.text()); return [] }
  return res.json()
}

export async function saveAllStickers(token: string, userId: string, rows: StickerRow[]): Promise<void> {
  if (rows.length === 0) return
  const hdrs = headers(token, { 'Prefer': 'resolution=merge-duplicates,return=minimal' })
  const CHUNK = 200
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).map(r => ({ ...r, user_id: userId }))
    const res = await fetch(`${SUPABASE_URL}/rest/v1/stickers`, { method: 'POST', headers: hdrs, body: JSON.stringify(chunk) })
    if (!res.ok) console.error('saveAllStickers error:', await res.text())
  }
}

export async function saveSingleSticker(token: string, userId: string, row: StickerRow): Promise<void> {
  const hdrs = headers(token, { 'Prefer': 'resolution=merge-duplicates,return=minimal' })
  const res = await fetch(`${SUPABASE_URL}/rest/v1/stickers`, { method: 'POST', headers: hdrs, body: JSON.stringify({ ...row, user_id: userId }) })
  if (!res.ok) console.error('saveSingleSticker error:', await res.text())
}
