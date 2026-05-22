import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrucoStore } from '../../../store/trucoStore'
import type { TrucoConfig } from '../../../types'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function TrucoSetup() {
  const navigate = useNavigate()
  const startGame = useTrucoStore((s) => s.startGame)

  const [config, setConfig] = useState<TrucoConfig>({
    team1Name: 'Nosotros',
    team2Name: 'Ellos',
    totalChicos: 3,
    modalidad: 4,
  })

  const handleStart = () => {
    startGame(config)
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
                  className="flex-1 bg-transparent text-text outline-none placeholder:text-muted"
                  maxLength={10}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Chicos */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Cantidad de chicos</p>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={n}
                onClick={() => setConfig({ ...config, totalChicos: n })}
                className={`flex-1 h-12 rounded-xl text-base font-semibold transition-colors ${
                  config.totalChicos === n
                    ? 'bg-accent text-bg'
                    : 'bg-surface2 text-muted'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* Modalidad */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Modalidad</p>
          <div className="flex gap-2">
            {([2, 4, 6] as const).map((n) => (
              <button
                key={n}
                onClick={() => setConfig({ ...config, modalidad: n })}
                className={`flex-1 h-12 rounded-xl text-base font-semibold transition-colors ${
                  config.modalidad === n
                    ? 'bg-accent text-bg'
                    : 'bg-surface2 text-muted'
                }`}
              >
                {n}J
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="px-4 py-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStart}
        >
          Empezar partida
        </Button>
      </div>

      <AdPlaceholder />
    </div>
  )
}
