import { motion } from "framer-motion"

// Hand-placed "boxes" filling the cargo bay, irregular sizes/positions so the
// reveal reads as stacked packages, not a grid. Order here is fill order —
// index 0 appears first (closest to the cab), like loading back-to-front.
const BOXES = [
  { x: 98, y: 96, w: 36, h: 58, c: "#f3c988" },
  { x: 136, y: 66, w: 30, h: 42, c: "#eab766" },
  { x: 136, y: 110, w: 30, h: 44, c: "#f6d9a0" },
  { x: 168, y: 90, w: 26, h: 64, c: "#e3a95b" },
  { x: 196, y: 66, w: 34, h: 36, c: "#f3c988" },
  { x: 196, y: 104, w: 34, h: 50, c: "#eab766" },
  { x: 232, y: 66, w: 28, h: 50, c: "#f6d9a0" },
  { x: 232, y: 118, w: 28, h: 36, c: "#e3a95b" },
  { x: 262, y: 66, w: 32, h: 88, c: "#f3c988" },
]

const WHEELS = [
  { cx: 58, cy: 162 },
  { cx: 150, cy: 162 },
  { cx: 254, cy: 162 },
]

// Loop timing: boxes pop in one by one until FILL_END, stay fully loaded
// until HOLD_END, then all fade out together so the trailer empties and the
// cycle restarts at TOTAL — a continuous "empty -> full -> empty" loop.
const TOTAL = 6
const FILL_END = 2.4
const HOLD_END = 4.6

function boxTransition(index: number) {
  const delay = (index / BOXES.length) * FILL_END
  const duration = TOTAL - delay
  const popFraction = Math.min(0.3 / duration, 0.2)
  const holdFraction = Math.min(Math.max((HOLD_END - delay) / duration, popFraction + 0.05), 0.95)
  return {
    delay,
    duration,
    repeatDelay: delay,
    times: [0, popFraction, holdFraction, 1],
  }
}

interface TruckSceneProps {
  className?: string
  trailerFill?: string
  roadColor?: string
}

export default function TruckScene({ className, trailerFill = "hsl(var(--card))", roadColor = "#c7c3f0" }: TruckSceneProps) {
  return (
    <svg viewBox="0 0 340 200" className={className} fill="none">
      <defs>
        <linearGradient id="truckCabGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6d5bf7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <clipPath id="trailerWindow">
          <rect x={96} y={64} width={200} height={94} rx={2} />
        </clipPath>
      </defs>

      {/* road */}
      <line x1="10" y1="178" x2="330" y2="178" stroke={roadColor} strokeWidth="3" strokeDasharray="10 9" opacity="0.6" />

      {/* trailing motion lines */}
      <motion.g
        animate={{ opacity: [0.7, 0.2, 0.7], x: [0, -6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <line x1="8" y1="118" x2="26" y2="118" stroke="#9b94e8" strokeWidth="3" strokeLinecap="round" />
        <line x1="4" y1="136" x2="20" y2="136" stroke="#9b94e8" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* whole truck gently floats */}
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
        {/* cab */}
        <rect x="32" y="94" width="62" height="68" rx="10" fill="url(#truckCabGrad)" />
        <rect x="40" y="104" width="32" height="26" rx="4" fill="#dbe3ff" opacity="0.9" />
        <rect x="32" y="150" width="62" height="12" rx="4" fill="#4c3fc9" />

        {/* trailer frame */}
        <rect x="92" y="60" width="210" height="100" rx="8" fill={trailerFill} stroke="#8d85f0" strokeWidth="2.5" />

        {/* filling cargo */}
        <g clipPath="url(#trailerWindow)">
          {BOXES.map((b, i) => {
            const t = boxTransition(i)
            return (
              <motion.rect
                key={i}
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={3}
                fill={b.c}
                stroke="#c9924f"
                strokeWidth="1"
                style={{ transformOrigin: `${b.x + b.w / 2}px ${b.y + b.h}px` }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.4] }}
                transition={{ ...t, repeat: Infinity, ease: "easeOut" }}
              />
            )
          })}
        </g>

        {/* wheels */}
        {WHEELS.map((w, i) => (
          <g key={i}>
            <circle cx={w.cx} cy={w.cy} r={14} fill="#241c4d" />
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: `${w.cx}px ${w.cy}px` }}
            >
              <circle cx={w.cx} cy={w.cy} r={6} fill="#8d85f0" />
              <line x1={w.cx - 6} y1={w.cy} x2={w.cx + 6} y2={w.cy} stroke="#241c4d" strokeWidth="1.5" />
              <line x1={w.cx} y1={w.cy - 6} x2={w.cx} y2={w.cy + 6} stroke="#241c4d" strokeWidth="1.5" />
            </motion.g>
          </g>
        ))}
      </motion.g>
    </svg>
  )
}
