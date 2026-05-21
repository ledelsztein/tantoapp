import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDiezMilStore } from '../../../store/diezMilStore'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'

const MIN_ENTRY_OPTIONS = [750, 850]

export default function DiezMilSetup() {
  const navigate = useNavigate()
  const startGame = useDiezMilStore((s) => s.startGame)
  const [playerCount, setPlayerCount] = useState(4)
  const [players, setPlayers] = useState(['J1', 'J2', 'J3', 'J4'])
  const [minEntry, setMinEntry] = useState(750)
  const [customEntry, setCustomEntry] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [lastRound, setLastRound] = useState(true)

  const updateCount = (n: number) => {
    setPlayerCount(n)
    setPlayers((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? `J${i + 1}`))
  }

  const handleStart = () => {
    const entry = useCustom ? parseInt(customEntry) || 750 : minEntry
    startGame({ players: players.slice(0, playerCount), minEntry: entry, lastRound })
    navigate('/diez-mil/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="10 Mil" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6 overflow-y-auto">
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Jugadores</p>
          <div className="flex gap-2">
            {[2,3,4,5,6,7,8].map((n) => (
              <button key={n} onClick={() => updateCount(n)}
                className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-colors ${playerCount === n ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
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
                onChange={(e) => { const n=[...players];n[i]=e.target.value;setPlayers(n) }}
                className="flex-1 bg-transparent text-text outline-none"
                maxLength={15}
              />
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Mínimo de entrada</p>
          <div className="flex gap-2">
            {MIN_ENTRY_OPTIONS.map((n) => (
              <button key={n} onClick={() => { setMinEntry(n); setUseCustom(false) }}
                className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${!useCustom && minEntry === n ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setUseCustom(true)}
              className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${useCustom ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
              Otro
            </button>
          </div>
          {useCustom && (
            <input
              type="number"
              placeholder="Ej: 1000"
              value={customEntry}
              onChange={(e) => setCustomEntry(e.target.value)}
              className="bg-surface2 text-text rounded-xl px-4 h-12 outline-none w-full"
            />
          )}
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Última vuelta</p>
          <div className="flex gap-2">
            {([true, false] as const).map((v) => (
              <button key={String(v)} onClick={() => setLastRound(v)}
                className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${lastRound === v ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
                {v ? 'Sí' : 'No'}
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
