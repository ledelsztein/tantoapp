import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BasasGameState, BasasConfig, BasasRound } from '../types'

function buildRoundSequence(maxBazas: number, format: 'ida' | 'ida_vuelta'): number[] {
  const up = Array.from({ length: maxBazas }, (_, i) => i + 1)       // [1..N]
  const down = Array.from({ length: maxBazas }, (_, i) => maxBazas - i) // [N..1]
  if (format === 'ida') return [...up, ...down]   // 1..N, N..1 (N aparece 2 veces)
  return [...up, ...up]                            // 1..N, 1..N
}

function getBiddingOrder(playerCount: number, dealerIndex: number, direction: 'cw' | 'ccw'): number[] {
  const step = direction === 'cw' ? 1 : playerCount - 1
  return Array.from({ length: playerCount }, (_, i) => (dealerIndex + i * step) % playerCount)
}

function makeRound(roundNumber: number, playerCount: number, biddingOrder: number[]): BasasRound {
  return {
    roundNumber,
    bazasAvailable: roundNumber,
    biddingOrder,
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
  currentRoundDealerIndex: 0,
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
  resetGame: () => void
  abandonGame: () => void
}

export const useBasasStore = create<BasasStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      startGame: (config) => {
        const seq = buildRoundSequence(config.maxBazas, config.format)
        const order = getBiddingOrder(config.players.length, config.firstDealerIndex, config.direction)
        const firstRound = makeRound(seq[0], config.players.length, order)
        set({
          ...DEFAULT_STATE,
          config,
          rounds: [firstRound],
          roundSequence: seq,
          currentRoundDealerIndex: config.firstDealerIndex,
          totalScores: Array(config.players.length).fill(0),
          phase: 'playing',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      },

      submitBid: (bid) => {
        const s = get()
        const round = { ...s.rounds[s.currentRoundIndex] }
        const playerIndex = round.biddingOrder[s.currentPlayerTurn]
        const bids = [...round.bids]
        bids[playerIndex] = bid
        round.bids = bids
        const rounds = [...s.rounds]
        rounds[s.currentRoundIndex] = round

        const nextTurn = s.currentPlayerTurn + 1
        if (nextTurn >= s.config.players.length) {
          set({ rounds, currentPhase: 'results', currentPlayerTurn: 0, updatedAt: new Date().toISOString() })
        } else {
          set({ rounds, currentPlayerTurn: nextTurn, updatedAt: new Date().toISOString() })
        }
      },

      submitResult: (result) => {
        const s = get()
        const round = { ...s.rounds[s.currentRoundIndex] }
        const playerIndex = round.biddingOrder[s.currentPlayerTurn]
        const results = [...round.results]
        const scores = [...round.scores]
        const bid = round.bids[playerIndex] ?? 0
        results[playerIndex] = result
        scores[playerIndex] = calcScore(bid, result)
        round.results = results
        round.scores = scores
        const rounds = [...s.rounds]
        rounds[s.currentRoundIndex] = round

        const nextTurn = s.currentPlayerTurn + 1
        if (nextTurn >= s.config.players.length) {
          set({ rounds, currentPhase: 'summary', currentPlayerTurn: 0, updatedAt: new Date().toISOString() })
        } else {
          set({ rounds, currentPlayerTurn: nextTurn, updatedAt: new Date().toISOString() })
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
          set({ totalScores: newTotals, phase: 'end', winner: winnerIdx, updatedAt: new Date().toISOString() })
        } else {
          const step = s.config.direction === 'cw' ? 1 : s.config.players.length - 1
          const nextDealer = (s.currentRoundDealerIndex + step) % s.config.players.length
          const nextOrder = getBiddingOrder(s.config.players.length, nextDealer, s.config.direction)
          const nextRound = makeRound(s.roundSequence[nextIndex], s.config.players.length, nextOrder)
          set({
            rounds: [...s.rounds, nextRound],
            currentRoundIndex: nextIndex,
            currentRoundDealerIndex: nextDealer,
            currentPhase: 'bidding',
            currentPlayerTurn: 0,
            totalScores: newTotals,
            updatedAt: new Date().toISOString(),
          })
        }
      },

      resetGame: () => {
        const { config } = get()
        const seq = buildRoundSequence(config.maxBazas, config.format)
        const order = getBiddingOrder(config.players.length, config.firstDealerIndex, config.direction)
        const firstRound = makeRound(seq[0], config.players.length, order)
        set({
          ...DEFAULT_STATE,
          config,
          rounds: [firstRound],
          roundSequence: seq,
          currentRoundDealerIndex: config.firstDealerIndex,
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
