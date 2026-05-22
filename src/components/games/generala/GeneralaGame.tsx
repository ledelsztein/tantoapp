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
  const [served, setServed] = useState(false)
  const [crossed, setCrossed] = useState(!canFill)
  const [numericVal, setNumericVal] = useState(0)

  const isNumeric = NUMERIC_CATS.has(category)
  const diceVal = DICE_VALUES[category]
  const canServe = !isNumeric
  const label = GENERALA_CATEGORY_LABELS[category]

  const previewScore = crossed ? 0 : isNumeric
    ? numericVal
    : calcGeneralaScore(category, served)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <h2 className="text-text text-lg font-semibold text-center">{label}</h2>

        {!canFill && (
          <p className="text-muted text-xs text-center bg-surface2 rounded-lg px-3 py-2">
            Necesitás tener Generala anotada para completar esta categoría
          </p>
        )}

        {canFill && !crossed && (
          <>
            {isNumeric && (
              <div className="flex flex-col gap-2">
                <p className="text-muted text-xs text-center">¿Cuánto puntaje suma?</p>
                <div className="flex gap-2">
                  {[0,1,2,3,4,5].map((n) => (
                    <button key={n} onClick={() => setNumericVal(n * diceVal)}
                      className={`flex-1 h-11 rounded-xl text-sm font-bold transition-colors ${numericVal === n * diceVal ? 'bg-accent text-bg' : 'bg-surface2 text-text'}`}>
                      {n * diceVal}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {canServe && (
              <button onClick={() => setServed(!served)}
                className={`flex items-center justify-between px-4 h-12 rounded-xl border transition-colors ${served ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface2 text-muted'}`}>
                <span className="text-sm font-medium">Servida</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${served ? 'border-accent bg-accent' : 'border-muted'}`}>
                  {served && <div className="w-2 h-2 rounded-full bg-bg"/>}
                </div>
              </button>
            )}
            {(category === 'generala' || category === 'generala_doble') && served && (
              <p className="text-success text-xs text-center font-medium">¡Gana la partida al instante!</p>
            )}
          </>
        )}

        <button onClick={() => setCrossed(!crossed)}
          className={`flex items-center justify-between px-4 h-12 rounded-xl border transition-colors ${crossed ? 'border-danger bg-danger/10 text-danger' : 'border-border bg-surface2 text-muted'}`}>
          <span className="text-sm font-medium">Tachar (0 pts)</span>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${crossed ? 'border-danger bg-danger' : 'border-muted'}`}>
            {crossed && <div className="w-2 h-2 rounded-full bg-bg"/>}
          </div>
        </button>

        <div className="flex items-center justify-between px-1">
          <span className="text-muted text-sm">Puntaje</span>
          <span className={`text-2xl font-bold tabular-nums ${previewScore > 0 ? 'text-text' : 'text-muted'}`}>{previewScore}</span>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl bg-surface2 text-muted font-medium">Cancelar</button>
          <button onClick={() => onConfirm(previewScore, served, crossed)}
            className="flex-1 h-12 rounded-xl bg-accent text-bg font-medium">Confirmar</button>
        </div>
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
    const state = getCellState(pi, cat)
    if (state === 'crossed') return // tachada = no editable
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
                              disabled={state === 'crossed'}
                              className={`w-full h-9 rounded-lg transition-all flex items-center justify-center ${
                                state === 'crossed'
                                  ? 'bg-danger/5 cursor-default'
                                  : state === 'filled'
                                  ? 'bg-surface2/50 active:scale-95'
                                  : 'bg-surface2 active:scale-95'
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
