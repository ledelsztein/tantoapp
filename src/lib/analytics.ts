// ─── Reemplazá G-XXXXXXXXXX con tu GA4 Measurement ID ────────────────────────
const GA_ID = 'G-73NB2NLT4K'

// ─── Active time tracker ──────────────────────────────────────────────────────
// Descuenta el tiempo con pantalla bloqueada / app en background

class ActiveTimer {
  private startMs: number = Date.now()
  private accumulatedMs: number = 0
  private isActive: boolean = !document.hidden

  constructor() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.isActive) {
          this.accumulatedMs += Date.now() - this.startMs
          this.isActive = false
        }
      } else {
        this.startMs = Date.now()
        this.isActive = true
      }
    })
  }

  getSeconds(): number {
    let total = this.accumulatedMs
    if (this.isActive) total += Date.now() - this.startMs
    return Math.round(total / 1000)
  }

  reset(): void {
    this.accumulatedMs = 0
    this.startMs = Date.now()
    this.isActive = !document.hidden
  }
}

export const activeTimer = new ActiveTimer()

// ─── GA4 helpers ──────────────────────────────────────────────────────────────

type GtagParams = Record<string, string | number | boolean>

function gtag(command: string, ...args: unknown[]) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] }
  if (w.gtag) w.gtag(command, ...args)
}

export function trackPageView(path: string) {
  gtag('config', GA_ID, { page_path: path })
}

export function trackEvent(name: string, params?: GtagParams) {
  gtag('event', name, params ?? {})
}

// ─── Eventos tipados ──────────────────────────────────────────────────────────

export type GameName = 'truco' | 'basas' | 'generala' | 'diez_mil' | 'burako'

export const Analytics = {
  // Pantallas
  pageView: (path: string) => trackPageView(path),

  // Partidas
  gameStart: (game: GameName, params: GtagParams) =>
    trackEvent('game_start', { game, ...params }),

  gameComplete: (game: GameName, duration_active_sec: number, params?: GtagParams) =>
    trackEvent('game_complete', { game, duration_active_sec, ...params }),

  gameAbandon: (game: GameName, duration_active_sec: number, params?: GtagParams) =>
    trackEvent('game_abandon', { game, duration_active_sec, ...params }),

  gameResume: (game: GameName) =>
    trackEvent('game_resume', { game }),

  // En partida
  roundComplete: (game: GameName, round_number: number) =>
    trackEvent('round_complete', { game, round_number }),

  scoreCorrection: (game: GameName) =>
    trackEvent('score_correction', { game }),

  burnTurn: () =>
    trackEvent('burn_turn', { game: 'diez_mil' }),

  scoreboardOpen: (game: GameName) =>
    trackEvent('scoreboard_open', { game }),

  // UX
  themeToggle: (to: 'light' | 'dark') =>
    trackEvent('theme_toggle', { to }),

  shareTap: () =>
    trackEvent('share_tap', {}),
}
