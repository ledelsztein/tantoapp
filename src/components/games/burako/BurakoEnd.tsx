import { useNavigate } from 'react-router-dom'
import { useBurakoStore } from '../../../store/burakoStore'
import Button from '../../ui/Button'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function BurakoEnd() {
  const navigate = useNavigate()
  const s = useBurakoStore()

  const winnerName = s.winner === 1 ? s.config.team1Name : s.config.team2Name

  const handleHome = () => { s.abandonGame(); navigate('/') }
  const handleNew = () => { s.abandonGame(); navigate('/burako/setup') }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <div className="flex flex-col items-center gap-2 text-center px-5 pt-16 pb-6">
        <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mb-1">
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L22 14H33L24.5 20.5L27.5 31L18 25L8.5 31L11.5 20.5L3 14H14L18 4Z" stroke="var(--accent)" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-text text-2xl font-bold">{winnerName}</h1>
        <p className="text-muted text-sm">ganó la partida</p>
      </div>

      {/* Scores */}
      <div className="px-5 mb-4">
        <div className="bg-surface rounded-2xl overflow-hidden">
          {[
            { name: s.config.team1Name, score: s.team1Score, isWinner: s.winner === 1 },
            { name: s.config.team2Name, score: s.team2Score, isWinner: s.winner === 2 },
          ].map((t, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-4 border-b border-border last:border-0 ${t.isWinner ? 'bg-accent/5' : ''}`}>
              <span className="text-text font-medium">{t.name}</span>
              <span className={`text-2xl font-bold tabular-nums ${t.isWinner ? 'text-accent' : 'text-muted'}`}>
                {t.score.toLocaleString('es')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mano history */}
      {s.manos.length > 0 && (
        <div className="flex-1 px-5 overflow-y-auto">
          <p className="text-muted text-xs font-medium uppercase tracking-widest mb-2">Historial de manos</p>
          <div className="bg-surface rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 border-b border-border">
              <div className="px-3 py-2 text-muted text-xs">Mano</div>
              <div className="px-2 py-2 text-center text-xs font-medium text-text">{s.config.team1Name}</div>
              <div className="px-2 py-2 text-center text-xs font-medium text-text">{s.config.team2Name}</div>
            </div>
            {s.manos.map((m, i) => (
              <div key={i} className="grid grid-cols-3 border-b border-border/40 last:border-0">
                <div className="px-3 py-2 text-muted text-xs">{i + 1}</div>
                <div className={`px-2 py-2 text-xs font-medium text-center tabular-nums ${m.team1.total >= 0 ? 'text-success' : 'text-danger'}`}>
                  {m.team1.total >= 0 ? `+${m.team1.total}` : m.team1.total}
                </div>
                <div className={`px-2 py-2 text-xs font-medium text-center tabular-nums ${m.team2.total >= 0 ? 'text-success' : 'text-danger'}`}>
                  {m.team2.total >= 0 ? `+${m.team2.total}` : m.team2.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 px-5 py-4">
        <Button variant="primary" size="lg" className="w-full" onClick={handleNew}>Nueva partida</Button>
        <Button variant="ghost" size="md" className="w-full" onClick={handleHome}>Volver al inicio</Button>
      </div>
      <AdPlaceholder />
    </div>
  )
}
