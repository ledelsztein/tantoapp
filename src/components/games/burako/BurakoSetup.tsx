import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBurakoStore } from '../../../store/burakoStore'
import { Analytics } from '../../../lib/analytics'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function BurakoSetup() {
  const navigate = useNavigate()
  const startGame = useBurakoStore((s) => s.startGame)

  const [team1Name, setTeam1Name] = useState('Nosotros')
  const [team2Name, setTeam2Name] = useState('Ellos')
  const [objetivo, setObjetivo] = useState(3000)
  const [customObj, setCustomObj] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const handleStart = () => {
    const obj = useCustom ? parseInt(customObj) || 3000 : objetivo
    startGame({ team1Name, team2Name, objetivo: obj })
    Analytics.gameStart('burako', { objetivo: obj })
    navigate('/burako/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="Burako" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Equipos</p>
          {([['team1Name', team1Name, setTeam1Name], ['team2Name', team2Name, setTeam2Name]] as const).map(([key, val, setter], i) => (
            <div key={key} className="flex items-center gap-3 bg-surface2 rounded-xl px-4 h-12">
              <span className="text-muted text-sm w-6 shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={val}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                className="flex-1 bg-transparent text-text outline-none"
                maxLength={20}
              />
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Puntaje objetivo</p>
          <div className="flex gap-2">
            {[2000, 3000, 5000].map((n) => (
              <button key={n} onClick={() => { setObjetivo(n); setUseCustom(false) }}
                className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${!useCustom && objetivo === n ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
                {n.toLocaleString('es')}
              </button>
            ))}
            <button onClick={() => setUseCustom(true)}
              className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${useCustom ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
              Otro
            </button>
          </div>
          {useCustom && (
            <input type="number" placeholder="Ej: 4000" value={customObj}
              onChange={(e) => setCustomObj(e.target.value)}
              className="bg-surface2 text-text rounded-xl px-4 h-12 outline-none w-full"/>
          )}
        </section>
      </div>

      <div className="px-4 py-4">
        <Button variant="primary" size="lg" className="w-full" onClick={handleStart}>Empezar partida</Button>
      </div>
      <AdPlaceholder />
    </div>
  )
}
