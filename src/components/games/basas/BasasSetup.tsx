import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBasasStore } from '../../../store/basasStore'
import { Analytics } from '../../../lib/analytics'
import Button from '../../ui/Button'
import PageHeader from '../../ui/PageHeader'
import AdPlaceholder from '../../ui/AdPlaceholder'

function getOrderText(players: string[], firstDealerIndex: number, direction: 'cw' | 'ccw'): string {
  const n = players.length
  const step = direction === 'cw' ? 1 : n - 1
  return Array.from({ length: n }, (_, i) => players[(firstDealerIndex + i * step) % n] || `J${i + 1}`).join(' → ')
}

function getNewDealerIndex(dealer: number, oldIdx: number, newIdx: number): number {
  if (dealer === oldIdx) return newIdx
  if (oldIdx < newIdx && dealer > oldIdx && dealer <= newIdx) return dealer - 1
  if (oldIdx > newIdx && dealer >= newIdx && dealer < oldIdx) return dealer + 1
  return dealer
}

// ─── Sortable player row ──────────────────────────────────────────────────────

interface SortablePlayerProps {
  id: string
  name: string
  isDealer: boolean
  canRemove: boolean
  onSetDealer: () => void
  onChangeName: (v: string) => void
  onRemove: () => void
}

function SortablePlayer({ id, name, isDealer, canRemove, onSetDealer, onChangeName, onRemove }: SortablePlayerProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-2 bg-surface2 rounded-xl px-3 h-12 touch-none"
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="text-border shrink-0 cursor-grab active:cursor-grabbing p-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="4.5" cy="3" r="1.2" fill="currentColor"/>
          <circle cx="9.5" cy="3" r="1.2" fill="currentColor"/>
          <circle cx="4.5" cy="7" r="1.2" fill="currentColor"/>
          <circle cx="9.5" cy="7" r="1.2" fill="currentColor"/>
          <circle cx="4.5" cy="11" r="1.2" fill="currentColor"/>
          <circle cx="9.5" cy="11" r="1.2" fill="currentColor"/>
        </svg>
      </div>

      {/* Radio — first dealer */}
      <button
        onClick={onSetDealer}
        className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
        style={{
          borderColor: isDealer ? 'var(--accent)' : 'var(--border)',
          backgroundColor: isDealer ? 'var(--accent)' : 'transparent',
        }}
      >
        {isDealer && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--bg)' }}/>}
      </button>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        className="flex-1 bg-transparent text-text outline-none text-sm"
        maxLength={12}
      />

      {/* Remove */}
      {canRemove && (
        <button onClick={onRemove} className="text-muted/50 active:scale-90 shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  )
}

// ─── Main setup ───────────────────────────────────────────────────────────────

export default function BasasSetup() {
  const navigate = useNavigate()
  const startGame = useBasasStore((s) => s.startGame)

  const [players, setPlayers] = useState(['J1', 'J2', 'J3', 'J4'])
  const [ids, setIds] = useState(() => players.map((_, i) => `p-${i}-${Date.now()}`))
  const [maxBazas, setMaxBazas] = useState(7)
  const [format, setFormat] = useState<'ida' | 'ida_vuelta'>('ida')
  const [firstDealerIndex, setFirstDealerIndex] = useState(0)
  const [direction, setDirection] = useState<'cw' | 'ccw'>('cw')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = ids.indexOf(active.id as string)
    const newIdx = ids.indexOf(over.id as string)
    setIds(arrayMove(ids, oldIdx, newIdx))
    setPlayers(arrayMove(players, oldIdx, newIdx))
    setFirstDealerIndex(getNewDealerIndex(firstDealerIndex, oldIdx, newIdx))
  }

  const addPlayer = () => {
    if (players.length >= 8) return
    setPlayers([...players, `J${players.length + 1}`])
    setIds([...ids, `p-${players.length}-${Date.now()}`])
  }

  const removePlayer = (i: number) => {
    if (players.length <= 2) return
    setPlayers(players.filter((_, idx) => idx !== i))
    setIds(ids.filter((_, idx) => idx !== i))
    if (firstDealerIndex >= players.length - 1) setFirstDealerIndex(players.length - 2)
    else if (firstDealerIndex > i) setFirstDealerIndex(firstDealerIndex - 1)
  }

  const updateName = (i: number, v: string) => {
    const next = [...players]; next[i] = v; setPlayers(next)
  }

  const totalRounds = format === 'ida' ? maxBazas * 2 : maxBazas * 2

  const handleStart = () => {
    startGame({ players, maxBazas, format, firstDealerIndex, direction })
    Analytics.gameStart('basas', { players: players.length, max_bazas: maxBazas, format })
    navigate('/basas/game')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <PageHeader title="Bazas" />

      <div className="flex-1 px-4 py-2 flex flex-col gap-6 overflow-y-auto">

        {/* Player list with DnD */}
        <section className="flex flex-col gap-2">
          <p className="text-muted text-xs font-medium uppercase tracking-widest mb-1">Jugadores</p>
          <p className="text-muted text-[11px] -mt-1 mb-1">
            Arrastrá para reordenar · El punto indica quién reparte primero
          </p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {players.map((name, i) => (
                  <SortablePlayer
                    key={ids[i]}
                    id={ids[i]}
                    name={name}
                    isDealer={firstDealerIndex === i}
                    canRemove={players.length > 2}
                    onSetDealer={() => setFirstDealerIndex(i)}
                    onChangeName={(v) => updateName(i, v)}
                    onRemove={() => removePlayer(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {players.length < 8 && (
            <button onClick={addPlayer}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-border text-muted text-sm active:scale-95 transition-transform mt-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Agregar jugador
            </button>
          )}
        </section>

        {/* Max bazas */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Bazas máximas</p>
          <div className="flex items-center gap-4 bg-surface2 rounded-xl px-4 h-12">
            <button onClick={() => setMaxBazas(Math.max(1, maxBazas - 1))}
              className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text font-bold active:scale-95">−</button>
            <span className="flex-1 text-center text-text font-bold text-lg tabular-nums">{maxBazas}</span>
            <button onClick={() => setMaxBazas(maxBazas + 1)}
              className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text font-bold active:scale-95">+</button>
          </div>
        </section>

        {/* Format */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Formato</p>
          <div className="flex gap-2">
            {([
              ['ida', '1 › N, N › 1'],
              ['ida_vuelta', '1 › N, 1 › N'],
            ] as const).map(([f, label]) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${format === f ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-muted text-xs px-1">
            {format === 'ida'
              ? `1, 2 ... ${maxBazas}, ${maxBazas} ... 2, 1 — ${totalRounds} rondas`
              : `1, 2 ... ${maxBazas}, 1, 2 ... ${maxBazas} — ${totalRounds} rondas`}
          </p>
        </section>

        {/* Direction + order text */}
        <section className="flex flex-col gap-3">
          <p className="text-muted text-xs font-medium uppercase tracking-widest">Sentido</p>
          <div className="flex gap-2">
            {([['cw', '↻ Horario'], ['ccw', '↺ Antihorario']] as const).map(([d, label]) => (
              <button key={d} onClick={() => setDirection(d)}
                className={`flex-1 h-12 rounded-xl text-sm font-medium transition-colors ${direction === d ? 'bg-accent text-bg' : 'bg-surface2 text-muted'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="bg-surface2 rounded-xl px-4 py-3">
            <p className="text-muted text-xs mb-1">Orden de puja</p>
            <p className="text-text text-sm font-medium">{getOrderText(players, firstDealerIndex, direction)}</p>
          </div>
        </section>

      </div>

      <div className="px-4 py-4">
        <Button variant="primary" size="lg" className="w-full" onClick={handleStart}>
          Empezar partida
        </Button>
      </div>
      <AdPlaceholder />
    </div>
  )
}
