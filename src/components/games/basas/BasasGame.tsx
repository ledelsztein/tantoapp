import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBasasStore } from '../../../store/basasStore'
import GameNav from '../../ui/GameNav'
import AdPlaceholder from '../../ui/AdPlaceholder'
import { Analytics, activeTimer } from '../../../lib/analytics'

function calcForbiddenBid(bids: (number | null)[], bazasAvailable: number): number | null {
  const sum = bids.reduce<number>((acc, b) => acc + (b ?? 0), 0)
  const forbidden = bazasAvailable - sum
  return forbidden >= 0 ? forbidden : null
}

// ─── Modal de edición de celda ────────────────────────────────────────────────

interface EditCellModalProps {
  roundIndex: number
  playerIndex: number
  roundNumber: number
  playerName: string
  currentBid: number | null
  currentResult: number | null
  maxBazas: number
  onClose: () => void
  onSave: (bid: number | null, result: number | null) => void
}

function EditCellModal({ playerName, roundNumber, currentBid, currentResult, maxBazas, onClose, onSave }: EditCellModalProps) {
  const [bid, setBid] = useState<number | null>(currentBid)
  const [result, setResult] = useState<number | null>(currentResult)

  const opts = Array.from({ length: maxBazas + 1 }, (_, i) => i)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-text font-semibold">{playerName} · Ronda {roundNumber}</h2>
          <button onClick={onClose} className="text-muted active:opacity-60">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="4" y1="4" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="14" y1="4" x2="4" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {[
          { label: 'Pujó', value: bid, set: setBid },
          { label: 'Ganó', value: result, set: setResult },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex flex-col gap-2">
            <p className="text-muted text-xs font-medium">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {opts.map(n => (
                <button key={n} onClick={() => set(n)}
                  className={`w-10 h-9 rounded-lg text-sm font-bold transition-colors ${value === n ? 'bg-accent text-bg' : 'bg-surface2 text-text'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button onClick={() => onSave(bid, result)}
          className="w-full h-12 rounded-xl bg-accent text-bg font-semibold active:scale-95 transition-transform">
          Guardar y recalcular
        </button>
      </div>
    </div>
  )
}

// ─── Scoreboard completo con edición ─────────────────────────────────────────

function FullScoreboard({ onClose, overrideTotals }: { onClose?: () => void; overrideTotals?: number[] }) {
  const s = useBasasStore()
  const displayTotals = overrideTotals ?? s.totalScores
  const [editCell, setEditCell] = useState<{ ri: number; pi: number } | null>(null)

  return (
    <div className={onClose ? 'fixed inset-0 z-50 flex flex-col bg-bg' : 'flex flex-col'}>
      {onClose && (
        <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-border">
          <h2 className="text-text font-semibold">Tabla de puntajes</h2>
          <button onClick={onClose} className="text-muted text-sm active:opacity-60">Cerrar</button>
        </div>
      )}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted text-xs py-2 pr-3 font-medium w-10">Ronda</th>
                {s.config.players.map((p, i) => (
                  <th key={i} className="text-center text-text text-xs py-2 px-1 font-medium">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.roundSequence.map((roundNum, ri) => {
                const played = s.rounds[ri]
                const isCurrent = ri === s.currentRoundIndex && s.currentPhase !== 'summary'
                const isPast = ri < s.currentRoundIndex
                const isEditable = played !== undefined  // rondas jugadas o en summary
                return (
                  <tr key={ri} className={`border-b border-border/30 ${isCurrent ? 'bg-accent/5' : ''}`}>
                    <td className={`text-xs py-2 pr-3 font-medium tabular-nums ${isCurrent ? 'text-accent' : 'text-muted'}`}>{roundNum}</td>
                    {s.config.players.map((_, pi) => {
                      const sc = played?.scores[pi]
                      const bid = played?.bids[pi]
                      const result = played?.results[pi]
                      return (
                        <td key={pi} className="text-center py-1.5 px-1">
                          {isEditable ? (
                            <button onClick={() => setEditCell({ ri, pi })}
                              className="w-full flex flex-col items-center gap-0.5 active:opacity-60 rounded-md py-0.5">
                              {sc !== null && sc !== undefined ? (
                                <>
                                  <span className="text-muted text-[10px] tabular-nums leading-none">
                                    {bid ?? '?'}/{result ?? '?'}
                                  </span>
                                  <span className={`text-xs font-semibold tabular-nums leading-none ${sc >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {sc > 0 ? `+${sc}` : sc}
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted/50 text-xs">·</span>
                              )}
                            </button>
                          ) : isPast ? (
                            <span className="text-muted text-xs">—</span>
                          ) : (
                            <span className="text-border/50 text-xs">·</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface2">
                <td className="text-muted text-xs py-2 pr-3 font-semibold">Total</td>
                {displayTotals.map((t, i) => (
                  <td key={i} className="text-center py-2 px-1">
                    <span className="text-text font-bold text-sm tabular-nums">{t}</span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
        {onClose && <p className="text-muted text-xs text-center mt-3">Tocá cualquier celda para editar</p>}
      </div>

      {editCell && (
        <EditCellModal
          roundIndex={editCell.ri}
          playerIndex={editCell.pi}
          roundNumber={s.roundSequence[editCell.ri]}
          playerName={s.config.players[editCell.pi]}
          currentBid={s.rounds[editCell.ri]?.bids[editCell.pi] ?? null}
          currentResult={s.rounds[editCell.ri]?.results[editCell.pi] ?? null}
          maxBazas={s.roundSequence[editCell.ri] ?? s.config.maxBazas}
          onClose={() => setEditCell(null)}
          onSave={(bid, result) => {
            s.editRoundEntry(editCell.ri, editCell.pi, bid, result)
            setEditCell(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function BasasGame() {
  const navigate = useNavigate()
  const s = useBasasStore()
  const [showScoreboard, setShowScoreboard] = useState(false)
  const [showAllWinWarning, setShowAllWinWarning] = useState(false)

  useEffect(() => {
    if (s.phase === 'end') {
      Analytics.gameComplete('basas', activeTimer.getSeconds(), { players: s.config.players.length, rounds: s.roundSequence.length })
      navigate('/basas/end')
    }
  }, [s.phase, navigate])

  useEffect(() => {
    if (s.phase === 'playing' && s.startedAt && Date.now() - new Date(s.startedAt).getTime() > 15000) {
      Analytics.gameResume('basas')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Detecta cuando se entra al summary con todos sumando
  useEffect(() => {
    if (s.currentPhase === 'summary') {
      const round = s.rounds[s.currentRoundIndex]
      if (round && round.scores.every(sc => sc !== null && (sc as number) > 0)) {
        setShowAllWinWarning(true)
      }
    } else {
      setShowAllWinWarning(false)
    }
  }, [s.currentPhase, s.currentRoundIndex])

  const handleScoreboardOpen = () => { Analytics.scoreboardOpen('basas'); setShowScoreboard(true) }
  const handleAbandon = () => { Analytics.gameAbandon('basas', activeTimer.getSeconds()); s.abandonGame(); navigate('/basas/setup') }

  const round = s.rounds[s.currentRoundIndex]
  if (!round) return null

  const bazas = round.roundNumber
  const currentPlayerIndex = round.biddingOrder[s.currentPlayerTurn]
  const playerName = s.config.players[currentPlayerIndex]
  const isLastTurn = s.currentPlayerTurn === s.config.players.length - 1
  const dealerName = s.config.players[s.currentRoundDealerIndex]

  const ScoreboardBtn = (
    <button onClick={handleScoreboardOpen}
      className="p-1.5 rounded-lg bg-surface2 text-muted active:scale-95 transition-transform">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    </button>
  )

  const ProgressBar = () => (
    <div className="px-4 pt-1 pb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-muted text-xs">Ronda {s.currentRoundIndex + 1} de {s.roundSequence.length} · {bazas} baza{bazas !== 1 ? 's' : ''}</span>
        <span className="text-muted text-xs">Reparte: <span className="text-accent">{dealerName}</span></span>
      </div>
      <div className="w-full bg-border rounded-full h-1">
        <div className="bg-accent h-1 rounded-full transition-all"
          style={{ width: `${((s.currentRoundIndex + 1) / s.roundSequence.length) * 100}%` }}/>
      </div>
    </div>
  )

  // ─── Bidding phase ───────────────────────────────────────────────────────────

  if (s.currentPhase === 'bidding') {
    const forbidden = isLastTurn ? calcForbiddenBid(round.bids, bazas) : null

    return (
      <div className="flex flex-col min-h-dvh bg-bg">
        <GameNav onReiniciarResultados={() => s.resetGame()}
          onNuevaPartida={handleAbandon}
          extraContent={ScoreboardBtn}/>
        <ProgressBar />

        <div className="flex-1 flex flex-col px-4 gap-5">
          <div className="text-center">
            <p className="text-muted text-xs mb-1">Turno {s.currentPlayerTurn + 1} de {s.config.players.length}</p>
            <h2 className="text-text text-2xl font-bold">{playerName}</h2>
            <p className="text-muted text-sm mt-1">¿Cuántas bazas puja?</p>
            <p className="text-muted text-xs mt-0.5">
              Suma de pujas: <span className="text-accent font-medium">{round.bids.reduce<number>((a, b) => a + (b ?? 0), 0)}</span>
            </p>
          </div>

          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: bazas + 1 }, (_, i) => i).map((n) => {
              const isForbidden = isLastTurn && n === forbidden
              return (
                <button key={n} onClick={() => !isForbidden && s.submitBid(n)} disabled={isForbidden}
                  className={`h-10 rounded-xl text-base font-bold transition-all active:scale-95 ${
                    isForbidden
                      ? 'bg-danger/10 text-danger/50 border border-danger/20 cursor-not-allowed line-through'
                      : 'bg-surface2 text-text'
                  }`}>
                  {n}
                </button>
              )
            })}
          </div>

          {isLastTurn && forbidden !== null && (
            <p className="text-danger/70 text-xs text-center -mt-2">
              No podés pujar {forbidden} (igualaría las bazas disponibles)
            </p>
          )}

          <div className="bg-surface rounded-xl p-3">
            <p className="text-muted text-xs mb-2">Orden de puja</p>
            {round.biddingOrder.map((pi, turn) => {
              const last3 = s.rounds
                .slice(0, s.currentRoundIndex)
                .map(r => r.bids[pi])
                .filter(b => b !== null)
                .slice(-3) as number[]
              return (
                <div key={pi} className={`flex items-center justify-between py-1.5 ${turn === s.currentPlayerTurn ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${turn === s.currentPlayerTurn ? 'text-text font-semibold' : 'text-muted'}`}>
                      {s.config.players[pi]}
                    </span>
                    {last3.length > 0 && (
                      <span className="text-muted text-[10px] tabular-nums">
                        {last3.join(' · ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {round.bids[pi] !== null && <span className="text-accent text-sm font-medium">{round.bids[pi]}</span>}
                    {turn === s.currentPlayerTurn && round.bids[pi] === null && <span className="text-accent text-xs">← ahora</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <AdPlaceholder />
        {showScoreboard && <FullScoreboard onClose={() => setShowScoreboard(false)} />}
      </div>
    )
  }

  // ─── Results phase ───────────────────────────────────────────────────────────

  if (s.currentPhase === 'results') {
    const bid = round.bids[currentPlayerIndex] ?? 0

    return (
      <div className="flex flex-col min-h-dvh bg-bg">
        <GameNav onReiniciarResultados={() => s.resetGame()}
          onNuevaPartida={handleAbandon}
          extraContent={ScoreboardBtn}/>
        <ProgressBar />

        <div className="flex-1 flex flex-col px-4 gap-5">
          <div className="text-center">
            <h2 className="text-text text-2xl font-bold">{playerName}</h2>
            <p className="text-muted text-sm mt-1">¿Cuántas bazas ganó?</p>
            <p className="text-muted text-xs mt-0.5">Pujó: <span className="text-accent font-medium">{bid}</span></p>
          </div>

          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: bazas + 1 }, (_, i) => i).map((n) => {
              const wouldScore = n === bid ? 10 + 3 * bid : -3 * Math.abs(n - bid)
              return (
                <button key={n} onClick={() => s.submitResult(n)}
                  className="h-10 rounded-xl bg-surface2 text-text font-bold text-base active:scale-95 transition-all flex flex-col items-center justify-center gap-0">
                  <span className="text-sm leading-none">{n}</span>
                  <span className={`text-[9px] leading-none mt-0.5 ${wouldScore >= 0 ? 'text-success' : 'text-danger'}`}>
                    {wouldScore > 0 ? `+${wouldScore}` : wouldScore}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="bg-surface rounded-xl p-3">
            <p className="text-muted text-xs mb-2">Resultados</p>
            {round.biddingOrder.map((pi, turn) => (
              <div key={pi} className={`flex items-center justify-between py-1.5 ${turn === s.currentPlayerTurn ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`text-sm ${turn === s.currentPlayerTurn ? 'text-text font-semibold' : 'text-muted'}`}>
                  {s.config.players[pi]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-xs">pujó {round.bids[pi]}</span>
                  {round.scores[pi] !== null && (
                    <span className={`text-sm font-medium tabular-nums ${round.scores[pi]! >= 0 ? 'text-success' : 'text-danger'}`}>
                      {round.scores[pi]! > 0 ? `+${round.scores[pi]}` : round.scores[pi]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <AdPlaceholder />
        {showScoreboard && <FullScoreboard onClose={() => setShowScoreboard(false)} />}
      </div>
    )
  }

  // ─── Summary phase ────────────────────────────────────────────────────────────

  // Totales incluyendo la ronda actual (aún no confirmada)
  const pendingTotals = s.totalScores.map((t, i) => t + (round.scores[i] ?? 0))

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <GameNav center={`Ronda ${round.roundNumber}`}
        onReiniciarResultados={() => s.resetGame()}
        onNuevaPartida={handleAbandon}
        extraContent={ScoreboardBtn}/>

      <div className="flex-1 px-4 py-3 overflow-y-auto">
        <p className="text-muted text-xs font-medium uppercase tracking-widest mb-3">
          Resultado — Ronda {round.roundNumber}
        </p>

        {/* Compact per-player result — ordenado de mayor a menor puntaje */}
        <div className="bg-surface rounded-2xl overflow-hidden mb-4">
          {[...round.biddingOrder].sort((a, b) => (round.scores[b] ?? 0) - (round.scores[a] ?? 0)).map((pi) => {
            const bid = round.bids[pi] ?? 0
            const result = round.results[pi] ?? 0
            const score = round.scores[pi] ?? 0
            const hit = bid === result
            return (
              <div key={pi} className={`flex items-center justify-between px-4 py-3 border-b border-border/40 last:border-0`}>
                <span className="text-text font-medium text-sm">{s.config.players[pi]}</span>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-muted text-[10px]">Pidió</p>
                    <p className="text-text font-bold tabular-nums">{bid}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted text-[10px]">Ganó</p>
                    <p className={`font-bold tabular-nums ${hit ? 'text-success' : 'text-danger'}`}>{result}</p>
                  </div>
                  <div className="text-center min-w-[3rem]">
                    <p className="text-muted text-[10px]">Puntos</p>
                    <p className={`font-bold tabular-nums text-sm ${score >= 0 ? 'text-success' : 'text-danger'}`}>
                      {score > 0 ? `+${score}` : score}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Totales pendientes (ya incluyen esta ronda) */}
        <div className="flex gap-2">
          {s.config.players.map((name, i) => (
            <div key={i} className="flex-1 bg-surface2 rounded-xl px-2 py-2 text-center">
              <p className="text-muted text-[10px] truncate">{name}</p>
              <p className="text-text font-bold tabular-nums text-sm">{pendingTotals[i]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-2">
        <button onClick={() => { Analytics.roundComplete('basas', round.roundNumber); s.confirmRoundSummary() }}
          className="w-full h-14 rounded-xl bg-accent text-bg font-semibold text-base active:scale-95 transition-transform">
          {s.currentRoundIndex + 1 >= s.roundSequence.length ? 'Finalizar partida' : 'Siguiente ronda'}
        </button>
        <button onClick={handleScoreboardOpen}
          className="w-full h-12 rounded-xl border border-accent text-accent font-medium text-sm active:scale-95 transition-transform">
          Ver tabla
        </button>
      </div>
      <AdPlaceholder />
      {showScoreboard && <FullScoreboard onClose={() => setShowScoreboard(false)} overrideTotals={pendingTotals} />}

      {/* Warning: todos los jugadores sumaron */}
      {showAllWinWarning && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-text font-bold text-base">Todos suman</h2>
              <p className="text-muted text-sm">
                La regla de bazas no permite que todos acierten. Revisá los resultados.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setShowAllWinWarning(false); s.resetCurrentRoundResults() }}
                className="w-full h-12 rounded-xl bg-accent text-bg font-semibold active:scale-95 transition-transform">
                Revisar resultados
              </button>
              <button
                onClick={() => setShowAllWinWarning(false)}
                className="w-full h-11 rounded-xl border border-border text-muted text-sm active:scale-95 transition-transform">
                Continuar igual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
