import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBurakoStore } from '../../../store/burakoStore'
import type { BurakoTeamEntry } from '../../../types'
import GameNav from '../../ui/GameNav'
import AdPlaceholder from '../../ui/AdPlaceholder'
import { Analytics, activeTimer } from '../../../lib/analytics'

// ─── Íconos inline ────────────────────────────────────────────────────────────

function IconCanastaPura() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 10H19L17 18H5L3 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M6 10L8 5M11 10V4M16 10L14 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IconCanastaImpura() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 10H19L17 18H5L3 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M6 10L8 5M11 10V4M16 10L14 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="17" cy="5" r="3" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1"/>
    </svg>
  )
}

function IconCierre({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="5" y="10" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 10V7a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      {active && <circle cx="11" cy="14.5" r="1.5" fill="currentColor"/>}
    </svg>
  )
}

function IconMuerto({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="16" height="13" rx="3" stroke="currentColor" strokeWidth="1.6"/>
      {active ? (
        <>
          <line x1="6" y1="19" x2="9" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="13" y1="16" x2="16" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="8" y1="7" x2="10" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="7" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="13" y1="7" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="15" y1="7" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <circle cx="9" cy="8" r="1.5" fill="currentColor" opacity={0.5}/>
          <circle cx="14" cy="8" r="1.5" fill="currentColor" opacity={0.5}/>
          <path d="M8 11.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity={0.4}/>
        </>
      )}
    </svg>
  )
}

// ─── Team entry panel ─────────────────────────────────────────────────────────

interface TeamPanelProps {
  team: 1 | 2
  name: string
  totalScore: number
  objetivo: number
}

