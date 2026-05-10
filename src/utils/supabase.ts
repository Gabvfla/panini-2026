const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string
}

async function request(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${options.token ?? SUPABASE_ANON_KEY}`,
  }

  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.error_description ?? err.message ?? 'Erro desconhecido')
  }

  if (res.status === 204) return null
  return res.json()
}

export interface AuthUser {
  id: string
  email: string
}

export interface Session {
  access_token: string
  user: AuthUser
}

export async function signUp(email: string, password: string): Promise<Session> {
  const data = await request('/auth/v1/signup', {
    method: 'POST',
    body: { email, password },
  })
  if (!data.access_token) throw new Error(data.error_description ?? 'Erro ao criar conta')
  return data
}

export async function signIn(email: string, password: string): Promise<Session> {
  const data = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  })
  if (!data.access_token) throw new Error(data.error_description ?? 'Email ou senha incorretos')
  return data
}

export async function signOut(token: string): Promise<void> {
  await request('/auth/v1/logout', { method: 'POST', token })
}

export interface StickerRow {
  sticker_id: string
  status: string
  duplicate_count: number
}

export async function loadStickers(token: string): Promise<StickerRow[]> {
  const data = await request('/rest/v1/stickers?select=sticker_id,status,duplicate_count', { token })
  return data ?? []
}

export async function upsertStickers(token: string, rows: StickerRow[]): Promise<void> {
  if (rows.length === 0) return
  await request('/rest/v1/stickers', {
    method: 'POST',
    token,
    body: rows,
  })
}

export async function upsertSticker(token: string, row: StickerRow): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Prefer': 'resolution=merge-duplicates',
  }

  await fetch(`${SUPABASE_URL}/rest/v1/stickers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(row),
  })
}

export async function upsertAllStickers(token: string, rows: StickerRow[]): Promise<void> {
  if (rows.length === 0) return
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Prefer': 'resolution=merge-duplicates',
  }
  const CHUNK = 200
  for (let i = 0; i < rows.length; i += CHUNK) {
    await fetch(`${SUPABASE_URL}/rest/v1/stickers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(rows.slice(i, i + CHUNK)),
    })
  }
}
