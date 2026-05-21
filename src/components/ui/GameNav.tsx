import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface GameNavProps {
  center?: string
  onReiniciarResultados: () => void
  onNuevaPartida?: () => void // si no se pasa, Reiniciar solo muestra la opción de resultados
  extraContent?: React.ReactNode
}

export default function GameNav({ center, onReiniciarResultados, onNuevaPartida, extraContent }: GameNavProps) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-10 pb-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-muted text-sm active:opacity-60"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Inicio
        </button>
        {center && <span className="text-muted text-xs">{center}</span>}
        {extraContent}
        <button
          onClick={() => setShowModal(true)}
          className="text-muted text-sm active:opacity-60"
        >
          Reiniciar
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface rounded-2xl p-6 flex flex-col gap-3 shadow-2xl">
            <h2 className="text-text text-lg font-semibold text-center">Reiniciar</h2>
            <button
              onClick={() => { onReiniciarResultados(); setShowModal(false) }}
              className="h-12 rounded-xl bg-surface2 text-text font-medium active:scale-95 transition-transform"
            >
              Reiniciar resultados
            </button>
            {onNuevaPartida && (
              <button
                onClick={() => { onNuevaPartida(); setShowModal(false) }}
                className="h-12 rounded-xl bg-surface2 text-muted font-medium active:scale-95 transition-transform"
              >
                Nueva partida
              </button>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="h-10 text-muted text-sm active:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
