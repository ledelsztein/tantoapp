import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeneralaStore, calcGeneralaScore } from '../../../store/generalaStore'
import type { GeneralaCategory } from '../../../types'
import { GENERALA_CATEGORIES, GENERALA_CATEGORY_LABELS } from '../../../types'
import GameNav from '../../ui/GameNav'
import AdPlaceholder from '../../ui/AdPlaceholder'

const NUMERIC_CATS = new Set(['ones','twos','threes','fours','fives','sixes'])
const DICE_VALUES: Record<string, number> = { ones:1, twos:2, threes:3, fours:4, fives:5, sixes:6 }

const CAT_SECTION_BREAK_AFTER = 'sixes' // línea divisoria después de los numéricos

interface EntryModalProps {
  category: GeneralaCategory
  canFill: boolean  // false = solo se puede tachar
  onClose: () => void
  onConfirm: (score: number, served: boolean, crossed: boolean) => void
}

function EntryModal({ category, canFill, onClose, onConfirm }: EntryModalProps) {
  const isNumeric = NUMERIC_CATS.has(category)
  const diceVal = DICE_VALUES[category]
  const isSpecial = category === 'generala' || category === 'generala_doble'
  const label = GENERALA_CATEGORY_LABELS[category]

  const scoreNormal = calcGeneralaScore(category, false)
  const scoreServed = calcGeneralaScore(category, true)

  const record = (score: number, served: boolean, crossed: boolean) =>
    onConfirm(score, served, crossed)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface rounded-2xl p-5 flex flex-col gap-3 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-text text-lg font-semibold">{label}</h2>
          <button onClick={onClose} className="text-muted active:opacity-60 p-1">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="4" y1="4" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="14" y1="4" x2="4" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {!canFill && (
          <p className="text-muted text-xs bg-surface2 rounded-lg px-3 py-2">
            Necesitás tener Generala anotada para completar esta categoría
          </p>
        )}

        {canFill && (
          isNumeric ? (
            <>
              <p className="text-muted text-xs text-center">¿Cuánto puntaje suma?</p>
              <div className="flex gap-2">
                {[0,1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => record(n * diceVal, false, false)}
                    className="flex-1 h-11 rounded-xl bg-surface2 text-text text-sm font-bold active:scale-95 transition-all active:bg-accent active:text-bg">
                    {n * diceVal}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => record(scoreNormal, false, false)}
                className="flex-1 h-14 rounded-xl bg-surface2 text-text font-semibold active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5">
                <span className="text-xs text-muted">Normal</span>
                <span className="text-lg font-bold tabular-nums">{scoreNormal}</span>
              </button>
              <button onClick={() => record(scoreServed, true, false)}
                className="flex-1 h-14 rounded-xl bg-accent/10 border border-accent/40 text-accent font-semibold active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5">
                <span className="text-xs opacity-70">Servida</span>
                <span className="text-lg font-bold tabular-nums">
                  {isSpecial ? '★ Gana' : scoreServed}
                </span>
              </button>
            </div>
          )
        )}

        {/* Tachar — siempre disponible */}
        <button onClick={() => record(0, false, true)}
          className="h-11 rounded-xl border border-danger/40 text-danger text-sm font-medium active:scale-95 transition-all active:bg-danger/10">
          Tachar (0 pts)
        </button>
      </div>
    </div>
  )
}

export default function GeneralaGame() {
  const navigate = useNavigate()
  const s = useGeneralaStore()
  const [entryTarget, setEntryTarget] = useState<{ playerIndex: number; cat: GeneralaCategory } | null>(null)

  useEffect(() => {
    if (s.phase === 'end') navigate('/generala/end')
  }, [s.phase, navigate])

  if (s.players.length === 0) return null

  // Determine if a player has generala filled (not crossed)
  const playerHasGenerala = (pi: number) => {
    const e = s.players[pi]?.categories['generala']
    return !!e && !e.crossed
  }

  const getCellState = (pi: number, cat: GeneralaCategory) => {
    const entry = s.players[pi]?.categories[cat]
    if (!entry) return 'available'
    if (entry.crossed) return 'crossed'
    return 'filled'
  }

  const handleCellTap = (pi: number, cat: GeneralaCategory) => {
    setEntryTarget({ playerIndex: pi, cat })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <GameNav
        onReiniciarResultados={() => s.resetGame()}
        onNuevaPartida={() => { s.abandonGame(); navigate('/generala/setup') }}
      />

      {/* Scrollable table — columna de categorías sticky */}
      <div className="flex-1 overflow-auto pb-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: `${36 + s.players.length * 70}px` }}>
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-bg text-left text-muted text-xs py-1.5 pr-1 font-medium w-8 pl-4">
                  Cat.
                </th>
                {s.players.map((p, i) => (
                  <th key={i} className="text-center text-text text-xs py-1.5 px-1 font-semibold" style={{ minWidth: 64 }}>
                    <div className="truncate">{p.name}</div>
                    <div className="text-accent font-bold text-sm tabular-nums">{p.totalScore}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GENERALA_CATEGORIES.map((cat) => {
                const isBreak = cat === CAT_SECTION_BREAK_AFTER

                return (
                  <>
                    <tr key={cat} className="border-b border-border/20">
                      <td className="sticky left-0 z-10 bg-bg text-muted text-xs py-1 pr-1 font-semibold pl-4 w-8">
                        {GENERALA_CATEGORY_LABELS[cat]}
                      </td>
                      {s.players.map((_, pi) => {
                        const state = getCellState(pi, cat)
                        const entry = s.players[pi]?.categories[cat]

                        return (
                          <td key={pi} className="text-center px-1 py-0.5">
                            <button
                              onClick={() => handleCellTap(pi, cat)}
                              className={`w-full h-9 rounded-lg transition-all flex items-center justify-center active:scale-95 ${
                                state === 'crossed'
                                  ? 'bg-danger/5'
                                  : state === 'filled'
                                  ? 'bg-surface2/50'
                                  : 'bg-surface2'
                              }`}
                            >
                              {state === 'crossed' && <span className="text-danger/50 text-sm">—</span>}
                              {state === 'filled' && entry && (
                                <div className="flex flex-col items-center gap-0">
                                  <span className="text-text text-sm font-bold tabular-nums leading-tight">{entry.score}</span>
                                  {entry.served && <span className="text-success text-[8px] leading-none">✦</span>}
                                </div>
                              )}
                              {state === 'available' && (
                                <span className="text-border/60 text-base">·</span>
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                    {isBreak && (
                      <tr key={`${cat}-divider`}>
                        <td colSpan={s.players.length + 1} className="py-0 sticky left-0">
                          <div className="h-px bg-border/40 my-0.5"/>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface2 border-t border-border">
                <td className="sticky left-0 z-10 bg-surface2 text-muted text-xs py-2 font-semibold pl-4">Total</td>
                {s.players.map((p, i) => (
                  <td key={i} className="text-center px-1 py-2">
                    <span className="text-text font-bold text-sm tabular-nums">{p.totalScore}</span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <AdPlaceholder />

      {entryTarget && (
        <EntryModal
          category={entryTarget.cat}
          canFill={entryTarget.cat !== 'generala_doble' || playerHasGenerala(entryTarget.playerIndex)}
          onClose={() => setEntryTarget(null)}
          onConfirm={(score, served, crossed) => {
            s.recordEntry(entryTarget.playerIndex, entryTarget.cat, { score, served, crossed })
            setEntryTarget(null)
          }}
        />
      )}
    </div>
  )
}
