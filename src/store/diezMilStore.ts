import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DiezMilGameState, DiezMilConfig } from '../types'

const DEFAULT_STATE: DiezMilGameState = {
  config: { players: [], minEntry: 750, lastRound: true },
  players: [],
  currentPlayerIndex: 0,
  turnAccumulator: 0,
  lastRoundTriggeredBy: null,
  lastRoundPlayers: [],
  phase: 'setup',
  winner: null,
  startedAt: '',
  updatedAt: '',
}

interface DiezMilStore extends DiezMilGameState {
  startGame: (config: DiezMilConfig) => void
  addToAccumulator: (pts: number) => void
  removeFromAccumulator: (pts: number) => void
  clearAccumulator: () => void
  confirmTurn: () => void
  burnTurn: () => void
  resetGame: () => void
  abandonGame: () => void
}

export const useDiezMilStore = create<DiezMilStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      startGame: (config) => {
        set({
          ...DEFAULT_STATE,
          config,
          players: config.players.map((name) => ({
            name,
            totalScore: 0,
            turns: [],
            hasEntered: false,
          })),
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      addToAccumulator: (pts) => {
        set({ turnAccumulator: get().turnAccumulator + pts, updatedAt: new Date().toISOString() })
      },

      removeFromAccumulator: (pts) => {
        const next = Math.max(0, get().turnAccumulator - pts)
        set({ turnAccumulator: next, updatedAt: new Date().toISOString() })
      },

      clearAccumulator: () => {
        set({ turnAccumulator: 0, updatedAt: new Date().toISOString() })
      },

      confirmTurn: () => {
        const s = get()
        const player = s.players[s.currentPlayerIndex]
        const accumulated = s.turnAccumulator

        const wouldTotal = player.totalScore + accumulated
        if (wouldTotal > 10000) {
          // Over limit — just advance turn, no score
          const players = s.players.map((p, i) => {
            if (i !== s.currentPlayerIndex) return p
            return { ...p, turns: [...p.turns, { score: 0, burned: false }] }
          })
          set({ players, turnAccumulator: 0, ...advancePlayer(s, players), updatedAt: new Date().toISOString() })
          return
        }

        const newTotal = wouldTotal
        const hasEntered = player.hasEntered || accumulated >= s.config.minEntry
        const players = s.players.map((p, i) => {
          if (i !== s.currentPlayerIndex) return p
          return {
            ...p,
            totalScore: hasEntered ? newTotal : p.totalScore,
            hasEntered: hasEntered || p.hasEntered,
            turns: [...p.turns, { score: hasEntered ? accumulated : 0, burned: false }],
          }
        })

        const updatedPlayer = players[s.currentPlayerIndex]
        if (updatedPlayer.totalScore >= 10000) {
          if (s.config.lastRound && s.lastRoundTriggeredBy === null) {
            const lastRoundPlayers = players
              .map((_, i) => i)
              .filter((i) => i !== s.currentPlayerIndex)
            set({
              players,
              turnAccumulator: 0,
              lastRoundTriggeredBy: s.currentPlayerIndex,
              lastRoundPlayers,
              ...advancePlayer(s, players),
              updatedAt: new Date().toISOString(),
            })
            return
          }
          const maxScore = Math.max(...players.map((p) => p.totalScore))
          const winnerIdx = players.findIndex((p) => p.totalScore === maxScore)
          set({ players, turnAccumulator: 0, phase: 'end', winner: winnerIdx, updatedAt: new Date().toISOString() })
          return
        }

        set({ players, turnAccumulator: 0, ...advancePlayer(s, players), updatedAt: new Date().toISOString() })
      },

      burnTurn: () => {
        const s = get()
        const players = s.players.map((p, i) => {
          if (i !== s.currentPlayerIndex) return p
          return { ...p, turns: [...p.turns, { score: 0, burned: true }] }
        })

        if (s.lastRoundTriggeredBy !== null) {
          const remaining = s.lastRoundPlayers.filter((i) => i !== s.currentPlayerIndex)
          if (remaining.length === 0) {
            const maxScore = Math.max(...players.map((p) => p.totalScore))
            const winnerIdx = players.findIndex((p) => p.totalScore === maxScore)
            set({ players, turnAccumulator: 0, lastRoundPlayers: [], phase: 'end', winner: winnerIdx, updatedAt: new Date().toISOString() })
            return
          }
          set({ players, turnAccumulator: 0, lastRoundPlayers: remaining, ...advancePlayer(s, players), updatedAt: new Date().toISOString() })
          return
        }

        set({ players, turnAccumulator: 0, ...advancePlayer(s, players), updatedAt: new Date().toISOString() })
      },

      resetGame: () => {
        const { config } = get()
        set({
          ...DEFAULT_STATE,
          config,
          players: config.players.map((name) => ({ name, totalScore: 0, turns: [], hasEntered: false })),
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      abandonGame: () => set({ ...DEFAULT_STATE }),
    }),
    { name: 'tanto-diez-mil' }
  )
)

function advancePlayer(s: DiezMilGameState, players: DiezMilGameState['players']) {
  if (s.lastRoundTriggeredBy !== null && s.lastRoundPlayers.length > 0) {
    const nextInLastRound = s.lastRoundPlayers[0]
    return { currentPlayerIndex: nextInLastRound }
  }
  const next = (s.currentPlayerIndex + 1) % players.length
  return { currentPlayerIndex: next }
}
