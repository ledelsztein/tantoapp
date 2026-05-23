import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrucoStore } from '../../../store/trucoStore'
import type { TrucoConfig } from '../../../types'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'
import { Analytics } from '../../../lib/analytics'

const MODOS = [
  {
    value: 2 as const,
    label: 'Al mejor de 3',
    desc: 'Gana el primero en ganar 2 chicos',
  },
  {
    value: 3 as const,
    label: 'A 3 chicos',
    desc: 'Gana el primero en llegar a 3 chicos',
  },
]

export default function TrucoSetup() {
  const navigate = useNavigate()
  const startGame = useTrucoStore((s) => s.startGame)

  const [config, setConfig] = useState<TrucoConfig>({
    team1Name: 'Nosotros',
    team2Name: 'Ellos',
    totalChicos: 2,
    modalidad: 4,
  })

  const handleStart = () => {
    startGame(config)
    Analytics.gameStart('truco', { players: config.modalidad, chicos: config.totalChicos })
    navigate('/truco/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="Truco" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6">
        {/* Team names */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Equipos</p>
          <div className="flex flex-col gap-2">
            {(['team1Name', 'team2Name'] as const).map((key, i) => (
              <div key={key} className="flex items-center gap-3 bg-surface2 rounded-xl px-4 h-12">
                <span className="text-muted text-sm w-6 shrink-0">{i + 1}.</span>
                <input
                  type="text"
                  value={config[key]}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  className="flex-1 bg-transparent text-text outline-none"
                  maxLength={10}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Modo de partido */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Modalidad de partido</p>
          <div className="flex flex-col gap-2">
            {MODOS.map((m) => (
              <button
                key={m.value}
                onClick={() => setConfig({ ...config, totalChicos: m.value })}
                className={`flex flex-col items-start px-4 py-3.5 rounded-xl border transition-colors text-left ${
                  config.totalChicos === m.value
                    ? 'bg-accent/10 border-accent/50'
                    : 'bg-surface2 border-transparent'
                }`}
              >
                <span className={`font-semibold text-sm ${config.totalChicos === m.value ? 'text-accent' : 'text-text'}`}>
                  {m.label}
                </span>
                <span className="text-muted text-xs mt-0.5">{m.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Modalidad de jugadores */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Jugadores</p>
          <div className="flex gap-2">
            {([2, 4, 6] as const).map((n) => (
              <button
                key={n}
                onClick={() => setConfig({ ...config, modalidad: n })}
                className={`flex-1 h-12 rounded-xl text-base font-semibold transition-colors ${
                  config.modalidad === n ? 'bg-accent text-bg' : 'bg-surface2 text-muted'
                }`}
              >
                {n}J
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
