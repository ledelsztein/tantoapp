export type GameType = 'truco' | 'basas' | 'generala' | 'diez_mil' | 'burako'
export type GamePhase = 'setup' | 'playing' | 'end'

// ─── Truco ───────────────────────────────────────────────────────────────────

export interface TrucoConfig {
  team1Name: string
  team2Name: string
  totalChicos: 1 | 2 | 3 | 4 | 5
  modalidad: 2 | 4 | 6
}

export interface TrucoTeam {
  points: number
  chicosWon: number
}

export interface TrucoChicoRecord {
  team1Points: number
  team2Points: number
  winner: 1 | 2
}

export interface TrucoGameState {
  config: TrucoConfig
  team1: TrucoTeam
  team2: TrucoTeam
  phase: GamePhase
  winner: 1 | 2 | null
  chicoHistory: TrucoChicoRecord[]
  startedAt: string
  updatedAt: string
}

// ─── Basas ────────────────────────────────────────────────────────────────────

export interface BasasConfig {
  players: string[]
  maxBazas: number
  format: 'ida' | 'ida_vuelta'
  firstDealerIndex: number
  direction: 'cw' | 'ccw'
}

export interface BasasRound {
  roundNumber: number
  bazasAvailable: number
  biddingOrder: number[]   // player indices in bid order for this round
  bids: (number | null)[]
  results: (number | null)[]
  scores: (number | null)[]
}

export type BasasRoundPhase = 'bidding' | 'results' | 'summary'

export interface BasasGameState {
  config: BasasConfig
  rounds: BasasRound[]
  roundSequence: number[]
  currentRoundIndex: number
  currentRoundDealerIndex: number
  currentPhase: BasasRoundPhase
  currentPlayerTurn: number  // position in biddingOrder (0..N-1)
  totalScores: number[]
  phase: GamePhase
  winner: number | null
  startedAt: string
  updatedAt: string
}

// ─── Generala ─────────────────────────────────────────────────────────────────

export type GeneralaCategory =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'escalera' | 'full' | 'poker' | 'generala' | 'generala_doble'

export const GENERALA_CATEGORIES: GeneralaCategory[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'escalera', 'full', 'poker', 'generala', 'generala_doble',
]

export const GENERALA_CATEGORY_LABELS: Record<GeneralaCategory, string> = {
  ones: '1',
  twos: '2',
  threes: '3',
  fours: '4',
  fives: '5',
  sixes: '6',
  escalera: 'Escalera',
  full: 'Full',
  poker: 'Póker',
  generala: 'Generala',
  generala_doble: 'Gen. Doble',
}

export const GENERALA_BASE_SCORES: Record<GeneralaCategory, number> = {
  ones: 0, twos: 0, threes: 0, fours: 0, fives: 0, sixes: 0,
  escalera: 20, full: 30, poker: 40, generala: 50, generala_doble: 100,
}

export const GENERALA_SERVED_BONUS: Record<GeneralaCategory, number> = {
  ones: 0, twos: 0, threes: 0, fours: 0, fives: 0, sixes: 0,
  escalera: 5, full: 5, poker: 5, generala: 0, generala_doble: 0,
}

export interface GeneralaCategoryEntry {
  score: number
  served: boolean
  crossed: boolean
}

export interface GeneralaPlayerState {
  name: string
  categories: Partial<Record<GeneralaCategory, GeneralaCategoryEntry>>
  totalScore: number
}

export interface GeneralaGameState {
  config: { players: string[] }
  players: GeneralaPlayerState[]
  phase: GamePhase
  winner: number | null
  instantWinner: number | null
  startedAt: string
  updatedAt: string
}

// ─── 10 Mil ───────────────────────────────────────────────────────────────────

export interface DiezMilConfig {
  players: string[]
  minEntry: number
  lastRound: boolean
}

export interface DiezMilTurn {
  score: number
  burned: boolean
}

export interface DiezMilPlayerState {
  name: string
  totalScore: number
  turns: DiezMilTurn[]
  hasEntered: boolean
}

export interface DiezMilGameState {
  config: DiezMilConfig
  players: DiezMilPlayerState[]
  currentPlayerIndex: number
  turnAccumulator: number
  lastRoundTriggeredBy: number | null
  lastRoundPlayers: number[]
  phase: GamePhase
  winner: number | null
  startedAt: string
  updatedAt: string
}

// ─── Burako ───────────────────────────────────────────────────────────────────

export interface BurakoConfig {
  team1Name: string
  team2Name: string
  objetivo: number
}

export interface BurakoTeamEntry {
  puras: number
  impuras: number
  cierre: boolean
  muerto: boolean
  fichasBajadas: number
  fichasAtril: number
}

export interface BurakoManoResult {
  entry: BurakoTeamEntry
  base: number
  puntos: number
  total: number
}

export interface BurakoMano {
  team1: BurakoManoResult
  team2: BurakoManoResult
}

export interface BurakoGameState {
  config: BurakoConfig
  manos: BurakoMano[]
  team1Score: number
  team2Score: number
  currentEntry: { team1: BurakoTeamEntry; team2: BurakoTeamEntry }
  phase: GamePhase
  winner: 1 | 2 | null
  startedAt: string
  updatedAt: string
}
