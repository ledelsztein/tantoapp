import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BasasGameState, BasasConfig, BasasRound } from '../types'

function buildRoundSequence(maxBazas: number, format: 'ida' | 'ida_vuelta'): number[] {
  const up: number[] = []
  for (let i = 1; i <= maxBazas; i++) up.push(i)
  const down: number[] = []
  for (let i = maxBazas - 1; i >= 1; i--) down.push(i)

  if (format === 'ida') return [...up, ...down]
  return [...up, ...up]
}

function makeRound(roundNumber: number, playerCount: number): BasasRound {
  return {
    roundNumber,
    bazasAvailable: roundNumber,
    bids: Array(playerCount).fill(null),
    results: Array(playerCount).fill(null),
    scores: Array(playerCount).fill(null),
  }
}

function calcScore(bid: number, result: number): number {
  if (bid === result) return 10 + 3 * bid
  return -3 * Math.abs(result - bid)
}

const DEFAULT_STATE: BasasGameState = {
  config: { players: [], maxBazas: 7, format: 'ida', firstDealerIndex: 0, direction: 'cw' },
  rounds: [],
  roundSequence: [],
  currentRoundIndex: 0,
  currentPhase: 'bidding',
  currentPlayerTurn: 0,
  totalScores: [],
  phase: 'setup',
  winner: null,
  startedAt: '',
  updatedAt: '',
}

interface BasasStore extends BasasGameState {
  startGame: (config: BasasConfig) => void
  submitBid: (bid: number) => void
  submitResult: (result: number) => void
  confirmRoundSummary: () => void
  correctRound: (roundIndex: number, playerIndex: number, bid: number | null, result: number | null) => void
  resetGame: () => void
  abandonGame: () => void
}

export const useBasasStore = create<BasasStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      startGame: (config) => {
        const seq = buildRoundSequence(config.maxBazas, config.format)
        const firstRound = makeRound(seq[0], config.players.length)
        set({
          ...DEFAULT_STATE,
          config,
          rounds: [firstRound],
          roundSequence: seq,
          currentRoundIndex: 0,
          currentPhase: 'bidding',
          currentPlayerTurn: 0,
          totalScores: Array(config.players.length).fill(0),
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      submitBid: (bid) => {
        const s = get()
        const rounds = [...s.rounds]
        const round = { ...rounds[s.currentRoundIndex] }
        const bids = [...round.bids]
        bids[s.currentPlayerTurn] = bid
        round.bids = bids
        rounds[s.currentRoundIndex] = round

        const nextPlayer = s.currentPlayerTurn + 1
        if (nextPlayer >= s.config.players.length) {
          set({ rounds, currentPhase: 'results', currentPlayerTurn: 0, updatedAt: new Date().toISOString() })
        } else {
          set({ rounds, currentPlayerTurn: nextPlayer, updatedAt: new Date().toISOString() })
        }
      },

      submitResult: (result) => {
        const s = get()
        const rounds = [...s.rounds]
        const round = { ...rounds[s.currentRoundIndex] }
        const results = [...round.results]
        const scores = [...round.scores]
        const bid = round.bids[s.currentPlayerTurn] ?? 0
        results[s.currentPlayerTurn] = result
        scores[s.currentPlayerTurn] = calcScore(bid, result)
        round.results = results
        round.scores = scores
        rounds[s.currentRoundIndex] = round

        const nextPlayer = s.currentPlayerTurn + 1
        if (nextPlayer >= s.config.players.length) {
          set({ rounds, currentPhase: 'summary', currentPlayerTurn: 0, updatedAt: new Date().toISOString() })
        } else {
          set({ rounds, currentPlayerTurn: nextPlayer, updatedAt: new Date().toISOString() })
        }
      },

      confirmRoundSummary: () => {
        const s = get()
        const round = s.rounds[s.currentRoundIndex]
        const newTotals = s.totalScores.map((t, i) => t + (round.scores[i] ?? 0))
        const nextIndex = s.currentRoundIndex + 1

        if (nextIndex >= s.roundSequence.length) {
          const maxScore = Math.max(...newTotals)
          const winnerIdx = newTotals.indexOf(maxScore)
          set({
            totalScores: newTotals,
            phase: 'end',
            winner: winnerIdx,
            updatedAt: new Date().toISOString(),
          })
        } else {
          const nextRound = makeRound(s.roundSequence[nextIndex], s.config.players.length)
          set({
            rounds: [...s.rounds, nextRound],
            currentRoundIndex: nextIndex,
            currentPhase: 'bidding',
            currentPlayerTurn: 0,
            totalScores: newTotals,
            updatedAt: new Date().toISOString(),
          })
        }
      },

      correctRound: (roundIndex, playerIndex, bid, result) => {
        const s = get()
        const rounds = s.rounds.map((r, ri) => {
          if (ri !== roundIndex) return r
          const bids = [...r.bids]
          const results = [...r.results]
          const scores = [...r.scores]
          if (bid !== null) bids[playerIndex] = bid
          if (result !== null) results[playerIndex] = result
          if (bids[playerIndex] !== null && results[playerIndex] !== null) {
            scores[playerIndex] = calcScore(bids[playerIndex]!, results[playerIndex]!)
          }
          return { ...r, bids, results, scores }
        })
        const newTotals = Array(s.config.players.length).fill(0)
        rounds.forEach((r) => {
          r.scores.forEach((sc, i) => { if (sc !== null) newTotals[i] += sc })
        })
        set({ rounds, totalScores: newTotals, updatedAt: new Date().toISOString() })
      },

      resetGame: () => {
        const { config } = get()
        const seq = buildRoundSequence(config.maxBazas, config.format)
        const firstRound = makeRound(seq[0], config.players.length)
        set({
          ...DEFAULT_STATE,
          config,
          rounds: [firstRound],
          roundSequence: seq,
          totalScores: Array(config.players.length).fill(0),
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      abandonGame: () => set({ ...DEFAULT_STATE }),
    }),
    { name: 'tanto-basas' }
  )
)
