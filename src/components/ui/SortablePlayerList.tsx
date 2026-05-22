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

interface SortableItemProps {
  id: string
  name: string
  canRemove: boolean
  onChangeName: (v: string) => void
  onRemove: () => void
}

function SortableItem({ id, name, canRemove, onChangeName, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-2 bg-surface2 rounded-xl px-3 h-12 touch-none"
    >
      <div {...attributes} {...listeners} className="text-border shrink-0 cursor-grab active:cursor-grabbing p-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="4.5" cy="3"  r="1.2" fill="currentColor"/>
          <circle cx="9.5" cy="3"  r="1.2" fill="currentColor"/>
          <circle cx="4.5" cy="7"  r="1.2" fill="currentColor"/>
          <circle cx="9.5" cy="7"  r="1.2" fill="currentColor"/>
          <circle cx="4.5" cy="11" r="1.2" fill="currentColor"/>
          <circle cx="9.5" cy="11" r="1.2" fill="currentColor"/>
        </svg>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        className="flex-1 bg-transparent text-text outline-none text-sm"
        maxLength={12}
      />

      {canRemove && (
        <button onClick={onRemove} className="text-muted/50 active:scale-90 shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="11" y1="3" x2="3"  y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  )
}

interface SortablePlayerListProps {
  players: string[]
  ids: string[]
  maxPlayers?: number
  minPlayers?: number
  onPlayersChange: (players: string[], ids: string[]) => void
}

export default function SortablePlayerList({
  players,
  ids,
  maxPlayers = 8,
  minPlayers = 2,
  onPlayersChange,
}: SortablePlayerListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = ids.indexOf(active.id as string)
    const newIdx = ids.indexOf(over.id as string)
    onPlayersChange(arrayMove(players, oldIdx, newIdx), arrayMove(ids, oldIdx, newIdx))
  }

  const updateName = (i: number, v: string) => {
    const next = [...players]; next[i] = v
    onPlayersChange(next, ids)
  }

  const removePlayer = (i: number) => {
    onPlayersChange(players.filter((_, idx) => idx !== i), ids.filter((_, idx) => idx !== i))
  }

  const addPlayer = () => {
    if (players.length >= maxPlayers) return
    onPlayersChange(
      [...players, `J${players.length + 1}`],
      [...ids, `p-${players.length}-${Date.now()}`]
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {players.map((name, i) => (
            <SortableItem
              key={ids[i]}
              id={ids[i]}
              name={name}
              canRemove={players.length > minPlayers}
              onChangeName={(v) => updateName(i, v)}
              onRemove={() => removePlayer(i)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {players.length < maxPlayers && (
        <button
          onClick={addPlayer}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-border text-muted text-sm active:scale-95 transition-transform"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Agregar jugador
        </button>
      )}
    </div>
  )
}
