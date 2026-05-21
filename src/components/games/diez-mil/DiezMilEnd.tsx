import { useNavigate } from 'react-router-dom'
import { useDiezMilStore } from '../../../store/diezMilStore'
import Button from '../../ui/Button'
import AdPlaceholder from '../../ui/AdPlaceholder'

export default function DiezMilEnd() {
  const navigate = useNavigate()
  const s = useDiezMilStore()

  const winner = s.winner !== null ? s.players[s.winner]?.name : '—'
  const sorted = [...s.players]
    .map((p, i) => ({ ...p, i }))
    .sort((a, b) => b.totalScore - a.totalScore)

  const handleHome = () => { s.abandonGame(); navigate('/') }
  const handleNew = () => { s.abandonGame(); navigate('/diez-mil/setup') }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <div className="flex flex-col items-center gap-2 text-center px-5 pt-16 pb-6">
        <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mb-1">
          <span className="text-accent font-bold text-lg">10K</span>
        </div>
        <h1 className="text-text text-2xl font-bold">{winner}</h1>
        <p className="text-muted text-sm">llegó a 10.000</p>
      </div>

      <div className="flex-1 px-5">
        <div className="bg-surface rounded-2xl overflow-hidden">
          {sorted.map((p, rank) => {
            const pct = Math.min(100, (p.totalScore / 10000) * 100)
            return (
              <div key={p.i} className={`px-4 py-3.5 border-b border-border last:border-0 ${rank === 0 ? 'bg-accent/5' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted text-xs">{rank + 1}.</span>
                    <span className="text-text font-medium">{p.name}</span>
                  </div>
                  <span className={`font-bold tabular-nums ${rank === 0 ? 'text-accent' : 'text-muted'}`}>
                    {p.totalScore.toLocaleString('es')}
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${rank === 0 ? 'bg-accent' : 'bg-muted/40'}`} style={{ width: `${pct}%` }}/>
                </div>
              </div>
            )
          })}
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
