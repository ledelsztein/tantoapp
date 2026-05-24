import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrucoStore } from '../../../store/trucoStore'
import TrucoCaja from './TrucoCaja'
import GameNav from '../../ui/GameNav'
import AdPlaceholder from '../../ui/AdPlaceholder'
import { Analytics, activeTimer } from '../../../lib/analytics'

function ChicoDots({ won, total }: { won: number; total: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: Math.max(total, won) }).map((_, i) => (
        <span key={i} className={`w-3 h-3 rounded-full ${i < won ? 'bg-accent' : 'bg-border'}`} />
      ))}
    </div>
  )
}

interface EditNameModalProps {
  open: boolean
  team: 1 | 2
  current: string
  onClose: () => void
  onConfirm: (name: string) => void
}

function EditNameModal({ open, team, current, onClose, onConfirm }: EditNameModalProps) {
  const [val, setVal] = useState(current)
  useEffect(() => { if (open) setVal(current) }, [open, current])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
        <h2 className="text-text text-lg font-semibold text-center">Nombre equipo {team}</h2>
        <input type="text" value={val} onChange={(e) => setVal(e.target.value)}
          className="bg-surface2 text-text rounded-xl px-4 h-12 outline-none text-center text-lg"
          maxLength={10} autoFocus />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl bg-surface2 text-muted font-medium">Cancelar</button>
          <button onClick={() => onConfirm(val.trim() || current)} className="flex-1 h-12 rounded-xl bg-accent text-bg font-medium">Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default function TrucoGame() {
  const navigate = useNavigate()
  const s = useTrucoStore()
  const [editNameTeam, setEditNameTeam] = useState<1 | 2 | null>(null)
  const [picaPicaMsg, setPicaPicaMsg] = useState<string | null>(null)
  const picaMilestones = useRef({ shown5: false, shown25: false })

  useEffect(() => {
    if (s.phase === 'end') {
      Analytics.gameComplete('truco', activeTimer.getSeconds(), { players: s.config.modalidad, chicos: s.config.totalChicos })
      navigate('/truco/end')
    }
  }, [s.phase, navigate])

  useEffect(() => {
    if (s.phase === 'playing' && s.startedAt && Date.now() - new Date(s.startedAt).getTime() > 15000) {
      Analytics.gameResume('truco')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    picaMilestones.current = { shown5: false, shown25: false }
  }, [s.chicoHistory.length])

  useEffect(() => {
    if (s.config.modalidad !== 6) return
    const t1 = s.team1.points, t2 = s.team2.points
    if (!picaMilestones.current.shown25 && (t1 >= 25 || t2 >= 25)) {
      picaMilestones.current.shown25 = true
      setPicaPicaMsg('Fin del pica a pica')
      setTimeout(() => setPicaPicaMsg(null), 3000)
    } else if (!picaMilestones.current.shown5 && (t1 >= 5 || t2 >= 5)) {
      picaMilestones.current.shown5 = true
      setPicaPicaMsg('¡Pica a pica!')
      setTimeout(() => setPicaPicaMsg(null), 3000)
    }
  }, [s.team1.points, s.team2.points, s.config.modalidad])

  const modeLabel = s.config.totalChicos === 2
    ? `Mejor de 3 · Chico ${s.chicoHistory.length + 1}`
    : `A 3 · Chico ${s.chicoHistory.length + 1}`

  const TeamPanel = ({ team }: { team: 1 | 2 }) => {
    const data = team === 1 ? s.team1 : s.team2
    const name = team === 1 ? s.config.team1Name : s.config.team2Name
    const pts = data.points

    return (
      <div className="flex-1 flex flex-col gap-3 bg-surface rounded-2xl p-4">
        {/* Name */}
        <button onClick={() => setEditNameTeam(team)} className="flex items-center gap-1.5 w-full">
          <span className="text-text font-bold text-base truncate">{name}</span>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-muted shrink-0">
            <path d="M10 2L12 4L5 11H3V9L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Chico dots */}
        <ChicoDots won={data.chicosWon} total={s.config.totalChicos} />

        {/* − [número] + */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => pts > 0 && s.setPoints(team, pts - 1)}
            disabled={pts === 0}
            className="w-6 h-6 rounded-md border border-border text-muted text-sm leading-none active:scale-95 transition-transform disabled:opacity-20 shrink-0 flex items-center justify-center"
          >
            −
          </button>
          <span className="flex-1 text-center text-6xl font-bold text-text tabular-nums leading-none">
            {pts}
          </span>
          <button
            onClick={() => s.addPoints(team, 1)}
            className="w-6 h-6 rounded-md border border-border text-muted text-sm leading-none active:scale-95 transition-transform shrink-0 flex items-center justify-center"
          >
            +
          </button>
        </div>

        {/* Malas/Buenas badge */}
        <div className="flex justify-center">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${pts > 15 ? 'bg-success/15 text-success' : 'bg-muted/10 text-muted'}`}>
            {pts > 15 ? 'Buenas' : 'Malas'}
          </span>
        </div>

        {/* Cajas */}
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-muted text-[10px] uppercase tracking-widest mb-1.5">Malas</p>
            <TrucoCaja points={pts} section="malas" />
          </div>
          <div>
            <p className="text-muted text-[10px] uppercase tracking-widest mb-1.5">Buenas</p>
            <TrucoCaja points={pts} section="buenas" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <GameNav
        center={modeLabel}
        onReiniciarResultados={() => s.resetGame()}
        onNuevaPartida={() => { Analytics.gameAbandon('truco', activeTimer.getSeconds()); s.goToSetup(); navigate('/truco/setup') }}
      />

      {/* Teams */}
      <div className="flex-1 px-4 pb-2 flex gap-3">
        <TeamPanel team={1} />
        <TeamPanel team={2} />
      </div>

      {/* Deshacer */}
      {s.lastTeamState && (
        <div className="px-4 pb-2 flex justify-center">
          <button
            onClick={s.undoLast}
            className="flex items-center gap-1.5 text-muted text-xs active:opacity-60 py-1 px-3"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 5H9a4 4 0 0 1 0 8H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2 5L5 2M2 5L5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Deshacer
          </button>
        </div>
      )}

      {/* Chico history */}
      {s.chicoHistory.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-muted text-[10px] uppercase tracking-widest mb-2">Historial</p>
          <div className="flex gap-2">
            {s.chicoHistory.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg">
                <span className={`text-xs font-semibold ${c.winner === 1 ? 'text-accent' : 'text-muted'}`}>{c.team1Points}</span>
                <span className="text-border text-xs">·</span>
                <span className={`text-xs font-semibold ${c.winner === 2 ? 'text-accent' : 'text-muted'}`}>{c.team2Points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AdPlaceholder />

      {/* Pica a pica toast */}
      {picaPicaMsg && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 }}
          className="px-6 py-4 bg-bg border-2 border-accent/60 rounded-2xl shadow-2xl text-center pointer-events-none">
          <p className="text-accent font-bold text-xl whitespace-nowrap">{picaPicaMsg}</p>
        </div>
      )}

      {editNameTeam && (
        <EditNameModal open={true} team={editNameTeam}
          current={editNameTeam === 1 ? s.config.team1Name : s.config.team2Name}
          onClose={() => setEditNameTeam(null)}
          onConfirm={(name) => { s.setTeamName(editNameTeam, name); setEditNameTeam(null) }}
        />
      )}
    </div>
  )
}
