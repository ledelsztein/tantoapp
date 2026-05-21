import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrucoGameState, TrucoConfig } from '../types'

const DEFAULT_STATE: TrucoGameState = {
  config: { team1Name: 'Nosotros', team2Name: 'Ellos', totalChicos: 3, modalidad: 4 },
  team1: { points: 0, chicosWon: 0 },
  team2: { points: 0, chicosWon: 0 },
  phase: 'setup',
  winner: null,
  chicoHistory: [],
  startedAt: '',
  updatedAt: '',
}

interface TrucoStore extends TrucoGameState {
  startGame: (config: TrucoConfig) => void
  addPoints: (team: 1 | 2, pts: number) => void
  setPoints: (team: 1 | 2, pts: number) => void
  setTeamName: (team: 1 | 2, name: string) => void
  resetGame: () => void
  abandonGame: () => void
  goToSetup: () => void
}

export const useTrucoStore = create<TrucoStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      startGame: (config) => {
        set({
          ...DEFAULT_STATE,
          config,
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      addPoints: (team, pts) => {
        const s = get()
        const key = team === 1 ? 'team1' : 'team2'
        const current = s[key]
        const newPoints = current.points + pts

        if (newPoints >= 30) {
          const otherKey = team === 1 ? 'team2' : 'team1'
          const other = s[otherKey]
          const newChicosWon = current.chicosWon + 1
          const record = {
            team1Points: team === 1 ? 30 : current.points,
            team2Points: team === 2 ? 30 : other.points,
            winner: team,
          }

          if (newChicosWon >= s.config.totalChicos) {
            set({
              [key]: { points: 30, chicosWon: newChicosWon },
              chicoHistory: [...s.chicoHistory, record],
              phase: 'end',
              winner: team,
              updatedAt: new Date().toISOString(),
            })
          } else {
            set({
              [key]: { points: 0, chicosWon: newChicosWon },
              [otherKey]: { ...other, points: 0 },
              chicoHistory: [...s.chicoHistory, record],
              updatedAt: new Date().toISOString(),
            })
          }
        } else {
          set({
            [key]: { ...current, points: newPoints },
            updatedAt: new Date().toISOString(),
          })
        }
      },

      setPoints: (team, pts) => {
        const key = team === 1 ? 'team1' : 'team2'
        const current = get()[key]
        const clamped = Math.max(0, Math.min(30, pts))
        set({
          [key]: { ...current, points: clamped },
          updatedAt: new Date().toISOString(),
        })
      },

      resetGame: () => {
        const { config } = get()
        set({
          ...DEFAULT_STATE,
          config,
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      setTeamName: (team, name) => {
        const { config } = get()
        const key = team === 1 ? 'team1Name' : 'team2Name'
        set({ config: { ...config, [key]: name }, updatedAt: new Date().toISOString() })
      },

      abandonGame: () => {
        set({ ...DEFAULT_STATE })
      },

      goToSetup: () => {
        set({ ...DEFAULT_STATE })
      },
    }),
    { name: 'tanto-truco' }
  )
)
