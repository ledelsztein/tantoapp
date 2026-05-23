import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store/themeStore'

interface GameNavProps {
  center?: string
  onReiniciarResultados: () => void
  onNuevaPartida?: () => void
  extraContent?: React.ReactNode
}

export default function GameNav({ center, onReiniciarResultados, onNuevaPartida, extraContent }: GameNavProps) {
  const navigate = useNavigate()
  const { isLight, toggle } = useThemeStore()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-10 pb-3">
        {/* Left: Inicio + theme toggle */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1 text-muted text-sm active:opacity-60">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Inicio
          </button>
          <button onClick={toggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface2 text-muted active:scale-95 transition-transform"
            aria-label={isLight ? 'Modo oscuro' : 'Modo claro'}>
            {isLight ? (
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M14 10.5A6 6 0 0 1 5.5 2a6 6 0 1 0 8.5 8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {center && <span className="text-muted text-xs">{center}</span>}

        {/* Right: extraContent + Reiniciar */}
        <div className="flex items-center gap-2">
          {extraContent}
          <button onClick={() => setShowModal(true)}
            className="text-muted text-sm active:opacity-60">
            Reiniciar
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface rounded-2xl p-6 flex flex-col gap-3 shadow-2xl">
            <h2 className="text-text text-lg font-semibold text-center">Reiniciar</h2>
            <button onClick={() => { onReiniciarResultados(); setShowModal(false) }}
              className="h-12 rounded-xl bg-surface2 text-text font-medium active:scale-95 transition-transform">
              Reiniciar resultados
            </button>
            {onNuevaPartida && (
              <button onClick={() => { onNuevaPartida(); setShowModal(false) }}
                className="h-12 rounded-xl bg-surface2 text-muted font-medium active:scale-95 transition-transform">
                Nueva partida
              </button>
            )}
            <button onClick={() => setShowModal(false)}
              className="h-10 text-muted text-sm active:opacity-60">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
