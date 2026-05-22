import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GeneralaGameState, GeneralaCategory, GeneralaCategoryEntry, GeneralaPlayerState,
} from '../types'
import { GENERALA_CATEGORIES, GENERALA_BASE_SCORES, GENERALA_SERVED_BONUS } from '../types'

export function calcGeneralaScore(cat: GeneralaCategory, served: boolean, diceValue?: number): number {
  if (['ones','twos','threes','fours','fives','sixes'].includes(cat)) {
    return diceValue ?? 0
  }
  if (cat === 'generala') return 50         // servida gana la partida, score es siempre 50
  if (cat === 'generala_doble') return 100  // idem, score es siempre 100
  return GENERALA_BASE_SCORES[cat] + (served ? GENERALA_SERVED_BONUS[cat] : 0)
}

function makePlayer(name: string): GeneralaPlayerState {
  return { name, categories: {}, totalScore: 0 }
}

function recalcTotal(player: GeneralaPlayerState): number {
  return Object.values(player.categories).reduce((sum, e) => sum + (e?.score ?? 0), 0)
}

const DEFAULT_STATE: GeneralaGameState = {
  config: { players: [] },
  players: [],
  phase: 'setup',
  winner: null,
  instantWinner: null,
  startedAt: '',
  updatedAt: '',
}

interface GeneralaStore extends GeneralaGameState {
  startGame: (playerNames: string[]) => void
  recordEntry: (playerIndex: number, cat: GeneralaCategory, entry: GeneralaCategoryEntry) => void
  resetGame: () => void
  abandonGame: () => void
}

export const useGeneralaStore = create<GeneralaStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      startGame: (playerNames) => {
        set({
          ...DEFAULT_STATE,
          config: { players: playerNames },
          players: playerNames.map(makePlayer),
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      recordEntry: (playerIndex, cat, entry) => {
        const s = get()
        const players = s.players.map((p, i) => {
          if (i !== playerIndex) return p
          const categories = { ...p.categories, [cat]: entry }
          const totalScore = recalcTotal({ ...p, categories })
          return { ...p, categories, totalScore }
        })

        const isInstantWin =
          (cat === 'generala' || cat === 'generala_doble') && entry.served && !entry.crossed

        const allDone = players.every((p) =>
          GENERALA_CATEGORIES.every((c) => p.categories[c] !== undefined)
        )

        if (isInstantWin) {
          set({ players, instantWinner: playerIndex, phase: 'end', updatedAt: new Date().toISOString() })
        } else if (allDone) {
          const maxScore = Math.max(...players.map((p) => p.totalScore))
          const winnerIdx = players.findIndex((p) => p.totalScore === maxScore)
          set({ players, winner: winnerIdx, phase: 'end', updatedAt: new Date().toISOString() })
        } else {
          set({ players, updatedAt: new Date().toISOString() })
        }
      },

      resetGame: () => {
        const { config } = get()
        set({
          ...DEFAULT_STATE,
          config,
          players: config.players.map(makePlayer),
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      abandonGame: () => set({ ...DEFAULT_STATE }),
    }),
    { name: 'tanto-generala' }
  )
)
