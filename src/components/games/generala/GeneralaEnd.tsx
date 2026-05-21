import { useNavigate } from 'react-router-dom'
import { useGeneralaStore } from '../../../store/generalaStore'
import { GENERALA_CATEGORIES, GENERALA_CATEGORY_LABELS } from '../../../types'
import Button from '../../ui/Button'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function GeneralaEnd() {
  const navigate = useNavigate()
  const s = useGeneralaStore()

  const winnerIndex = s.instantWinner ?? s.winner
  const winner = winnerIndex !== null ? s.players[winnerIndex]?.name : '—'
  const isInstant = s.instantWinner !== null

  const handleHome = () => { s.abandonGame(); navigate('/') }
  const handleNew = () => { s.abandonGame(); navigate('/generala/setup') }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <div className="flex flex-col items-center gap-2 text-center px-5 pt-16 pb-6">
        <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mb-1">
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L22 14H33L24.5 20.5L27.5 31L18 25L8.5 31L11.5 20.5L3 14H14L18 4Z" stroke="var(--accent)" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-text text-2xl font-bold">{winner}</h1>
        <p className="text-muted text-sm">{isInstant ? 'ganó con generala servida' : 'ganó la partida'}</p>
      </div>

      {/* Full scorecard */}
      <div className="flex-1 px-4 overflow-x-auto">
        <div className="bg-surface rounded-2xl overflow-hidden min-w-0">
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `2fr repeat(${s.players.length}, 1fr)` }}>
            <div className="px-3 py-2 text-muted text-xs">Categoría</div>
            {s.players.map((p, i) => (
              <div key={i} className="px-2 py-2 text-center text-xs font-medium text-text truncate">{p.name}</div>
            ))}
          </div>
          {GENERALA_CATEGORIES.map((cat) => (
            <div key={cat} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: `2fr repeat(${s.players.length}, 1fr)` }}>
              <div className="px-3 py-2 text-muted text-xs">{GENERALA_CATEGORY_LABELS[cat]}</div>
              {s.players.map((p, i) => {
                const entry = p.categories[cat]
                return (
                  <div key={i} className="px-2 py-2 text-center">
                    {entry ? (
                      <span className={`text-xs font-medium ${entry.crossed ? 'text-muted' : 'text-text'}`}>
                        {entry.crossed ? '—' : entry.score}
                      </span>
                    ) : (
                      <span className="text-muted text-xs">·</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          <div className="grid bg-surface2" style={{ gridTemplateColumns: `2fr repeat(${s.players.length}, 1fr)` }}>
            <div className="px-3 py-2 text-muted text-xs font-semibold">Total</div>
            {s.players.map((p, i) => (
              <div key={i} className="px-2 py-2 text-center">
                <span className={`text-sm font-bold tabular-nums ${i === winnerIndex ? 'text-accent' : 'text-text'}`}>{p.totalScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        <Button variant="primary" size="lg" className="w-full" onClick={handleNew}>Nueva partida</Button>
        <Button variant="ghost" size="md" className="w-full" onClick={handleHome}>Volver al inicio</Button>
      </div>
      <AdPlaceholder />
    </div>
  )
}
