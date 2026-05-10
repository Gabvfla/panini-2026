import { create } from 'zustand'
import { ALL_STICKER_IDS } from '../data/album'
import type { AlbumData, Sticker, StickerStatus } from '../types'
import { loadStickers, upsertSticker, upsertAllStickers } from '../utils/supabase'

interface AlbumStore {
  stickers: Record<string, Sticker>
  loaded: boolean
  syncing: boolean
  load: (token?: string) => Promise<void>
  save: (token?: string) => Promise<void>
  setStatus: (id: string, status: StickerStatus, token?: string) => void
  setDuplicateCount: (id: string, count: number, token?: string) => void
  markAll: (ids: string[], status: StickerStatus, token?: string) => void
  reset: (token?: string) => void
  getStats: () => {
    total: number
    owned: number
    missing: number
    duplicates: number
    completion: number
  }
}

function buildInitialStickers(): Record<string, Sticker> {
  return Object.fromEntries(
    ALL_STICKER_IDS.map((id) => [
      id,
      { id, status: 'missing' as StickerStatus, duplicateCount: 0 },
    ])
  )
}

declare global {
  interface Window {
    electronAPI?: {
      loadData: () => Promise<AlbumData | null>
      saveData: (data: AlbumData) => Promise<boolean>
    }
  }
}

function mergeFromRemote(initial: Record<string, Sticker>, rows: { sticker_id: string; status: string; duplicate_count: number }[]): Record<string, Sticker> {
  const merged = { ...initial }
  for (const row of rows) {
    if (merged[row.sticker_id]) {
      merged[row.sticker_id] = {
        id: row.sticker_id,
        status: row.status as StickerStatus,
        duplicateCount: row.duplicate_count,
      }
    }
  }
  return merged
}

export const useAlbumStore = create<AlbumStore>((set, get) => ({
  stickers: buildInitialStickers(),
  loaded: false,
  syncing: false,

  load: async (token?: string) => {
    const initial = buildInitialStickers()

    if (token) {
      set({ syncing: true })
      try {
        const rows = await loadStickers(token)
        const merged = mergeFromRemote(initial, rows)
        set({ stickers: merged, loaded: true, syncing: false })
        return
      } catch {
        set({ syncing: false })
      }
    }

    if (window.electronAPI) {
      const data = await window.electronAPI.loadData()
      if (data?.stickers) {
        const merged = { ...initial }
        for (const id of ALL_STICKER_IDS) {
          if (data.stickers[id]) merged[id] = { ...initial[id], ...data.stickers[id] }
        }
        set({ stickers: merged, loaded: true })
        return
      }
    } else {
      const raw = localStorage.getItem('panini-2026')
      if (raw) {
        try {
          const data: AlbumData = JSON.parse(raw)
          const merged = { ...initial }
          for (const id of ALL_STICKER_IDS) {
            if (data.stickers[id]) merged[id] = { ...initial[id], ...data.stickers[id] }
          }
          set({ stickers: merged, loaded: true })
          return
        } catch { /* ignore */ }
      }
    }

    set({ stickers: initial, loaded: true })
  },

  save: async (token?: string) => {
    const { stickers } = get()
    if (token) {
      const rows = Object.values(stickers)
        .filter((s) => s.status !== 'missing')
        .map((s) => ({ sticker_id: s.id, status: s.status, duplicate_count: s.duplicateCount }))
      await upsertAllStickers(token, rows)
      return
    }
    const data: AlbumData = { stickers, lastUpdated: new Date().toISOString() }
    if (window.electronAPI) {
      await window.electronAPI.saveData(data)
    } else {
      localStorage.setItem('panini-2026', JSON.stringify(data))
    }
  },

  setStatus: (id, status, token) => {
    set((state) => ({
      stickers: {
        ...state.stickers,
        [id]: {
          ...state.stickers[id],
          status,
          duplicateCount: status !== 'duplicate' ? 0 : state.stickers[id].duplicateCount || 1,
        },
      },
    }))
    const { stickers } = get()
    const s = stickers[id]
    if (token) {
      upsertSticker(token, { sticker_id: id, status, duplicate_count: s.duplicateCount })
    } else {
      get().save()
    }
  },

  setDuplicateCount: (id, count, token) => {
    set((state) => ({
      stickers: {
        ...state.stickers,
        [id]: { ...state.stickers[id], status: 'duplicate', duplicateCount: count },
      },
    }))
    if (token) {
      upsertSticker(token, { sticker_id: id, status: 'duplicate', duplicate_count: count })
    } else {
      get().save()
    }
  },

  markAll: (ids, status, token) => {
    set((state) => {
      const updated = { ...state.stickers }
      for (const id of ids) {
        updated[id] = {
          ...updated[id],
          status,
          duplicateCount: status !== 'duplicate' ? 0 : updated[id].duplicateCount || 1,
        }
      }
      return { stickers: updated }
    })
    if (token) {
      const { stickers } = get()
      const rows = ids.map((id) => ({
        sticker_id: id,
        status,
        duplicate_count: stickers[id].duplicateCount,
      }))
      upsertAllStickers(token, rows)
    } else {
      get().save()
    }
  },

  reset: (token) => {
    const fresh = buildInitialStickers()
    set({ stickers: fresh })
    if (!token) {
      const data: AlbumData = { stickers: fresh, lastUpdated: new Date().toISOString() }
      if (window.electronAPI) {
        window.electronAPI.saveData(data)
      } else {
        localStorage.setItem('panini-2026', JSON.stringify(data))
      }
    }
  },

  getStats: () => {
    const { stickers } = get()
    const values = Object.values(stickers)
    const owned = values.filter((s) => s.status === 'owned').length
    const duplicate = values.filter((s) => s.status === 'duplicate').length
    const missing = values.filter((s) => s.status === 'missing').length
    const total = values.length
    return {
      total,
      owned: owned + duplicate,
      missing,
      duplicates: duplicate,
      completion: Math.round(((owned + duplicate) / total) * 100),
    }
  },
}))
