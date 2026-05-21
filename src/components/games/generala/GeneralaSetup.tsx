import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeneralaStore } from '../../../store/generalaStore'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function GeneralaSetup() {
  const navigate = useNavigate()
  const startGame = useGeneralaStore((s) => s.startGame)
  const [playerCount, setPlayerCount] = useState(4)
  const [players, setPlayers] = useState(['J1', 'J2', 'J3', 'J4'])

  const updateCount = (n: number) => {
    setPlayerCount(n)
    setPlayers((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? `J${i + 1}`))
  }

  const handleStart = () => {
    startGame(players.slice(0, playerCount))
    navigate('/generala/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="Generala" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Jugadores</p>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                onClick={() => updateCount(n)}
                className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-colors ${
                  playerCount === n ? 'bg-accent text-bg' : 'bg-surface2 text-muted'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Nombres</p>
          {players.slice(0, playerCount).map((name, i) => (
            <div key={i} className="flex items-center gap-3 bg-surface2 rounded-xl px-4 h-12">
              <span className="text-muted text-sm w-6 shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const next = [...players]; next[i] = e.target.value; setPlayers(next)
                }}
                className="flex-1 bg-transparent text-text outline-none"
                maxLength={15}
              />
            </div>
          ))}
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
