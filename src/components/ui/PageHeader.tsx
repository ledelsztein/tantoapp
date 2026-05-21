import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  onBack?: () => void
}

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center gap-3 px-4 py-4">
      <button
        onClick={onBack ?? (() => navigate('/'))}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface2 text-muted active:scale-95 transition-transform"
        aria-label="Volver"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <h1 className="text-text font-semibold text-lg">{title}</h1>
    </header>
  )
}
