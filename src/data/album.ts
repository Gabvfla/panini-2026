import type { Group, Team } from '../types'

export const GROUPS: Group[] = [
  {
    name: 'A',
    teams: [
      { code: 'MEX', name: 'México', group: 'A' },
      { code: 'RSA', name: 'África do Sul', group: 'A' },
      { code: 'KOR', name: 'Coreia do Sul', group: 'A' },
      { code: 'CZE', name: 'República Tcheca', group: 'A' },
    ],
  },
  {
    name: 'B',
    teams: [
      { code: 'CAN', name: 'Canadá', group: 'B' },
      { code: 'BIH', name: 'Bósnia e Herzegovina', group: 'B' },
      { code: 'QAT', name: 'Catar', group: 'B' },
      { code: 'SUI', name: 'Suíça', group: 'B' },
    ],
  },
  {
    name: 'C',
    teams: [
      { code: 'BRA', name: 'Brasil', group: 'C' },
      { code: 'MAR', name: 'Marrocos', group: 'C' },
      { code: 'HAI', name: 'Haiti', group: 'C' },
      { code: 'SCO', name: 'Escócia', group: 'C' },
    ],
  },
  {
    name: 'D',
    teams: [
      { code: 'USA', name: 'Estados Unidos', group: 'D' },
      { code: 'PAR', name: 'Paraguai', group: 'D' },
      { code: 'AUS', name: 'Austrália', group: 'D' },
      { code: 'TUR', name: 'Turquia', group: 'D' },
    ],
  },
  {
    name: 'E',
    teams: [
      { code: 'GER', name: 'Alemanha', group: 'E' },
      { code: 'CUW', name: 'Curaçao', group: 'E' },
      { code: 'CIV', name: 'Costa do Marfim', group: 'E' },
      { code: 'ECU', name: 'Equador', group: 'E' },
    ],
  },
  {
    name: 'F',
    teams: [
      { code: 'NED', name: 'Holanda', group: 'F' },
      { code: 'JPN', name: 'Japão', group: 'F' },
      { code: 'SWE', name: 'Suécia', group: 'F' },
      { code: 'TUN', name: 'Tunísia', group: 'F' },
    ],
  },
  {
    name: 'G',
    teams: [
      { code: 'BEL', name: 'Bélgica', group: 'G' },
      { code: 'EGY', name: 'Egito', group: 'G' },
      { code: 'IRN', name: 'Irã', group: 'G' },
      { code: 'NZL', name: 'Nova Zelândia', group: 'G' },
    ],
  },
  {
    name: 'H',
    teams: [
      { code: 'ESP', name: 'Espanha', group: 'H' },
      { code: 'CPV', name: 'Cabo Verde', group: 'H' },
      { code: 'KSA', name: 'Arábia Saudita', group: 'H' },
      { code: 'URU', name: 'Uruguai', group: 'H' },
    ],
  },
  {
    name: 'I',
    teams: [
      { code: 'FRA', name: 'França', group: 'I' },
      { code: 'SEN', name: 'Senegal', group: 'I' },
      { code: 'IRQ', name: 'Iraque', group: 'I' },
      { code: 'NOR', name: 'Noruega', group: 'I' },
    ],
  },
  {
    name: 'J',
    teams: [
      { code: 'ARG', name: 'Argentina', group: 'J' },
      { code: 'ALG', name: 'Argélia', group: 'J' },
      { code: 'AUT', name: 'Áustria', group: 'J' },
      { code: 'JOR', name: 'Jordânia', group: 'J' },
    ],
  },
  {
    name: 'K',
    teams: [
      { code: 'POR', name: 'Portugal', group: 'K' },
      { code: 'COD', name: 'Congo (RDC)', group: 'K' },
      { code: 'UZB', name: 'Uzbequistão', group: 'K' },
      { code: 'COL', name: 'Colômbia', group: 'K' },
    ],
  },
  {
    name: 'L',
    teams: [
      { code: 'ENG', name: 'Inglaterra', group: 'L' },
      { code: 'CRO', name: 'Croácia', group: 'L' },
      { code: 'GHA', name: 'Gana', group: 'L' },
      { code: 'PAN', name: 'Panamá', group: 'L' },
    ],
  },
]

export const ALL_TEAMS: Team[] = GROUPS.flatMap((g) => g.teams)

export const SPECIAL_STICKERS: string[] = [
  '00',
  ...Array.from({ length: 19 }, (_, i) => `FWC${i + 1}`),
]

export const STICKERS_PER_TEAM = 20

export function generateAllStickerIds(): string[] {
  const ids: string[] = [...SPECIAL_STICKERS]
  for (const team of ALL_TEAMS) {
    for (let i = 1; i <= STICKERS_PER_TEAM; i++) {
      ids.push(`${team.code}${i}`)
    }
  }
  return ids
}

export const ALL_STICKER_IDS = generateAllStickerIds()

export const TOTAL_STICKERS = ALL_STICKER_IDS.length
