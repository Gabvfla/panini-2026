import { create } from 'zustand'
import { ALL_STICKER_IDS } from '../data/album'
import type { AlbumData, Sticker, StickerStatus } from '../types'
import { loadStickers, saveAllStickers, saveSingleSticker } from '../utils/supabase'

interface AlbumStore {
  stickers: Record<string, Sticker>
  loaded: boolean
  syncing: boolean
  saving: boolean
  unsaved: boolean
  resetLoaded: () => void
  load: (token?: string | null) => Promise<void>
  saveAll: () => Promise<void>
  setStatus: (id: string, status: StickerStatus) => void
  setDuplicateCount: (id: string, count: number) => void
  markAll: (ids: string[], status: StickerStatus) => void
  reset: () => void
  getStats: () => { total: number; owned: number; missing: number; duplicates: number; completion: number }
}

function buildInitialStickers(): Record<string, Sticker> {
  return Object.fromEntries(ALL_STICKER_IDS.map((id) => [id, { id, status: 'missing' as StickerStatus, duplicateCount: 0 }]))
}

declare global {
  interface Window {
    electronAPI?: { loadData: () => Promise<AlbumData | null>; saveData: (data: AlbumData) => Promise<boolean> }
  }
}

function getSession(): { token: string; userId: string } | null {
  try {
    const raw = localStorage.getItem('panini-session')
    if (!raw) return null
    const { token, user } = JSON.parse(raw)
    if (token && user?.id) return { token, userId: user.id }
    return null
  } catch { return null }
}

function saveLocal(stickers: Record<string, Sticker>) {
  const data: AlbumData = { stickers, lastUpdated: new Date().toISOString() }
  if (window.electronAPI) window.electronAPI.saveData(data)
  else localStorage.setItem('panini-2026', JSON.stringify(data))
}

export const useAlbumStore = create<AlbumStore>((set, get) => ({
  stickers: buildInitialStickers(),
  loaded: false,
  syncing: false,
  saving: false,
  unsaved: false,

  resetLoaded: () => set({ loaded: false, stickers: buildInitialStickers(), unsaved: false }),

  load: async (token) => {
    const initial = buildInitialStickers()
    if (token) {
      set({ syncing: true })
      try {
        const rows = await loadStickers(token)
        const merged = { ...initial }
        for (const row of rows) {
          if (merged[row.sticker_id]) {
            merged[row.sticker_id] = { id: row.sticker_id, status: row.status as StickerStatus, duplicateCount: row.duplicate_count }
          }
        }
        set({ stickers: merged, loaded: true, syncing: false, unsaved: false })
        return
      } catch (e) {
        console.error('load from supabase failed:', e)
        set({ syncing: false })
      }
    }
    if (window.electronAPI) {
      const data = await window.electronAPI.loadData()
      if (data?.stickers) {
        const merged = { ...initial }
        for (const id of ALL_STICKER_IDS) { if (data.stickers[id]) merged[id] = { ...initial[id], ...data.stickers[id] } }
        set({ stickers: merged, loaded: true }); return
      }
    } else {
      const raw = localStorage.getItem('panini-2026')
      if (raw) {
        try {
          const data: AlbumData = JSON.parse(raw)
          const merged = { ...initial }
          for (const id of ALL_STICKER_IDS) { if (data.stickers[id]) merged[id] = { ...initial[id], ...data.stickers[id] } }
          set({ stickers: merged, loaded: true }); return
        } catch { /* ignore */ }
      }
    }
    set({ stickers: initial, loaded: true })
  },

  saveAll: async () => {
    const session = getSession()
    const { stickers } = get()
    set({ saving: true })
    try {
      if (session) {
        const rows = Object.values(stickers)
          .filter((s) => s.status !== 'missing')
          .map((s) => ({ sticker_id: s.id, status: s.status, duplicate_count: s.duplicateCount }))
        await saveAllStickers(session.token, session.userId, rows)
      } else {
        saveLocal(stickers)
      }
      set({ saving: false, unsaved: false })
    } catch (e) {
      console.error('saveAll failed:', e)
      set({ saving: false })
    }
  },

  setStatus: (id, status) => {
    const dupCount = status === 'duplicate' ? (get().stickers[id]?.duplicateCount || 1) : 0
    set((state) => ({ stickers: { ...state.stickers, [id]: { ...state.stickers[id], status, duplicateCount: dupCount } }, unsaved: true }))
    const session = getSession()
    if (session) saveSingleSticker(session.token, session.userId, { sticker_id: id, status, duplicate_count: dupCount })
    else saveLocal(get().stickers)
  },

  setDuplicateCount: (id, count) => {
    set((state) => ({ stickers: { ...state.stickers, [id]: { ...state.stickers[id], status: 'duplicate', duplicateCount: count } }, unsaved: true }))
    const session = getSession()
    if (session) saveSingleSticker(session.token, session.userId, { sticker_id: id, status: 'duplicate', duplicate_count: count })
    else saveLocal(get().stickers)
  },

  markAll: (ids, status) => {
    set((state) => {
      const updated = { ...state.stickers }
      for (const id of ids) updated[id] = { ...updated[id], status, duplicateCount: status === 'duplicate' ? (updated[id].duplicateCount || 1) : 0 }
      return { stickers: updated, unsaved: true }
    })
    const session = getSession()
    if (session) {
      const { stickers } = get()
      saveAllStickers(session.token, session.userId, ids.map((id) => ({ sticker_id: id, status, duplicate_count: stickers[id].duplicateCount })))
    } else saveLocal(get().stickers)
  },

  reset: () => {
    const fresh = buildInitialStickers()
    set({ stickers: fresh, unsaved: false })
    saveLocal(fresh)
  },

  getStats: () => {
    const { stickers } = get()
    const values = Object.values(stickers)
    const owned = values.filter((s) => s.status === 'owned').length
    const duplicate = values.filter((s) => s.status === 'duplicate').length
    const missing = values.filter((s) => s.status === 'missing').length
    const total = values.length
    return { total, owned: owned + duplicate, missing, duplicates: duplicate, completion: Math.round(((owned + duplicate) / total) * 100) }
  },
}))
