import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics, activeTimer } from './lib/analytics'
import { useWakeLock } from './lib/useWakeLock'
import { useTrucoStore } from './store/trucoStore'
import { useBasasStore } from './store/basasStore'
import { useGeneralaStore } from './store/generalaStore'
import { useDiezMilStore } from './store/diezMilStore'
import { useBurakoStore } from './store/burakoStore'
import Home from './pages/Home'
import TrucoSetup from './components/games/truco/TrucoSetup'
import TrucoGame from './components/games/truco/TrucoGame'
import TrucoEnd from './components/games/truco/TrucoEnd'
import BasasSetup from './components/games/basas/BasasSetup'
import BasasGame from './components/games/basas/BasasGame'
import BasasEnd from './components/games/basas/BasasEnd'
import GeneralaSetup from './components/games/generala/GeneralaSetup'
import GeneralaGame from './components/games/generala/GeneralaGame'
import GeneralaEnd from './components/games/generala/GeneralaEnd'
import DiezMilSetup from './components/games/diez-mil/DiezMilSetup'
import DiezMilGame from './components/games/diez-mil/DiezMilGame'
import DiezMilEnd from './components/games/diez-mil/DiezMilEnd'
import BurakoSetup from './components/games/burako/BurakoSetup'
import BurakoGame from './components/games/burako/BurakoGame'
import BurakoEnd from './components/games/burako/BurakoEnd'

function WakeLockManager() {
  const t = useTrucoStore(s => s.phase)
  const b = useBasasStore(s => s.phase)
  const g = useGeneralaStore(s => s.phase)
  const d = useDiezMilStore(s => s.phase)
  const bk = useBurakoStore(s => s.phase)
  useWakeLock([t, b, g, d, bk].some(p => p === 'playing'))
  return null
}

function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    Analytics.pageView(location.pathname)
    activeTimer.reset()
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <WakeLockManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/truco/setup" element={<TrucoSetup />} />
        <Route path="/truco/game" element={<TrucoGame />} />
        <Route path="/truco/end" element={<TrucoEnd />} />
        <Route path="/basas/setup" element={<BasasSetup />} />
        <Route path="/basas/game" element={<BasasGame />} />
        <Route path="/basas/end" element={<BasasEnd />} />
        <Route path="/generala/setup" element={<GeneralaSetup />} />
        <Route path="/generala/game" element={<GeneralaGame />} />
        <Route path="/generala/end" element={<GeneralaEnd />} />
        <Route path="/diez-mil/setup" element={<DiezMilSetup />} />
        <Route path="/diez-mil/game" element={<DiezMilGame />} />
        <Route path="/diez-mil/end" element={<DiezMilEnd />} />
        <Route path="/burako/setup" element={<BurakoSetup />} />
        <Route path="/burako/game" element={<BurakoGame />} />
        <Route path="/burako/end" element={<BurakoEnd />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
