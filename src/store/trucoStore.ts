import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrucoGameState, TrucoConfig, TrucoTeam } from '../types'

const DEFAULT_STATE: TrucoGameState & { lastTeamState: { team1: TrucoTeam; team2: TrucoTeam } | null } = {
  config: { team1Name: 'Nosotros', team2Name: 'Ellos', totalChicos: 2, modalidad: 4 },
  team1: { points: 0, chicosWon: 0 },
  team2: { points: 0, chicosWon: 0 },
  phase: 'setup',
  winner: null,
  chicoHistory: [],
  lastTeamState: null,
  startedAt: '',
  updatedAt: '',
}

interface TrucoStore extends TrucoGameState {
  lastTeamState: { team1: TrucoTeam; team2: TrucoTeam } | null
  startGame: (config: TrucoConfig) => void
  addPoints: (team: 1 | 2, pts: number) => void
  setPoints: (team: 1 | 2, pts: number) => void
  setTeamName: (team: 1 | 2, name: string) => void
  undoLast: () => void
  resetGame: () => void
  abandonGame: () => void
  goToSetup: () => void
}

export const useTrucoStore = create<TrucoStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      startGame: (config) => {
        set({ ...DEFAULT_STATE, config, phase: 'playing', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      },

      addPoints: (team, pts) => {
        const s = get()
        const key = team === 1 ? 'team1' : 'team2'
        const current = s[key]
        const newPoints = current.points + pts

        // Guardar estado anterior para deshacer
        const snapshot = { team1: s.team1, team2: s.team2 }

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
              lastTeamState: snapshot,
              [key]: { points: 30, chicosWon: newChicosWon },
              chicoHistory: [...s.chicoHistory, record],
              phase: 'end',
              winner: team,
              updatedAt: new Date().toISOString(),
            })
          } else {
            set({
              lastTeamState: snapshot,
              [key]: { points: 0, chicosWon: newChicosWon },
              [otherKey]: { ...other, points: 0 },
              chicoHistory: [...s.chicoHistory, record],
              updatedAt: new Date().toISOString(),
            })
          }
        } else {
          set({
            lastTeamState: snapshot,
            [key]: { ...current, points: newPoints },
            updatedAt: new Date().toISOString(),
          })
        }
      },

      undoLast: () => {
        const { lastTeamState } = get()
        if (!lastTeamState) return
        set({ team1: lastTeamState.team1, team2: lastTeamState.team2, lastTeamState: null, updatedAt: new Date().toISOString() })
      },

      setPoints: (team, pts) => {
        const key = team === 1 ? 'team1' : 'team2'
        const current = get()[key]
        set({ [key]: { ...current, points: Math.max(0, Math.min(30, pts)) }, updatedAt: new Date().toISOString() })
      },

      setTeamName: (team, name) => {
        const { config } = get()
        set({ config: { ...config, [team === 1 ? 'team1Name' : 'team2Name']: name }, updatedAt: new Date().toISOString() })
      },

      resetGame: () => {
        const { config } = get()
        set({ ...DEFAULT_STATE, config, phase: 'playing', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      },

      abandonGame: () => set({ ...DEFAULT_STATE }),
      goToSetup: () => set({ ...DEFAULT_STATE }),
    }),
    { name: 'tanto-truco' }
  )
)
