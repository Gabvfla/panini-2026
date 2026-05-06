import { create } from 'zustand'
import { ALL_STICKER_IDS } from '../data/album'
import type { AlbumData, Sticker, StickerStatus } from '../types'

interface AlbumStore {
  stickers: Record<string, Sticker>
  loaded: boolean
  load: () => Promise<void>
  save: () => Promise<void>
  setStatus: (id: string, status: StickerStatus) => void
  setDuplicateCount: (id: string, count: number) => void
  markAll: (ids: string[], status: StickerStatus) => void
  reset: () => void
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

export const useAlbumStore = create<AlbumStore>((set, get) => ({
  stickers: buildInitialStickers(),
  loaded: false,

  load: async () => {
    const initial = buildInitialStickers()
    if (window.electronAPI) {
      const data = await window.electronAPI.loadData()
      if (data?.stickers) {
        const merged = { ...initial }
        for (const id of ALL_STICKER_IDS) {
          if (data.stickers[id]) {
            merged[id] = { ...initial[id], ...data.stickers[id] }
          }
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
            if (data.stickers[id]) {
              merged[id] = { ...initial[id], ...data.stickers[id] }
            }
          }
          set({ stickers: merged, loaded: true })
          return
        } catch {
          /* ignore */
        }
      }
    }
    set({ stickers: initial, loaded: true })
  },

  save: async () => {
    const { stickers } = get()
    const data: AlbumData = { stickers, lastUpdated: new Date().toISOString() }
    if (window.electronAPI) {
      await window.electronAPI.saveData(data)
    } else {
      localStorage.setItem('panini-2026', JSON.stringify(data))
    }
  },

  setStatus: (id, status) => {
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
    get().save()
  },

  setDuplicateCount: (id, count) => {
    set((state) => ({
      stickers: {
        ...state.stickers,
        [id]: { ...state.stickers[id], status: 'duplicate', duplicateCount: count },
      },
    }))
    get().save()
  },

  markAll: (ids, status) => {
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
    get().save()
  },

  reset: () => {
    const fresh = buildInitialStickers()
    set({ stickers: fresh })
    const data: AlbumData = { stickers: fresh, lastUpdated: new Date().toISOString() }
    if (window.electronAPI) {
      window.electronAPI.saveData(data)
    } else {
      localStorage.setItem('panini-2026', JSON.stringify(data))
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
