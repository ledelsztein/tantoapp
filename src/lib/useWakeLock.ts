import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!('wakeLock' in navigator)) return

    const acquire = async () => {
      try {
        if (!document.hidden && !lockRef.current) {
          lockRef.current = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
          lockRef.current.addEventListener('release', () => { lockRef.current = null })
        }
      } catch {}
    }

    const release = async () => {
      if (lockRef.current) {
        await lockRef.current.release()
        lockRef.current = null
      }
    }

    if (active) {
      acquire()
    } else {
      release()
    }

    // Re-adquirir tras volver del background (requirido por la spec)
    const handleVisibility = () => {
      if (!document.hidden && active) acquire()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      release()
    }
  }, [active])
}