function TeamPanel({ team, name, totalScore, objetivo }: TeamPanelProps) {
  const s = useBurakoStore()
  const entry = team === 1 ? s.currentEntry.team1 : s.currentEntry.team2

  const update = (u: Partial<BurakoTeamEntry>) => s.updateEntry(team, u)

  const previewBase = entry.puras * 200 + entry.impuras * 100 + (entry.cierre ? 100 : 0) - (entry.muerto ? 100 : 0)
  const previewPuntos = entry.fichasBajadas - entry.fichasAtril
  const previewTotal = previewBase + previewPuntos
  const pct = Math.min(100, (totalScore / objetivo) * 100)

  return (
    <div className="flex-1 bg-surface rounded-2xl p-3 flex flex-col gap-3">
      {/* Header */}
      <div>
        <p className="text-text font-bold text-base">{name}</p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-3xl font-bold text-text tabular-nums leading-none">{totalScore.toLocaleString('es')}</span>
          <span className="text-muted text-xs">/ {objetivo.toLocaleString('es')}</span>
        </div>
        <div className="w-full bg-border rounded-full h-1 mt-2">
          <div className="bg-accent h-1 rounded-full transition-all" style={{ width: `${pct}%` }}/>
        </div>
      </div>

      {/* Canastas */}
      <div>
        <p className="text-muted text-[10px] uppercase tracking-widest mb-2">Canastas</p>
        <div className="flex gap-2">
          {/* Pura */}
          <div className="flex-1 flex flex-col items-center gap-1 bg-surface2 rounded-xl p-2">
            <span className="text-muted"><IconCanastaPura /></span>
            <span className="text-text text-xs font-medium">Pura</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => update({ puras: Math.max(0, entry.puras - 1) })}
                className="w-7 h-7 rounded-lg bg-surface text-muted font-bold active:scale-90 text-sm">−</button>
              <span className="text-accent font-bold text-base w-4 text-center tabular-nums">{entry.puras}</span>
              <button onClick={() => update({ puras: entry.puras + 1 })}
                className="w-7 h-7 rounded-lg bg-surface text-text font-bold active:scale-90 text-sm">+</button>
            </div>
          </div>
          {/* Impura */}
          <div className="flex-1 flex flex-col items-center gap-1 bg-surface2 rounded-xl p-2">
            <span className="text-muted"><IconCanastaImpura /></span>
            <span className="text-text text-xs font-medium">Impura</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => update({ impuras: Math.max(0, entry.impuras - 1) })}
                className="w-7 h-7 rounded-lg bg-surface text-muted font-bold active:scale-90 text-sm">−</button>
              <span className="text-accent font-bold text-base w-4 text-center tabular-nums">{entry.impuras}</span>
              <button onClick={() => update({ impuras: entry.impuras + 1 })}
                className="w-7 h-7 rounded-lg bg-surface text-text font-bold active:scale-90 text-sm">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Cierre + Muerto */}
      <div className="flex gap-2">
        <button
          onClick={() => update({ cierre: !entry.cierre })}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors ${entry.cierre ? 'border-success bg-success/10 text-success' : 'border-border bg-surface2 text-muted'}`}
        >
          <IconCierre active={entry.cierre} />
          <span className="text-xs font-medium">Cierre</span>
          {entry.cierre && <span className="text-[10px] text-success">+100</span>}
        </button>
        <button
          onClick={() => update({ muerto: !entry.muerto })}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors ${entry.muerto ? 'border-danger bg-danger/10 text-danger' : 'border-border bg-surface2 text-muted'}`}
        >
          <IconMuerto active={entry.muerto} />
          <span className="text-xs font-medium">Muerto</span>
          {entry.muerto && <span className="text-[10px] text-danger">−100</span>}
        </button>
      </div>

      {/* Fichas */}
      <div className="flex flex-col gap-2">
        <p className="text-muted text-[10px] uppercase tracking-widest">Fichas</p>
        {[
          { label: 'Bajadas', key: 'fichasBajadas', val: entry.fichasBajadas },
          { label: 'En atril', key: 'fichasAtril', val: entry.fichasAtril },
        ].map(({ label, key, val }) => (
          <div key={key} className="flex items-center bg-surface2 rounded-xl px-3 h-10 gap-3">
            <span className="text-muted text-xs flex-1">{label}</span>
            <input
              type="number"
              value={val === 0 ? '' : val}
              placeholder="0"
              onChange={(e) => update({ [key]: parseInt(e.target.value) || 0 })}
              className="bg-transparent text-text text-right font-bold w-16 outline-none tabular-nums"
              min={0}
            />
          </div>
        ))}
      </div>

      {/* Preview delta */}
      <div className="bg-surface2/50 rounded-xl px-3 py-2 flex items-center justify-between">
        <span className="text-muted text-xs">
          Base {previewBase > 0 ? `+${previewBase}` : previewBase} · Fichas {previewPuntos >= 0 ? `+${previewPuntos}` : previewPuntos}
        </span>
        <span className={`font-bold tabular-nums text-sm ${previewTotal >= 0 ? 'text-success' : 'text-danger'}`}>
          {previewTotal >= 0 ? `+${previewTotal}` : previewTotal}
        </span>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BurakoGame() {
  const navigate = useNavigate()
  const s = useBurakoStore()
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (s.phase === 'end') {
      Analytics.gameComplete('burako', activeTimer.getSeconds(), { manos: s.manos.length })
      navigate('/burako/end')
    }
  }, [s.phase, navigate])

  useEffect(() => {
    if (s.phase === 'playing' && s.startedAt && Date.now() - new Date(s.startedAt).getTime() > 15000) {
      Analytics.gameResume('burako')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <GameNav
        center={`Mano ${s.manos.length + 1}`}
        onReiniciarResultados={() => s.resetGame()}
        onNuevaPartida={() => { Analytics.gameAbandon('burako', activeTimer.getSeconds()); s.abandonGame(); navigate('/burako/setup') }}
      />

      {/* Teams side by side */}
      <div className="flex-1 px-4 pb-3 flex gap-3 overflow-y-auto">
        <TeamPanel team={1} name={s.config.team1Name} totalScore={s.team1Score} objetivo={s.config.objetivo} />
        <TeamPanel team={2} name={s.config.team2Name} totalScore={s.team2Score} objetivo={s.config.objetivo} />
      </div>

      {/* Historial expandable */}
      {s.manos.length > 0 && (
        <div className="px-4 pb-2">
          <button onClick={() => setShowHistory(!showHistory)}
            className="text-muted text-xs flex items-center gap-1.5 active:opacity-60">
            {showHistory ? '▲' : '▼'} Historial ({s.manos.length} mano{s.manos.length !== 1 ? 's' : ''})
          </button>
          {showHistory && (
            <div className="mt-2 bg-surface rounded-xl overflow-hidden">
              <div className="grid border-b border-border grid-cols-3">
                <div className="px-3 py-1.5 text-muted text-xs">Mano</div>
                <div className="px-2 py-1.5 text-text text-xs font-medium text-center">{s.config.team1Name}</div>
                <div className="px-2 py-1.5 text-text text-xs font-medium text-center">{s.config.team2Name}</div>
              </div>
              {s.manos.map((m, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-border/40 last:border-0">
                  <div className="px-3 py-1.5 text-muted text-xs">{i + 1}</div>
                  <div className={`px-2 py-1.5 text-xs font-medium text-center tabular-nums ${m.team1.total >= 0 ? 'text-success' : 'text-danger'}`}>
                    {m.team1.total >= 0 ? `+${m.team1.total}` : m.team1.total}
                  </div>
                  <div className={`px-2 py-1.5 text-xs font-medium text-center tabular-nums ${m.team2.total >= 0 ? 'text-success' : 'text-danger'}`}>
                    {m.team2.total >= 0 ? `+${m.team2.total}` : m.team2.total}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm mano */}
      <div className="px-4 py-4">
        <button onClick={s.confirmMano}
          className="w-full h-14 rounded-xl bg-accent text-bg font-semibold text-base active:scale-95 transition-transform">
          Confirmar mano
        </button>
      </div>

      <AdPlaceholder />
    </div>
  )
}
