import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBasasStore } from '../../../store/basasStore'
import GameNav from '../../ui/GameNav'
import AdPlaceholder from '../../ui/AdPlaceholder'

function calcForbiddenBid(bids: (number | null)[], bazasAvailable: number): number | null {
  const sumSoFar = bids.reduce<number>((acc, b) => acc + (b ?? 0), 0)
  const forbidden = bazasAvailable - sumSoFar
  return forbidden >= 0 ? forbidden : null
}

function ScoreboardModal({ onClose }: { onClose: () => void }) {
  const s = useBasasStore()
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-border">
        <h2 className="text-text font-semibold">Tabla de puntajes</h2>
        <button onClick={onClose} className="text-muted text-sm active:opacity-60">Cerrar</button>
      </div>
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted text-xs py-2 pr-3 font-medium">Ronda</th>
                {s.config.players.map((p, i) => (
                  <th key={i} className="text-center text-text text-xs py-2 px-1 font-medium">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rounds.map((r, ri) => (
                <tr key={ri} className={`border-b border-border/40 ${ri === s.currentRoundIndex ? 'bg-accent/5' : ''}`}>
                  <td className="text-muted text-xs py-2 pr-3">{r.roundNumber}</td>
                  {r.scores.map((sc, si) => (
                    <td key={si} className="text-center py-2 px-1">
                      {sc === null ? (
                        <span className="text-border text-xs">—</span>
                      ) : (
                        <span className={`text-xs font-medium tabular-nums ${sc >= 0 ? 'text-success' : 'text-danger'}`}>
                          {sc > 0 ? `+${sc}` : sc}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface2">
                <td className="text-muted text-xs py-2 pr-3 font-semibold">Total</td>
                {s.totalScores.map((t, i) => (
                  <td key={i} className="text-center py-2 px-1">
                    <span className="text-text font-bold text-sm tabular-nums">{t}</span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function BasasGame() {
  const navigate = useNavigate()
  const s = useBasasStore()
  const [showScoreboard, setShowScoreboard] = useState(false)

  useEffect(() => {
    if (s.phase === 'end') navigate('/basas/end')
  }, [s.phase, navigate])

  const round = s.rounds[s.currentRoundIndex]
  if (!round) return null

  const bazas = round.roundNumber
  const playerName = s.config.players[s.currentPlayerTurn]

  const ScoreboardBtn = (
    <button
      onClick={() => setShowScoreboard(true)}
      className="p-1.5 rounded-lg bg-surface2 text-muted active:scale-95 transition-transform"
      aria-label="Ver tabla"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    </button>
  )

  const ProgressBar = () => (
    <div className="px-4 pt-2 pb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-muted text-xs">Ronda {s.currentRoundIndex + 1} de {s.roundSequence.length}</span>
        <span className="text-muted text-xs">{bazas} baza{bazas !== 1 ? 's' : ''}</span>
      </div>
      <div className="w-full bg-border rounded-full h-1">
        <div
          className="bg-accent h-1 rounded-full transition-all"
          style={{ width: `${((s.currentRoundIndex + 1) / s.roundSequence.length) * 100}%` }}
        />
      </div>
    </div>
  )

  // Bidding phase
  if (s.currentPhase === 'bidding') {
    const isLast = s.currentPlayerTurn === s.config.players.length - 1
    const forbidden = isLast ? calcForbiddenBid(round.bids.slice(0, -1), bazas) : null

    return (
      <div className="flex flex-col min-h-dvh bg-bg">
        <GameNav
          onReiniciarResultados={() => s.resetGame()}
          onNuevaPartida={() => { s.abandonGame(); navigate('/basas/setup') }}
          extraContent={ScoreboardBtn}
        />
        <ProgressBar />

        <div className="flex-1 flex flex-col px-4 gap-5">
          <div className="text-center">
            <p className="text-muted text-sm mb-1">Puja</p>
            <h2 className="text-text text-2xl font-bold">{playerName}</h2>
            {round.bids.some(b => b !== null) && (
              <p className="text-muted text-xs mt-1">
                Suma de pujas: {round.bids.reduce<number>((a, b) => a + (b ?? 0), 0)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: bazas + 1 }, (_, i) => i).map((n) => {
              const isForbidden = isLast && n === forbidden
              return (
                <button
                  key={n}
                  onClick={() => !isForbidden && s.submitBid(n)}
                  disabled={isForbidden}
                  className={`h-14 rounded-xl text-lg font-bold transition-all active:scale-95 ${
                    isForbidden
                      ? 'bg-danger/10 text-danger/50 border border-danger/20 cursor-not-allowed line-through'
                      : 'bg-surface2 text-text'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>

          {isLast && forbidden !== null && (
            <p className="text-danger/70 text-xs text-center">
              No podés pujar {forbidden} (la suma igualaría las bazas disponibles)
            </p>
          )}

          <div className="bg-surface rounded-xl p-3">
            <p className="text-muted text-xs mb-2">Orden de puja</p>
            {s.config.players.map((p, i) => (
              <div key={i} className={`flex items-center justify-between py-1.5 ${i === s.currentPlayerTurn ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`text-sm ${i === s.currentPlayerTurn ? 'text-text font-semibold' : 'text-muted'}`}>{p}</span>
                <div className="flex items-center gap-2">
                  {round.bids[i] !== null && <span className="text-accent text-sm font-medium">{round.bids[i]}</span>}
                  {i === s.currentPlayerTurn && round.bids[i] === null && <span className="text-accent text-xs">← ahora</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <AdPlaceholder />
        {showScoreboard && <ScoreboardModal onClose={() => setShowScoreboard(false)} />}
      </div>
    )
  }

  // Results phase
  if (s.currentPhase === 'results') {
    const bid = round.bids[s.currentPlayerTurn] ?? 0
    return (
      <div className="flex flex-col min-h-dvh bg-bg">
        <GameNav
          onReiniciarResultados={() => s.resetGame()}
          onNuevaPartida={() => { s.abandonGame(); navigate('/basas/setup') }}
          extraContent={ScoreboardBtn}
        />
        <ProgressBar />

        <div className="flex-1 flex flex-col px-4 gap-5">
          <div className="text-center">
            <p className="text-muted text-sm mb-1">Bazas ganadas</p>
            <h2 className="text-text text-2xl font-bold">{playerName}</h2>
            <p className="text-muted text-xs mt-1">Pujó: {bid}</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: bazas + 1 }, (_, i) => i).map((n) => {
              const wouldScore = n === bid ? 10 + 3 * bid : -3 * Math.abs(n - bid)
              return (
                <button key={n} onClick={() => s.submitResult(n)}
                  className="h-14 rounded-xl bg-surface2 text-text font-bold text-lg active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5">
                  <span>{n}</span>
                  <span className={`text-[10px] font-normal ${wouldScore >= 0 ? 'text-success' : 'text-danger'}`}>
                    {wouldScore > 0 ? `+${wouldScore}` : wouldScore}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="bg-surface rounded-xl p-3">
            <p className="text-muted text-xs mb-2">Ingresando resultados</p>
            {s.config.players.map((p, i) => (
              <div key={i} className={`flex items-center justify-between py-1.5 ${i === s.currentPlayerTurn ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`text-sm ${i === s.currentPlayerTurn ? 'text-text font-semibold' : 'text-muted'}`}>{p}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-xs">pujó {round.bids[i]}</span>
                  {round.scores[i] !== null && (
                    <span className={`text-sm font-medium tabular-nums ${round.scores[i]! >= 0 ? 'text-success' : 'text-danger'}`}>
                      {round.scores[i]! > 0 ? `+${round.scores[i]}` : round.scores[i]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <AdPlaceholder />
        {showScoreboard && <ScoreboardModal onClose={() => setShowScoreboard(false)} />}
      </div>
    )
  }

  // Summary phase
  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <GameNav
        center={`Ronda ${round.roundNumber}`}
        onReiniciarResultados={() => s.resetGame()}
        onNuevaPartida={() => { s.abandonGame(); navigate('/basas/setup') }}
        extraContent={ScoreboardBtn}
      />

      <div className="flex-1 px-4 overflow-y-auto py-3">
        <p className="text-muted text-xs text-center mb-3">Resumen de ronda</p>
        <div className="bg-surface rounded-2xl overflow-hidden">
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `1fr repeat(${s.config.players.length}, 1fr)` }}>
            <div className="px-3 py-2 text-muted text-xs">Ronda</div>
            {s.config.players.map((p, i) => (
              <div key={i} className="px-2 py-2 text-center text-xs font-medium text-text truncate">{p}</div>
            ))}
          </div>
          {s.rounds.map((r, ri) => (
            <div key={ri} className={`grid border-b border-border last:border-0 ${ri === s.currentRoundIndex ? 'bg-accent/5' : ''}`} style={{ gridTemplateColumns: `1fr repeat(${s.config.players.length}, 1fr)` }}>
              <div className="px-3 py-2 text-muted text-xs">{r.roundNumber}</div>
              {r.scores.map((sc, si) => (
                <div key={si} className="px-2 py-2 text-center">
                  <span className={`text-xs font-medium tabular-nums ${sc === null ? 'text-muted' : sc >= 0 ? 'text-success' : 'text-danger'}`}>
                    {sc === null ? '—' : sc > 0 ? `+${sc}` : sc}
                  </span>
                </div>
              ))}
            </div>
          ))}
          <div className="grid bg-surface2" style={{ gridTemplateColumns: `1fr repeat(${s.config.players.length}, 1fr)` }}>
            <div className="px-3 py-2 text-muted text-xs font-semibold">Total</div>
            {s.totalScores.map((t, i) => (
              <div key={i} className="px-2 py-2 text-center">
                <span className="text-sm font-bold text-text tabular-nums">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <button onClick={s.confirmRoundSummary}
          className="w-full h-14 rounded-xl bg-accent text-bg font-semibold text-base active:scale-95 transition-transform">
          {s.currentRoundIndex + 1 >= s.roundSequence.length ? 'Finalizar partida' : 'Siguiente ronda'}
        </button>
      </div>
      <AdPlaceholder />
      {showScoreboard && <ScoreboardModal onClose={() => setShowScoreboard(false)} />}
    </div>
  )
}
