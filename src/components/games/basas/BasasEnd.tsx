import { useNavigate } from 'react-router-dom'
import { useBasasStore } from '../../../store/basasStore'
import Button from '../../ui/Button'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function BasasEnd() {
  const navigate = useNavigate()
  const s = useBasasStore()

  const winner = s.winner !== null ? s.config.players[s.winner] : '—'
  const sortedPlayers = [...s.config.players]
    .map((name, i) => ({ name, score: s.totalScores[i] ?? 0, i }))
    .sort((a, b) => b.score - a.score)

  const handleHome = () => {
    s.abandonGame()
    navigate('/')
  }

  const handleNew = () => {
    s.abandonGame()
    navigate('/basas/setup')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg px-5 gap-6 pt-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mb-1">
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L22 14H33L24.5 20.5L27.5 31L18 25L8.5 31L11.5 20.5L3 14H14L18 4Z" stroke="var(--accent)" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-text text-2xl font-bold">{winner}</h1>
        <p className="text-muted text-sm">ganó la partida</p>
      </div>

      <div className="bg-surface rounded-2xl overflow-hidden">
        {sortedPlayers.map((p, rank) => (
          <div key={p.i} className={`flex items-center justify-between px-4 py-3 border-b border-border last:border-0 ${rank === 0 ? 'bg-accent/5' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-muted text-xs w-4">{rank + 1}.</span>
              <span className="text-text font-medium">{p.name}</span>
            </div>
            <span className={`font-bold tabular-nums ${rank === 0 ? 'text-accent' : 'text-muted'}`}>{p.score}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-auto pb-4">
        <Button variant="primary" size="lg" className="w-full" onClick={handleNew}>Nueva partida</Button>
        <Button variant="ghost" size="md" className="w-full" onClick={handleHome}>Volver al inicio</Button>
      </div>
      <AdPlaceholder />
    </div>
  )
}
