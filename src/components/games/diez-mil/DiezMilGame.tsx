import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDiezMilStore } from '../../../store/diezMilStore'
import Modal from '../../ui/Modal'
import GameNav from '../../ui/GameNav'
import AdPlaceholder from '../../ui/AdPlaceholder'
import { Analytics, activeTimer } from '../../../lib/analytics'

const SHORTCUTS = [
  { label: '+50', value: 50 },
  { label: '+100', value: 100 },
  { label: '+500', value: 500 },
  { label: '+1.000', value: 1000 },
]

export default function DiezMilGame() {
  const navigate = useNavigate()
  const s = useDiezMilStore()
  const [overLimitWarning, setOverLimitWarning] = useState(false)
  // history of added values this turn for undo
  const [addHistory, setAddHistory] = useState<number[]>([])

  useEffect(() => {
    if (s.phase === 'end') {
      Analytics.gameComplete('diez_mil', activeTimer.getSeconds(), { players: s.players.length })
      navigate('/diez-mil/end')
    }
  }, [s.phase, navigate])

  useEffect(() => {
    if (s.phase === 'playing' && s.startedAt && Date.now() - new Date(s.startedAt).getTime() > 15000) {
      Analytics.gameResume('diez_mil')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset undo history when player changes
  useEffect(() => {
    setAddHistory([])
  }, [s.currentPlayerIndex])

  const player = s.players[s.currentPlayerIndex]
  if (!player) return null

  const acc = s.turnAccumulator
  const wouldTotal = player.totalScore + acc

  const handleShortcut = (val: number) => {
    if (wouldTotal + val > 10000) {
      setOverLimitWarning(true)
      return
    }
    s.addToAccumulator(val)
    setAddHistory((h) => [...h, val])
  }

  const handleUndo = () => {
    if (addHistory.length === 0) return
    const last = addHistory[addHistory.length - 1]
    s.removeFromAccumulator(last)
    setAddHistory((h) => h.slice(0, -1))
  }

  const handleConfirm = () => {
    if (wouldTotal > 10000) { setOverLimitWarning(true); return }
    s.confirmTurn()
    setAddHistory([])
  }

  const handleBurn = () => {
    Analytics.burnTurn()
    s.burnTurn()
    setAddHistory([])
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <GameNav
        onReiniciarResultados={() => { s.resetGame(); setAddHistory([]) }}
        onNuevaPartida={() => { Analytics.gameAbandon('diez_mil', activeTimer.getSeconds()); s.abandonGame(); navigate('/diez-mil/setup') }}
      />

      {/* Last round banner */}
      {s.lastRoundTriggeredBy !== null && (
        <div className="mx-4 mb-2 px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-xl">
          <p className="text-accent text-xs text-center font-medium">
            {s.players[s.lastRoundTriggeredBy]?.name} llegó a 10.000 — todos tienen una última vuelta
          </p>
        </div>
      )}

      {/* Player scores */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto">
          {s.players.map((p, i) => {
            const isCurrent = i === s.currentPlayerIndex
            const pct = Math.min(100, (p.totalScore / 10000) * 100)
            return (
              <div key={i} className={`flex-1 min-w-0 rounded-xl p-3 ${isCurrent ? 'bg-surface border border-accent/30' : 'bg-surface2'}`}>
                <p className={`text-xs truncate mb-1 ${isCurrent ? 'text-accent font-medium' : 'text-muted'}`}>{p.name}</p>
                <p className={`text-lg font-bold tabular-nums leading-none ${isCurrent ? 'text-text' : 'text-muted'}`}>
                  {p.hasEntered ? p.totalScore.toLocaleString('es') : '—'}
                </p>
                <div className="w-full bg-border rounded-full h-1 mt-2">
                  <div className="bg-accent/60 h-1 rounded-full transition-all" style={{ width: `${pct}%` }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current turn */}
      <div className="mx-4 bg-surface rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted text-sm">Turno de</span>
          <span className="text-text font-bold">{player.name}</span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-muted text-xs mb-0.5">Este turno</p>
            <p className="text-5xl font-bold text-text tabular-nums leading-none">
              {acc > 0 ? acc.toLocaleString('es') : '0'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted text-xs mb-0.5">Total si confirma</p>
            <p className={`text-xl font-bold tabular-nums ${wouldTotal > 10000 ? 'text-danger' : wouldTotal === 10000 ? 'text-success' : 'text-text'}`}>
              {(player.hasEntered ? wouldTotal : acc).toLocaleString('es')}
            </p>
          </div>
        </div>

        {!player.hasEntered && acc < s.config.minEntry && (
          <p className="text-muted text-xs mt-2.5 text-center border-t border-border/50 pt-2.5">
            Necesitás {s.config.minEntry.toLocaleString('es')} pts en un turno para entrar
          </p>
        )}
      </div>

      {/* 4 shortcuts */}
      <div className="flex-1 px-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {SHORTCUTS.map((sc) => (
            <button key={sc.value} onClick={() => handleShortcut(sc.value)}
              className="h-20 rounded-2xl bg-surface2 text-text font-bold text-2xl active:scale-95 transition-transform">
              {sc.label}
            </button>
          ))}
        </div>

        {/* Undo + clear row */}
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={addHistory.length === 0}
            className="flex-1 h-11 rounded-xl bg-surface2 text-muted text-sm font-medium active:scale-95 transition-transform disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 5H9a4 4 0 0 1 0 8H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2 5L5 2M2 5L5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Deshacer {addHistory.length > 0 && `(${addHistory[addHistory.length - 1] >= 1000 ? (addHistory[addHistory.length-1]/1000).toFixed(0)+'k' : addHistory[addHistory.length-1]})`}
          </button>
          <button
            onClick={() => { s.clearAccumulator(); setAddHistory([]) }}
            disabled={acc === 0}
            className="flex-1 h-11 rounded-xl bg-surface2 text-muted text-sm font-medium active:scale-95 transition-transform disabled:opacity-30"
          >
            Borrar todo
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-4 flex gap-2">
        <button onClick={handleBurn}
          className="flex-1 h-13 rounded-xl bg-danger/15 text-danger border border-danger/20 font-semibold active:scale-95 transition-transform py-3">
          Se quemó
        </button>
        <button onClick={handleConfirm} disabled={acc === 0}
          className="flex-1 h-13 rounded-xl bg-accent text-bg font-semibold active:scale-95 transition-transform disabled:opacity-40 py-3">
          Confirmar
        </button>
      </div>

      <AdPlaceholder />

      <Modal
        open={overLimitWarning}
        title="Supera los 10.000"
        message="El puntaje acumulado supera los 10.000. El turno no es válido y se pierde."
        confirmLabel="Perder turno"
        cancelLabel="Seguir jugando"
        onConfirm={() => { handleBurn(); setOverLimitWarning(false) }}
        onCancel={() => setOverLimitWarning(false)}
        danger
      />
    </div>
  )
}
