import type { Group, Team } from '../types'

export const GROUPS: Group[] = [
  {
    name: 'A',
    teams: [
      { code: 'MEX', name: 'México', group: 'A', iso: 'mx', color: '#006847' },
      { code: 'RSA', name: 'África do Sul', group: 'A', iso: 'za', color: '#007A4D' },
      { code: 'KOR', name: 'Coreia do Sul', group: 'A', iso: 'kr', color: '#C60C30' },
      { code: 'CZE', name: 'Rep. Tcheca', group: 'A', iso: 'cz', color: '#D7141A' },
    ],
  },
  {
    name: 'B',
    teams: [
      { code: 'CAN', name: 'Canadá', group: 'B', iso: 'ca', color: '#FF0000' },
      { code: 'BIH', name: 'Bósnia e Herz.', group: 'B', iso: 'ba', color: '#002395' },
      { code: 'QAT', name: 'Catar', group: 'B', iso: 'qa', color: '#8D1B3D' },
      { code: 'SUI', name: 'Suíça', group: 'B', iso: 'ch', color: '#FF0000' },
    ],
  },
  {
    name: 'C',
    teams: [
      { code: 'BRA', name: 'Brasil', group: 'C', iso: 'br', color: '#009C3B' },
      { code: 'MAR', name: 'Marrocos', group: 'C', iso: 'ma', color: '#C1272D' },
      { code: 'HAI', name: 'Haiti', group: 'C', iso: 'ht', color: '#00209F' },
      { code: 'SCO', name: 'Escócia', group: 'C', iso: 'gb-sct', color: '#003893' },
    ],
  },
  {
    name: 'D',
    teams: [
      { code: 'USA', name: 'Estados Unidos', group: 'D', iso: 'us', color: '#3C3B6E' },
      { code: 'PAR', name: 'Paraguai', group: 'D', iso: 'py', color: '#D52B1E' },
      { code: 'AUS', name: 'Austrália', group: 'D', iso: 'au', color: '#00008B' },
      { code: 'TUR', name: 'Turquia', group: 'D', iso: 'tr', color: '#E30A17' },
    ],
  },
  {
    name: 'E',
    teams: [
      { code: 'GER', name: 'Alemanha', group: 'E', iso: 'de', color: '#DDDDDD' },
      { code: 'CUW', name: 'Curaçao', group: 'E', iso: 'cw', color: '#003DA5' },
      { code: 'CIV', name: 'Costa do Marfim', group: 'E', iso: 'ci', color: '#F77F00' },
      { code: 'ECU', name: 'Equador', group: 'E', iso: 'ec', color: '#FFD100' },
    ],
  },
  {
    name: 'F',
    teams: [
      { code: 'NED', name: 'Holanda', group: 'F', iso: 'nl', color: '#FF6600' },
      { code: 'JPN', name: 'Japão', group: 'F', iso: 'jp', color: '#BC002D' },
      { code: 'SWE', name: 'Suécia', group: 'F', iso: 'se', color: '#006AA7' },
      { code: 'TUN', name: 'Tunísia', group: 'F', iso: 'tn', color: '#E70013' },
    ],
  },
  {
    name: 'G',
    teams: [
      { code: 'BEL', name: 'Bélgica', group: 'G', iso: 'be', color: '#EF3340' },
      { code: 'EGY', name: 'Egito', group: 'G', iso: 'eg', color: '#CE1126' },
      { code: 'IRN', name: 'Irã', group: 'G', iso: 'ir', color: '#239F40' },
      { code: 'NZL', name: 'Nova Zelândia', group: 'G', iso: 'nz', color: '#00247D' },
    ],
  },
  {
    name: 'H',
    teams: [
      { code: 'ESP', name: 'Espanha', group: 'H', iso: 'es', color: '#AA151B' },
      { code: 'CPV', name: 'Cabo Verde', group: 'H', iso: 'cv', color: '#003893' },
      { code: 'KSA', name: 'Arábia Saudita', group: 'H', iso: 'sa', color: '#006C35' },
      { code: 'URU', name: 'Uruguai', group: 'H', iso: 'uy', color: '#5EB6E4' },
    ],
  },
  {
    name: 'I',
    teams: [
      { code: 'FRA', name: 'França', group: 'I', iso: 'fr', color: '#002395' },
      { code: 'SEN', name: 'Senegal', group: 'I', iso: 'sn', color: '#00853F' },
      { code: 'IRQ', name: 'Iraque', group: 'I', iso: 'iq', color: '#CE1126' },
      { code: 'NOR', name: 'Noruega', group: 'I', iso: 'no', color: '#EF2B2D' },
    ],
  },
  {
    name: 'J',
    teams: [
      { code: 'ARG', name: 'Argentina', group: 'J', iso: 'ar', color: '#74ACDF' },
      { code: 'ALG', name: 'Argélia', group: 'J', iso: 'dz', color: '#006233' },
      { code: 'AUT', name: 'Áustria', group: 'J', iso: 'at', color: '#ED2939' },
      { code: 'JOR', name: 'Jordânia', group: 'J', iso: 'jo', color: '#007A3D' },
    ],
  },
  {
    name: 'K',
    teams: [
      { code: 'POR', name: 'Portugal', group: 'K', iso: 'pt', color: '#006600' },
      { code: 'COD', name: 'Congo (RDC)', group: 'K', iso: 'cd', color: '#007FFF' },
      { code: 'UZB', name: 'Uzbequistão', group: 'K', iso: 'uz', color: '#1EB53A' },
      { code: 'COL', name: 'Colômbia', group: 'K', iso: 'co', color: '#FCD116' },
    ],
  },
  {
    name: 'L',
    teams: [
      { code: 'ENG', name: 'Inglaterra', group: 'L', iso: 'gb-eng', color: '#CF081F' },
      { code: 'CRO', name: 'Croácia', group: 'L', iso: 'hr', color: '#FF0000' },
      { code: 'GHA', name: 'Gana', group: 'L', iso: 'gh', color: '#006B3F' },
      { code: 'PAN', name: 'Panamá', group: 'L', iso: 'pa', color: '#DA121A' },
    ],
  },
]

export const ALL_TEAMS: Team[] = GROUPS.flatMap((g) => g.teams)

export const TEAM_MAP: Record<string, Team> = Object.fromEntries(
  ALL_TEAMS.map((t) => [t.code, t])
)

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
