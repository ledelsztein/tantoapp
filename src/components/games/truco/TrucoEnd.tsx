import { useNavigate } from 'react-router-dom'
import { useTrucoStore } from '../../../store/trucoStore'
import Button from '../../ui/Button'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function TrucoEnd() {
  const navigate = useNavigate()
  const s = useTrucoStore()

  const winnerName = s.winner === 1 ? s.config.team1Name : s.config.team2Name

  const handleNewGame = () => {
    s.resetGame()
    navigate('/truco/game')
  }

  const handleHome = () => {
    s.abandonGame()
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg items-center justify-center px-5 gap-8">
      {/* Winner */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L22 14H33L24.5 20.5L27.5 31L18 25L8.5 31L11.5 20.5L3 14H14L18 4Z"
              stroke="var(--accent)" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-text text-3xl font-bold">{winnerName}</h1>
        <p className="text-muted text-sm">ganó el partido</p>
      </div>

      {/* Chico summary */}
      <div className="w-full max-w-xs bg-surface rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-muted text-xs font-medium uppercase tracking-widest mb-1">Chicos</p>
        <div className="flex justify-between text-sm">
          <span className="text-text font-medium">{s.config.team1Name}</span>
          <span className="text-accent font-bold">{s.team1.chicosWon}</span>
        </div>
        <div className="w-full h-px bg-border"/>
        <div className="flex justify-between text-sm">
          <span className="text-text font-medium">{s.config.team2Name}</span>
          <span className={s.winner === 2 ? 'text-accent font-bold' : 'text-muted'}>{s.team2.chicosWon}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="primary" size="lg" className="w-full" onClick={handleNewGame}>
          Nueva partida
        </Button>
        <Button variant="ghost" size="md" className="w-full" onClick={handleHome}>
          Volver al inicio
        </Button>
      </div>

      <AdPlaceholder />
    </div>
  )
}
