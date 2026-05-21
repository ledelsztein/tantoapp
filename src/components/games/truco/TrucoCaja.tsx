interface CajaBoxProps {
  strokes: number // 0–5
  size?: number
}

function CajaBox({ strokes, size = 40 }: CajaBoxProps) {
  const on = 'var(--accent)'
  const off = 'rgba(255,255,255,0.1)'
  const c = (n: number) => (strokes >= n ? on : off)
  const w = (n: number) => (strokes >= n ? 2.2 : 1.5)
  const p = 5 // padding dentro del viewBox

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
    >
      {/* 1 — izquierdo */}
      <line x1={p} y1={size - p} x2={p} y2={p} stroke={c(1)} strokeWidth={w(1)} />
      {/* 2 — inferior */}
      <line x1={p} y1={size - p} x2={size - p} y2={size - p} stroke={c(2)} strokeWidth={w(2)} />
      {/* 3 — derecho */}
      <line x1={size - p} y1={size - p} x2={size - p} y2={p} stroke={c(3)} strokeWidth={w(3)} />
      {/* 4 — superior */}
      <line x1={p} y1={p} x2={size - p} y2={p} stroke={c(4)} strokeWidth={w(4)} />
      {/* 5 — diagonal */}
      <line x1={p} y1={size - p} x2={size - p} y2={p} stroke={c(5)} strokeWidth={w(5)} />
    </svg>
  )
}

interface TrucoCajaProps {
  points: number // 0–30
  section: 'malas' | 'buenas'
  boxSize?: number
}

export default function TrucoCaja({ points, section, boxSize = 40 }: TrucoCajaProps) {
  const offset = section === 'buenas' ? 15 : 0
  const sectionPoints = Math.max(0, Math.min(15, points - offset))
  const completeBoxes = Math.floor(sectionPoints / 5)
  const partialStrokes = sectionPoints % 5

  return (
    <div className="flex gap-2 items-center">
      {[0, 1, 2].map((i) => {
        const boxStrokes =
          i < completeBoxes ? 5 : i === completeBoxes ? partialStrokes : 0
        return <CajaBox key={i} strokes={boxStrokes} size={boxSize} />
      })}
    </div>
  )
}
