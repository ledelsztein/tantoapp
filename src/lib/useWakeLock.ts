import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean) {
  const lockRef = useRef<any>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const nav = navigator as any
    if (!nav?.wakeLock) return

    const acquire = async () => {
      if (document.hidden || lockRef.current || !activeRef.current) return
      try {
        lockRef.current = await nav.wakeLock.request('screen')
        // Cuando iOS libera el lock (batería, app switch, etc.) lo re-adquirimos
        lockRef.current.addEventListener('release', () => {
          lockRef.current = null
          if (activeRef.current && !document.hidden) {
            setTimeout(acquire, 500)
          }
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

    // Intento inicial
    acquire()

    // Recuperar cuando la app vuelve al frente
    const handleFocus = () => { if (!document.hidden) acquire() }
    document.addEventListener('visibilitychange', handleFocus)
    window.addEventListener('focus', handleFocus)

    // iOS necesita gesto del usuario — cada tap es una oportunidad
    const handleTap = () => { if (!lockRef.current) acquire() }
    document.addEventListener('touchend', handleTap, { passive: true })

    // Recheck cada 5s por si iOS lo liberó silenciosamente
    const interval = setInterval(() => {
      if (!document.hidden && !lockRef.current) acquire()
    }, 5000)

    return () => {
      document.removeEventListener('visibilitychange', handleFocus)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('touchend', handleTap)
      clearInterval(interval)
      release()
    }
  }, [active])
}
