import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBasasStore } from '../../../store/basasStore'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'

function getOrderText(players: string[], firstDealerIndex: number, direction: 'cw' | 'ccw'): string {
  const n = players.length
  const step = direction === 'cw' ? 1 : n - 1
  return Array.from({ length: n }, (_, i) => players[(firstDealerIndex + i * step) % n] || `J${i + 1}`).join(' → ')
}

export default function BasasSetup() {
  const navigate = useNavigate()
  const startGame = useBasasStore((s) => s.startGame)

  const [players, setPlayers] = useState(['J1', 'J2', 'J3', 'J4'])
  const [maxBazas, setMaxBazas] = useState(7)
  const [format, setFormat] = useState<'ida' | 'ida_vuelta'>('ida')
  const [firstDealerIndex, setFirstDealerIndex] = useState(0)
  const [direction, setDirection] = useState<'cw' | 'ccw'>('cw')

  const updateName = (i: number, val: string) => {
    const next = [...players]; next[i] = val; setPlayers(next)
  }

  const addPlayer = () => {
    if (players.length >= 8) return
    setPlayers([...players, `J${players.length + 1}`])
  }

  const removePlayer = (i: number) => {
    if (players.length <= 2) return
    const next = players.filter((_, idx) => idx !== i)
    setPlayers(next)
    if (firstDealerIndex >= next.length) setFirstDealerIndex(next.length - 1)
  }

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...players];
    [next[i - 1], next[i]] = [next[i], next[i - 1]]
    setPlayers(next)
    if (firstDealerIndex === i) setFirstDealerIndex(i - 1)
    else if (firstDealerIndex === i - 1) setFirstDealerIndex(i)
  }

  const moveDown = (i: number) => {
    if (i === players.length - 1) return
    const next = [...players];
    [next[i], next[i + 1]] = [next[i + 1], next[i]]
    setPlayers(next)
    if (firstDealerIndex === i) setFirstDealerIndex(i + 1)
    else if (firstDealerIndex === i + 1) setFirstDealerIndex(i)
  }

  const handleStart = () => {
    startGame({ players, maxBazas, format, firstDealerIndex, direction })
    navigate('/basas/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="Bazas" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6 overflow-y-auto">

        {/* Player list */}
        <section className="flex flex-col gap-2">
          <p className="text-muted text-xs font-medium uppercase tracking-widest mb-1">Jugadores</p>
          <p className="text-muted text-[11px] -mt-1 mb-1">El punto indica quién reparte primero</p>

          {players.map((name, i) => (
            <div key={i} className="flex items-center gap-2 bg-surface2 rounded-xl px-3 h-12">
              {/* Radio — first dealer */}
              <button
                onClick={() => setFirstDealerIndex(i)}
                className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: firstDealerIndex === i ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: firstDealerIndex === i ? 'var(--accent)' : 'transparent',
                }}
              >
                {firstDealerIndex === i && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--bg)' }} />
                )}
              </button>

              {/* Name input */}
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                className="flex-1 bg-transparent text-text outline-none text-sm"
                maxLength={12}
              />

              {/* Move up / down */}
              <div className="flex flex-col gap-px shrink-0">
                <button onClick={() => moveUp(i)} disabled={i === 0}
                  className="text-muted disabled:opacity-20 active:scale-90 px-1 py-0.5">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button onClick={() => moveDown(i)} disabled={i === players.length - 1}
                  className="text-muted disabled:opacity-20 active:scale-90 px-1 py-0.5">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Remove */}
              {players.length > 2 && (
                <button onClick={() => removePlayer(i)} className="text-muted/50 active:scale-90 shrink-0 ml-0.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          ))}

          {players.length < 8 && (
            <button onClick={addPlayer}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-border text-muted text-sm active:scale-95 transition-transform">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Agregar jugador
            </button>
          )}
        </section>

        {/* Max bazas */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Bazas máximas</p>
          <div className="flex items-center gap-4 bg-surface2 rounded-xl px-4 h-12">
            <button onClick={() => setMaxBazas(Math.max(1, maxBazas - 1))}
              className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text font-bold active:scale-95">−</button>
            <span className="flex-1 text-center text-text font-bold text-lg tabular-nums">{maxBazas}</span>
            <button onClick={() => setMaxBazas(maxBazas + 1)}
              className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text font-bold active:scale-95">+</button>
          </div>
        </section>

        {/* Format */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Formato</p>
          <div className="flex gap-2">
            {([
              ['ida', `1 › N › 1`],
              ['ida_vuelta', `1 › N, 1 › N`],
            ] as const).map(([f, label]) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${format === f ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-muted text-xs px-1">
            {format === 'ida'
              ? `Sube de 1 a ${maxBazas} y baja de ${maxBazas} a 1 — ${(maxBazas - 1) * 2 + 1} rondas`
              : `Sube de 1 a ${maxBazas} dos veces — ${(maxBazas - 1) * 2 + 2} rondas`}
          </p>
        </section>

        {/* Direction + order text */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Sentido</p>
          <div className="flex gap-2">
            {([['cw', '↻ Horario'], ['ccw', '↺ Antihorario']] as const).map(([d, label]) => (
              <button key={d} onClick={() => setDirection(d)}
                className={`flex-1 h-12 rounded-xl text-sm font-medium transition-colors ${direction === d ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="bg-surface2 rounded-xl px-4 py-3">
            <p className="text-muted text-xs mb-1">Orden de puja</p>
            <p className="text-text text-sm font-medium">{getOrderText(players, firstDealerIndex, direction)}</p>
          </div>
        </section>

      </div>

      <div className="px-4 py-4">
        <Button variant="primary" size="lg" className="w-full" onClick={handleStart}>
          Empezar partida
        </Button>
      </div>
      <AdPlaceholder />
    </div>
  )
}
