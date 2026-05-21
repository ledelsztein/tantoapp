import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none'

  const variants = {
    primary: 'bg-accent text-bg',
    secondary: 'bg-surface2 text-text border border-border',
    ghost: 'bg-transparent text-muted',
    danger: 'bg-danger/15 text-danger border border-danger/30',
  }

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-5 text-base',
    lg: 'h-14 px-6 text-lg',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
