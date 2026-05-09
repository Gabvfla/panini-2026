import { GROUPS, SPECIAL_STICKERS } from '../data/album'
import type { Sticker } from '../types'
import { buildXlsx, type XlsxRow } from './xlsxBuilder'

type StatusKey = 'missing' | 'owned' | 'duplicate'

function translateStatus(s: StatusKey): string {
  if (s === 'owned') return 'Tenho'
  if (s === 'duplicate') return 'Repetida'
  return 'Faltando'
}

interface RowData {
  codigo: string
  selecao: string
  grupo: string
  numero: number
  status: StatusKey
  repetidas: number
}

function buildRowData(stickers: Record<string, Sticker>): RowData[] {
  const rows: RowData[] = []
  for (const id of SPECIAL_STICKERS) {
    const s = stickers[id]
    rows.push({ codigo: id, selecao: 'Especial', grupo: '-', numero: 0, status: (s?.status ?? 'missing') as StatusKey, repetidas: s?.status === 'duplicate' ? (s.duplicateCount ?? 1) : 0 })
  }
  for (const group of GROUPS) {
    for (const team of group.teams) {
      for (let i = 1; i <= 20; i++) {
        const id = `${team.code}${i}`
        const s = stickers[id]
        rows.push({ codigo: id, selecao: team.name, grupo: `Grupo ${group.name}`, numero: i, status: (s?.status ?? 'missing') as StatusKey, repetidas: s?.status === 'duplicate' ? (s.duplicateCount ?? 1) : 0 })
      }
    }
  }
  return rows
}

const HDR_BG = 'FF13131F'
const HDR_FG = 'FFFFFFFF'
const C_OWNED = 'FF15803D'
const C_MISSING = 'FFDC2626'
const C_DUP = 'FFA16207'

function scolor(s: StatusKey) { return s === 'owned' ? C_OWNED : s === 'duplicate' ? C_DUP : C_MISSING }

function hdr(v: string, align?: 'center'): XlsxRow[number] {
  return { v, t: 's', bold: true, color: HDR_FG, bg: HDR_BG, align: align ?? 'left' }
}

export function generateXlsx(stickers: Record<string, Sticker>): Uint8Array {
  const data = buildRowData(stickers)
  const header: XlsxRow = [hdr('Código', 'center'), hdr('Seleção'), hdr('Grupo'), hdr('Número', 'center'), hdr('Status', 'center'), hdr('Qtd. Repetidas', 'center')]
  const rows: XlsxRow[] = data.map((r) => [
    { v: r.codigo, t: 's', bold: true, align: 'center' },
    { v: r.selecao, t: 's' },
    { v: r.grupo, t: 's' },
    { v: r.numero || r.codigo, t: r.numero ? 'n' : 's', align: 'center' },
    { v: translateStatus(r.status), t: 's', bold: true, color: scolor(r.status), align: 'center' },
    { v: r.repetidas, t: 'n', align: 'center' },
  ])
  return buildXlsx([header, ...rows], 'Album Panini 2026')
}

export function generateMissingXlsx(stickers: Record<string, Sticker>): Uint8Array {
  const data = buildRowData(stickers).filter((r) => r.status === 'missing')
  const header: XlsxRow = [hdr('Código', 'center'), hdr('Seleção'), hdr('Grupo'), hdr('Número', 'center')]
  const rows: XlsxRow[] = data.map((r) => [
    { v: r.codigo, t: 's', bold: true, color: C_MISSING, align: 'center' },
    { v: r.selecao, t: 's' },
    { v: r.grupo, t: 's' },
    { v: r.numero || r.codigo, t: r.numero ? 'n' : 's', align: 'center' },
  ])
  return buildXlsx([header, ...rows], 'Faltando')
}

export function generateDuplicatesXlsx(stickers: Record<string, Sticker>): Uint8Array {
  const data = buildRowData(stickers).filter((r) => r.status === 'duplicate')
  const header: XlsxRow = [hdr('Código', 'center'), hdr('Seleção'), hdr('Grupo'), hdr('Número', 'center'), hdr('Qtd. Repetidas', 'center')]
  const rows: XlsxRow[] = data.map((r) => [
    { v: r.codigo, t: 's', bold: true, color: C_DUP, align: 'center' },
    { v: r.selecao, t: 's' },
    { v: r.grupo, t: 's' },
    { v: r.numero || r.codigo, t: r.numero ? 'n' : 's', align: 'center' },
    { v: r.repetidas, t: 'n', align: 'center' },
  ])
  return buildXlsx([header, ...rows], 'Repetidas')
}

export function generateCSV(stickers: Record<string, Sticker>): string {
  const data = buildRowData(stickers)
  const header = 'Código,Seleção,Grupo,Número,Status,Qtd. Repetidas'
  const lines = data.map((r) => [r.codigo, `"${r.selecao}"`, `"${r.grupo}"`, r.numero || r.codigo, translateStatus(r.status), r.repetidas].join(','))
  return '\uFEFF' + [header, ...lines].join('\r\n')
}

export function downloadBlob(data: Uint8Array | string, filename: string, mimeType: string) {
  const blobData: BlobPart = data instanceof Uint8Array ? new Uint8Array(data) : data
  const blob = new Blob([blobData], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getTimestampedFilename(name: string, ext: string): string {
  return `${name}-${new Date().toISOString().slice(0, 10)}.${ext}`
}
