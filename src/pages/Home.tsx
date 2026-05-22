import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { useTrucoStore } from '../store/trucoStore'
import { useBasasStore } from '../store/basasStore'
import { useGeneralaStore } from '../store/generalaStore'
import { useDiezMilStore } from '../store/diezMilStore'
import { useBurakoStore } from '../store/burakoStore'
import AdPlaceholder from '../components/ui/AdPlaceholder'
import { Analytics } from '../lib/analytics'

function TrucoIllustration() {
  return (
    <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${4 + i * 26}, 8)`}>
          <rect x="1" y="1" width="20" height="46" rx="3" stroke="currentColor" strokeWidth="1.5" opacity={0.15 + i * 0.25}/>
          <line x1="3" y1="44" x2="3" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.4 + i * 0.2}/>
          {i >= 1 && <line x1="3" y1="44" x2="19" y2="44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.6}/>}
          {i >= 2 && <line x1="19" y1="44" x2="19" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.8}/>}
          {i >= 2 && <line x1="19" y1="4" x2="3" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.9}/>}
          {i >= 2 && <line x1="3" y1="44" x2="19" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
        </g>
      ))}
    </svg>
  )
}

function BasasIllustration() {
  const cards = [
    { x: 4, rotate: -18, opacity: 0.4 },
    { x: 16, rotate: -7, opacity: 0.65 },
    { x: 28, rotate: 5, opacity: 0.85 },
    { x: 40, rotate: 16, opacity: 1 },
  ]
  return (
    <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
      {cards.map((c, i) => (
        <g key={i} transform={`translate(${c.x + 16}, 30) rotate(${c.rotate}) translate(-10, -18)`}>
          <rect width="20" height="30" rx="3" stroke="currentColor" strokeWidth="1.5" opacity={c.opacity} fill="none"/>
          <line x1="4" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity={c.opacity * 0.7}/>
          <line x1="4" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity={c.opacity * 0.5}/>
        </g>
      ))}
    </svg>
  )
}

function GeneralaIllustration() {
  const dice = [
    { x: 8, y: 15 }, { x: 30, y: 8 }, { x: 52, y: 15 },
    { x: 18, y: 34 }, { x: 42, y: 34 },
  ]
  const dotPatterns: [number, number][][] = [
    [[9,9]],
    [[5,5],[13,13]],
    [[5,5],[9,9],[13,13]],
    [[5,5],[5,13],[13,5],[13,13]],
    [[5,5],[5,13],[9,9],[13,5],[13,13]],
  ]
  return (
    <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
      {dice.map((d, i) => (
        <g key={i} transform={`translate(${d.x}, ${d.y})`}>
          <rect width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" opacity={0.5 + i * 0.1}/>
          {dotPatterns[i]?.map(([dx, dy], j) => (
            <circle key={j} cx={dx} cy={dy} r="1.5" fill="currentColor" opacity={0.7 + i * 0.06}/>
          ))}
        </g>
      ))}
    </svg>
  )
}

function DiezMilIllustration() {
  return (
    <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
      <rect x="6" y="10" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" opacity={0.5}/>
      <circle cx="16" cy="20" r="2" fill="currentColor" opacity={0.6}/>
      <rect x="30" y="6" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" opacity={0.75}/>
      {[[36,12],[44,12],[36,20],[44,20]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.8" fill="currentColor" opacity={0.8}/>
      ))}
      <rect x="54" y="10" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" opacity={0.9}/>
      {[[58,14],[67,14],[58,20],[63,20],[67,20],[58,26],[67,26]].slice(0,5).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.8" fill="currentColor" opacity={0.95}/>
      ))}
      <text x="22" y="52" fill="currentColor" fontSize="11" fontWeight="700" opacity={0.9} fontFamily="sans-serif">10.000</text>
    </svg>
  )
}

function BurakoIllustration() {
  return (
    <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
      {[0,1,2,3,4,5,6].map((i) => (
        <g key={i} transform={`translate(${6 + i * 10}, ${16 + (i % 2) * 6})`}>
          <rect width="14" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" opacity={0.3 + i * 0.1} fill="none"/>
          <text x="7" y="14" fill="currentColor" fontSize="8" textAnchor="middle" opacity={0.4 + i * 0.08} fontFamily="sans-serif">{i + 2}</text>
        </g>
      ))}
    </svg>
  )
}

const GAMES = [
  {
    id: 'truco',
    label: 'Truco',
    path: '/truco',
    illustration: TrucoIllustration,
    available: true,
  },
  {
    id: 'basas',
    label: 'Bazas',
    path: '/basas',
    illustration: BasasIllustration,
    available: true,
  },
  {
    id: 'generala',
    label: 'Generala',
    path: '/generala',
    illustration: GeneralaIllustration,
    available: true,
  },
  {
    id: 'diez_mil',
    label: '10 Mil',
    path: '/diez-mil',
    illustration: DiezMilIllustration,
    available: true,
  },
  {
    id: 'burako',
    label: 'Burako',
    path: '/burako',
    illustration: BurakoIllustration,
    available: true,
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { isLight, toggle } = useThemeStore()
  const trucoPhase = useTrucoStore((s) => s.phase)
  const basasPhase = useBasasStore((s) => s.phase)
  const generalaPhase = useGeneralaStore((s) => s.phase)
  const diezMilPhase = useDiezMilStore((s) => s.phase)
  const burakoPhase = useBurakoStore((s) => s.phase)

  const gamePhases: Record<string, string> = {
    truco: trucoPhase,
    basas: basasPhase,
    generala: generalaPhase,
    diez_mil: diezMilPhase,
    burako: burakoPhase,
  }

  const handleShare = async () => {
    Analytics.shareTap()
    const url = window.location.origin
    const text = `Anotá los puntos con TantoApp → ${url}`
    if (navigator.share) {
      try { await navigator.share({ title: 'TantoApp', text, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 120 120" className="w-8 h-8 rounded-xl">
            <rect width="120" height="120" rx="28" fill="#0C1A0E"/>
            <rect x="28" y="28" width="64" height="64" rx="5" fill="none" stroke="#D4C9A0" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="30" y1="90" x2="90" y2="30" stroke="#D4C9A0" strokeWidth="5.5" strokeLinecap="round"/>
          </svg>
          <span className="text-text font-bold text-xl tracking-tight">TantoApp</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface2 text-muted active:scale-95 transition-transform"
            aria-label="Compartir"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="4.3" y1="7.3" x2="11.7" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4.3" y1="8.7" x2="11.7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={() => { Analytics.themeToggle(isLight ? 'dark' : 'light'); toggle() }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface2 text-muted active:scale-95 transition-transform"
            aria-label={isLight ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {isLight ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2.9" y1="2.9" x2="4.3" y2="4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="11.7" y1="11.7" x2="13.1" y2="13.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="11.7" y1="4.3" x2="13.1" y2="2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2.9" y1="13.1" x2="4.3" y2="11.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 10.5A6 6 0 0 1 5.5 2a6 6 0 1 0 8.5 8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Game grid */}
      <main className="flex-1 px-4 pb-4">
        <p className="text-muted text-xs font-medium uppercase tracking-widest mb-3 px-1">Juegos</p>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game) => {
            const Illustration = game.illustration
            const isActive = game.available && gamePhases[game.id] === 'playing'

            if (!game.available) {
              return (
                <div
                  key={game.id}
                  className="relative bg-surface rounded-2xl p-4 flex flex-col gap-3 opacity-40 border border-border"
                >
                  <div className="h-16 text-muted">
                    <Illustration />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text font-semibold text-sm">{game.label}</span>
                    <span className="text-[10px] text-muted bg-surface2 px-2 py-0.5 rounded-full">Pronto</span>
                  </div>
                </div>
              )
            }

            return (
              <button
                key={game.id}
                onClick={() => navigate(isActive ? `${game.path}/game` : `${game.path}/setup`)}
                className="relative bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3 text-left active:scale-[0.97] transition-transform"
              >
                <div className="h-16 text-accent">
                  <Illustration />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text font-semibold text-sm">{game.label}</span>
                  {isActive && (
                    <span className="w-3 h-3 rounded-full bg-success shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </main>

      <AdPlaceholder />
    </div>
  )
}
