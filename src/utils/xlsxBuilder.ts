function crc32(buf: Uint8Array): number {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}


function u16le(n: number): Uint8Array {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff])
}

function u32le(n: number): Uint8Array {
  const b = new Uint8Array(4)
  b[0] = n & 0xff; b[1] = (n >> 8) & 0xff; b[2] = (n >> 16) & 0xff; b[3] = (n >> 24) & 0xff
  return b
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

interface ZipEntry {
  name: Uint8Array
  data: Uint8Array
  crc: number
  offset: number
}

function buildZip(files: { name: string; content: string }[]): Uint8Array {
  const enc = new TextEncoder()
  const entries: ZipEntry[] = []
  const localParts: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = enc.encode(file.name)
    const dataBytes = enc.encode(file.content)
    const crc = crc32(dataBytes)
    const size = dataBytes.length

    const local = concat(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      u16le(20), u16le(0), u16le(0),
      u16le(0), u16le(0),
      u32le(crc), u32le(size), u32le(size),
      u16le(nameBytes.length), u16le(0),
      nameBytes, dataBytes
    )

    entries.push({ name: nameBytes, data: dataBytes, crc, offset })
    localParts.push(local)
    offset += local.length
  }

  const centralParts: Uint8Array[] = []
  for (const e of entries) {
    const size = e.data.length
    const central = concat(
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
      u16le(20), u16le(20), u16le(0), u16le(0),
      u16le(0), u16le(0),
      u32le(e.crc), u32le(size), u32le(size),
      u16le(e.name.length), u16le(0), u16le(0),
      u16le(0), u16le(0), u32le(0),
      u32le(e.offset),
      e.name
    )
    centralParts.push(central)
  }

  const centralBytes = concat(...centralParts)
  const centralOffset = offset
  const centralSize = centralBytes.length

  const eocd = concat(
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    u16le(0), u16le(0),
    u16le(entries.length), u16le(entries.length),
    u32le(centralSize), u32le(centralOffset),
    u16le(0)
  )

  return concat(...localParts, centralBytes, eocd)
}

function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export interface XlsxCell {
  v: string | number
  t: 's' | 'n'
  bold?: boolean
  color?: string
  bg?: string
  align?: 'left' | 'center' | 'right'
}

export type XlsxRow = XlsxCell[]

function buildXlsx(rows: XlsxRow[], sheetName = 'Sheet1'): Uint8Array {
  const sharedStrings: string[] = []
  const ssIndex: Map<string, number> = new Map()

  function getSS(s: string): number {
    if (ssIndex.has(s)) return ssIndex.get(s)!
    const i = sharedStrings.length
    sharedStrings.push(s)
    ssIndex.set(s, i)
    return i
  }

  const styleMap: Map<string, number> = new Map()
  const fonts: string[] = [
    '<font><sz val="11"/><name val="Calibri"/></font>',
  ]
  const fills: string[] = [
    '<fill><patternFill patternType="none"/></fill>',
    '<fill><patternFill patternType="gray125"/></fill>',
  ]
  const borders: string[] = ['<border><left/><right/><top/><bottom/><diagonal/></border>']
  const xfs: string[] = [
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
  ]

  function getStyleId(cell: XlsxCell): number {
    const key = `${cell.bold ? 1 : 0}|${cell.color ?? ''}|${cell.bg ?? ''}|${cell.align ?? ''}`
    if (styleMap.has(key)) return styleMap.get(key)!

    let fontId = 0
    if (cell.bold || cell.color) {
      const fcolor = cell.color ? `<color rgb="${cell.color}"/>` : ''
      const fbold = cell.bold ? '<b/>' : ''
      fonts.push(`<font>${fbold}<sz val="11"/><name val="Calibri"/>${fcolor}</font>`)
      fontId = fonts.length - 1
    }

    let fillId = 0
    if (cell.bg) {
      fills.push(`<fill><patternFill patternType="solid"><fgColor rgb="${cell.bg}"/></patternFill></fill>`)
      fillId = fills.length - 1
    }

    const alignAttr = cell.align ? ` applyAlignment="1"` : ''
    const alignEl = cell.align ? `<alignment horizontal="${cell.align}"/>` : ''
    xfs.push(
      `<xf numFmtId="0" fontId="${fontId}" fillId="${fillId}" borderId="0" xfId="0"${alignAttr}>${alignEl}</xf>`
    )
    const id = xfs.length - 1
    styleMap.set(key, id)
    return id
  }

  const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  const sheetRows = rows.map((row, ri) => {
    const cells = row.map((cell, ci) => {
      const col = colLetters[ci]
      const ref = `${col}${ri + 1}`
      const s = getStyleId(cell)
      if (cell.t === 'n') {
        return `<c r="${ref}" s="${s}"><v>${cell.v}</v></c>`
      } else {
        const si = getSS(String(cell.v))
        return `<c r="${ref}" t="s" s="${s}"><v>${si}</v></c>`
      }
    }).join('')
    return `<row r="${ri + 1}">${cells}</row>`
  }).join('')

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<cols>
<col min="1" max="1" width="10" customWidth="1"/>
<col min="2" max="2" width="22" customWidth="1"/>
<col min="3" max="3" width="14" customWidth="1"/>
<col min="4" max="4" width="9" customWidth="1"/>
<col min="5" max="5" width="14" customWidth="1"/>
<col min="6" max="6" width="16" customWidth="1"/>
</cols>
<sheetData>${sheetRows}</sheetData>
</worksheet>`

  const ssXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">
${sharedStrings.map((s) => `<si><t>${escXml(s)}</t></si>`).join('')}
</sst>`

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="${fonts.length}">${fonts.join('')}</fonts>
<fills count="${fills.length}">${fills.join('')}</fills>
<borders count="${borders.length}">${borders.join('')}</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs>
</styleSheet>`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${escXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

  const appRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

  return buildZip([
    { name: '[Content_Types].xml', content: contentTypes },
    { name: '_rels/.rels', content: appRels },
    { name: 'xl/workbook.xml', content: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', content: wbRels },
    { name: 'xl/worksheets/sheet1.xml', content: sheetXml },
    { name: 'xl/sharedStrings.xml', content: ssXml },
    { name: 'xl/styles.xml', content: stylesXml },
  ])
}

export { buildXlsx }
