import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean) {
  const lockRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any
    if (!nav?.wakeLock) return

    const acquire = async () => {
      if (document.hidden || lockRef.current) return
      try {
        lockRef.current = await nav.wakeLock.request('screen')
        lockRef.current.addEventListener('release', () => {
          lockRef.current = null
        })
      } catch {}
    }

    const release = async () => {
      const lock = lockRef.current
      if (!lock) return
      lockRef.current = null
      try { await lock.release() } catch {}
    }

    if (!active) {
      release()
      return
    }

    acquire()

    // Re-adquirir cuando vuelve al foco (iOS puede liberar el lock al cambiar de app)
    const handleFocus = () => { if (!document.hidden) acquire() }
    document.addEventListener('visibilitychange', handleFocus)
    window.addEventListener('focus', handleFocus)

    // Recheck periódico — iOS a veces libera el lock sin notificar
    const interval = setInterval(() => {
      if (!document.hidden && !lockRef.current) acquire()
    }, 10000)

    return () => {
      document.removeEventListener('visibilitychange', handleFocus)
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
      release()
    }
  }, [active])
}
