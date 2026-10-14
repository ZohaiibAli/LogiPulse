import { motion } from "framer-motion"
import { Package, PackageCheck, Navigation, CheckCircle2 } from "lucide-react"

interface CustomerSceneProps {
  className?: string
}

const STAGES = [
  { x: 40, Icon: Package },
  { x: 127, Icon: PackageCheck },
  { x: 213, Icon: Navigation },
  { x: 300, Icon: CheckCircle2 },
]

// Loop timing: a dot travels left -> right across the stages, each stage
// "lights up" as the dot passes it, holds fully lit, then all reset together
// and the dot jumps back to start — a continuous delivery-progress loop.
const TOTAL = 6
const TRAVEL_END = 3
const HOLD_END = 5

function stageTransition(index: number) {
  const delay = (index / (STAGES.length - 1)) * TRAVEL_END
  const popFraction = Math.min(0.25 / (TOTAL - delay), 0.15)
  const holdFraction = Math.min(Math.max((HOLD_END - delay) / (TOTAL - delay), popFraction + 0.05), 0.95)
  return { delay, duration: TOTAL - delay, repeatDelay: delay, times: [0, popFraction, holdFraction, 1] }
}

export default function CustomerScene({ className }: CustomerSceneProps) {
  return (
    <svg viewBox="0 0 340 200" className={className} fill="none">
      <line x1={STAGES[0].x} y1="100" x2={STAGES[STAGES.length - 1].x} y2="100" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />

      {/* traveling dot */}
      <motion.circle
        r={6}
        fill="white"
        cy={100}
        initial={{ cx: STAGES[0].x, opacity: 1 }}
        animate={{
          cx: [STAGES[0].x, STAGES[STAGES.length - 1].x, STAGES[STAGES.length - 1].x, STAGES[0].x, STAGES[0].x],
          opacity: [1, 1, 1, 0, 1],
        }}
        transition={{ duration: TOTAL, times: [0, TRAVEL_END / TOTAL, HOLD_END / TOTAL, HOLD_END / TOTAL + 0.01, 1], repeat: Infinity, ease: "easeInOut" }}
      />

      {STAGES.map((s, i) => {
        const t = stageTransition(i)
        return (
          <g key={i} transform={`translate(${s.x},100)`}>
            <circle r={16} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <motion.circle
              r={16}
              fill="#34d399"
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ ...t, repeat: Infinity, ease: "easeOut" }}
            />
            <s.Icon size={15} x={-7.5} y={-7.5} className="text-white" />
          </g>
        )
      })}
    </svg>
  )
}
