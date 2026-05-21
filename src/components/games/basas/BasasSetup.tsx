import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBasasStore } from '../../../store/basasStore'
import type { BasasConfig } from '../../../types'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function BasasSetup() {
  const navigate = useNavigate()
  const startGame = useBasasStore((s) => s.startGame)

  const [playerCount, setPlayerCount] = useState(4)
  const [players, setPlayers] = useState(['J1', 'J2', 'J3', 'J4'])
  const [maxBazas, setMaxBazas] = useState(7)
  const [format, setFormat] = useState<'ida' | 'ida_vuelta'>('ida')
  const [firstDealerIndex, setFirstDealerIndex] = useState(0)
  const [direction, setDirection] = useState<'cw' | 'ccw'>('cw')

  const updatePlayerCount = (n: number) => {
    setPlayerCount(n)
    setPlayers((prev) => {
      const next = Array.from({ length: n }, (_, i) => prev[i] ?? `J${i + 1}`)
      return next
    })
  }

  const handleStart = () => {
    const config: BasasConfig = {
      players: players.slice(0, playerCount),
      maxBazas,
      format,
      firstDealerIndex,
      direction,
    }
    startGame(config)
    navigate('/basas/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="Basas" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6 overflow-y-auto">

        {/* Player count */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Jugadores</p>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                onClick={() => updatePlayerCount(n)}
                className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-colors ${
                  playerCount === n ? 'bg-accent text-bg' : 'bg-surface2 text-muted'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* Player names */}
        <section className="flex flex-col gap-2">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Nombres</p>
          {players.slice(0, playerCount).map((name, i) => (
            <div key={i} className="flex items-center gap-3 bg-surface2 rounded-xl px-4 h-12">
              <span className="text-muted text-sm w-6 shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const next = [...players]
                  next[i] = e.target.value
                  setPlayers(next)
                }}
                className="flex-1 bg-transparent text-text outline-none"
                maxLength={15}
              />
            </div>
          ))}
        </section>

        {/* Max bazas */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Bazas máximas</p>
          <div className="flex items-center gap-4 bg-surface2 rounded-xl px-4 h-12">
            <button
              onClick={() => setMaxBazas(Math.max(1, maxBazas - 1))}
              className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text font-bold active:scale-95"
            >−</button>
            <span className="flex-1 text-center text-text font-bold text-lg tabular-nums">{maxBazas}</span>
            <button
              onClick={() => setMaxBazas(maxBazas + 1)}
              className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text font-bold active:scale-95"
            >+</button>
          </div>
        </section>

        {/* Format */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Formato</p>
          <div className="flex gap-2">
            {(['ida', 'ida_vuelta'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 h-12 rounded-xl text-sm font-medium transition-colors ${
                  format === f ? 'bg-accent text-bg' : 'bg-surface2 text-muted'
                }`}
              >
                {f === 'ida' ? 'Ida (1→N→1)' : 'Ida y vuelta (1→N, 1→N)'}
              </button>
            ))}
          </div>
        </section>

        {/* First dealer */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Primer repartidor</p>
          <div className="flex flex-wrap gap-2">
            {players.slice(0, playerCount).map((name, i) => (
              <button
                key={i}
                onClick={() => setFirstDealerIndex(i)}
                className={`px-4 h-10 rounded-xl text-sm font-medium transition-colors ${
                  firstDealerIndex === i ? 'bg-accent text-bg' : 'bg-surface2 text-muted'
                }`}
              >
                {name || `J${i + 1}`}
              </button>
            ))}
          </div>
        </section>

        {/* Direction */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Sentido</p>
          <div className="flex gap-2">
            {([['cw', '↻ Agujas del reloj'], ['ccw', '↺ Contra las agujas']] as const).map(([d, label]) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`flex-1 h-12 rounded-xl text-sm font-medium transition-colors ${
                  direction === d ? 'bg-accent text-bg' : 'bg-surface2 text-muted'
                }`}
              >
                {label}
              </button>
            ))}
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
