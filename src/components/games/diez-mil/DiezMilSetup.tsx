import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDiezMilStore } from '../../../store/diezMilStore'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'
import SortablePlayerList from '../../ui/SortablePlayerList'

const DEFAULT_PLAYERS = ['J1', 'J2', 'J3', 'J4']
const MIN_ENTRY_OPTIONS = [750, 850]

export default function DiezMilSetup() {
  const navigate = useNavigate()
  const startGame = useDiezMilStore((s) => s.startGame)

  const [players, setPlayers] = useState(DEFAULT_PLAYERS)
  const [ids, setIds] = useState(() => DEFAULT_PLAYERS.map((_, i) => `p-${i}-${Date.now()}`))
  const [minEntry, setMinEntry] = useState(750)
  const [customEntry, setCustomEntry] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [lastRound, setLastRound] = useState(true)

  const handleStart = () => {
    const entry = useCustom ? parseInt(customEntry) || 750 : minEntry
    startGame({ players, minEntry: entry, lastRound })
    navigate('/diez-mil/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="10 Mil" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6 overflow-y-auto">

        <section className="flex flex-col gap-2">
          <p className="text-muted text-xs font-medium uppercase tracking-widest mb-1">Jugadores</p>
          <SortablePlayerList
            players={players}
            ids={ids}
            maxNameLength={4}
            onPlayersChange={(p, i) => { setPlayers(p); setIds(i) }}
          />
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
            <input type="number" placeholder="Ej: 1000" value={customEntry}
              onChange={(e) => setCustomEntry(e.target.value)}
              className="bg-surface2 text-text rounded-xl px-4 h-12 outline-none w-full"/>
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
