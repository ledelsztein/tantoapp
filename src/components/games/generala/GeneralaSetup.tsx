import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeneralaStore } from '../../../store/generalaStore'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'
import SortablePlayerList from '../../ui/SortablePlayerList'

const DEFAULT_PLAYERS = ['J1', 'J2', 'J3', 'J4']

export default function GeneralaSetup() {
  const navigate = useNavigate()
  const startGame = useGeneralaStore((s) => s.startGame)

  const [players, setPlayers] = useState(DEFAULT_PLAYERS)
  const [ids, setIds] = useState(() => DEFAULT_PLAYERS.map((_, i) => `p-${i}-${Date.now()}`))

  const handleStart = () => {
    startGame(players)
    navigate('/generala/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="Generala" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6 overflow-y-auto">
        <section className="flex flex-col gap-2">
          <p className="text-muted text-xs font-medium uppercase tracking-widest mb-1">Jugadores</p>
          <SortablePlayerList
            players={players}
            ids={ids}
            onPlayersChange={(p, i) => { setPlayers(p); setIds(i) }}
          />
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
