export type StickerStatus = 'missing' | 'owned' | 'duplicate'

export interface Sticker {
  id: string
  status: StickerStatus
  duplicateCount: number
}

export interface Team {
  code: string
  name: string
  group: string
}

export interface Group {
  name: string
  teams: Team[]
}

export interface AlbumData {
  stickers: Record<string, Sticker>
  lastUpdated: string
}
