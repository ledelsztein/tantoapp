import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  isLight: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isLight: false,
      toggle: () => {
        const next = !get().isLight
        set({ isLight: next })
        if (next) {
          document.documentElement.classList.add('light')
        } else {
          document.documentElement.classList.remove('light')
        }
      },
    }),
    { name: 'tanto-theme' }
  )
)

export function applyStoredTheme() {
  const raw = localStorage.getItem('tanto-theme')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.isLight) document.documentElement.classList.add('light')
    } catch {}
  }
}
