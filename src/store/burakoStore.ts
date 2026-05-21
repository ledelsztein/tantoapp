import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BurakoGameState, BurakoConfig, BurakoTeamEntry, BurakoManoResult } from '../types'

const DEFAULT_ENTRY: BurakoTeamEntry = {
  puras: 0, impuras: 0, cierre: false, muerto: false, fichasBajadas: 0, fichasAtril: 0,
}

function calcEntry(e: BurakoTeamEntry): BurakoManoResult {
  const base = e.puras * 200 + e.impuras * 100 + (e.cierre ? 100 : 0) - (e.muerto ? 100 : 0)
  const puntos = e.fichasBajadas - e.fichasAtril
  return { entry: e, base, puntos, total: base + puntos }
}

const DEFAULT_STATE: BurakoGameState = {
  config: { team1Name: 'Nosotros', team2Name: 'Ellos', objetivo: 3000 },
  manos: [],
  team1Score: 0,
  team2Score: 0,
  currentEntry: { team1: { ...DEFAULT_ENTRY }, team2: { ...DEFAULT_ENTRY } },
  phase: 'setup',
  winner: null,
  startedAt: '',
  updatedAt: '',
}

interface BurakoStore extends BurakoGameState {
  startGame: (config: BurakoConfig) => void
  updateEntry: (team: 1 | 2, update: Partial<BurakoTeamEntry>) => void
  confirmMano: () => void
  editLastMano: (team: 1 | 2, update: Partial<BurakoTeamEntry>) => void
  resetGame: () => void
  abandonGame: () => void
}

export const useBurakoStore = create<BurakoStore>()(
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

      updateEntry: (team, update) => {
        const { currentEntry } = get()
        const key = team === 1 ? 'team1' : 'team2'
        set({
          currentEntry: { ...currentEntry, [key]: { ...currentEntry[key], ...update } },
          updatedAt: new Date().toISOString(),
        })
      },

      confirmMano: () => {
        const s = get()
        const r1 = calcEntry(s.currentEntry.team1)
        const r2 = calcEntry(s.currentEntry.team2)
        const newMano = { team1: r1, team2: r2 }
        const newT1 = s.team1Score + r1.total
        const newT2 = s.team2Score + r2.total
        const manos = [...s.manos, newMano]

        const winner =
          newT1 >= s.config.objetivo && newT2 >= s.config.objetivo
            ? newT1 >= newT2 ? 1 : 2
            : newT1 >= s.config.objetivo ? 1
            : newT2 >= s.config.objetivo ? 2
            : null

        set({
          manos,
          team1Score: newT1,
          team2Score: newT2,
          currentEntry: { team1: { ...DEFAULT_ENTRY }, team2: { ...DEFAULT_ENTRY } },
          phase: winner ? 'end' : 'playing',
          winner,
          updatedAt: new Date().toISOString(),
        })
      },

      editLastMano: (team, update) => {
        const s = get()
        if (s.manos.length === 0) return
        const key = team === 1 ? 'team1' : 'team2'
        const last = s.manos[s.manos.length - 1]
        const newEntry = { ...last[key].entry, ...update }
        const newResult = calcEntry(newEntry)
        const updatedMano = { ...last, [key]: newResult }
        const manos = [...s.manos.slice(0, -1), updatedMano]
        const t1 = manos.reduce((acc, m) => acc + m.team1.total, 0)
        const t2 = manos.reduce((acc, m) => acc + m.team2.total, 0)
        set({ manos, team1Score: t1, team2Score: t2, updatedAt: new Date().toISOString() })
      },

      resetGame: () => {
        const { config } = get()
        set({ ...DEFAULT_STATE, config, phase: 'playing', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      },

      abandonGame: () => set({ ...DEFAULT_STATE }),
    }),
    { name: 'tanto-burako' }
  )
)
