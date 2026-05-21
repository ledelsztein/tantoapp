import type { ReactNode } from 'react'
import Button from './Button'

interface ModalProps {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
  children?: ReactNode
}

export default function Modal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  danger,
  children,
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
        <h2 className="text-text text-lg font-semibold text-center">{title}</h2>
        {message && <p className="text-muted text-sm text-center">{message}</p>}
        {children}
        <div className="flex gap-3 mt-1">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
