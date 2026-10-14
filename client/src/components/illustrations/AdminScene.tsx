import { motion } from "framer-motion"
import { ShieldCheck } from "lucide-react"

interface AdminSceneProps {
  className?: string
  ringColor?: string
  blipFill?: string
}

const CENTER = { x: 150, y: 100 }
const RADII = [26, 46, 66]

// Scattered "fleet" blips the sweep passes over, each pulsing on its own
// offset so the radar always has something lighting up.
const BLIPS = [
  { x: 130, y: 70, delay: 0 },
  { x: 180, y: 85, delay: 0.5 },
  { x: 115, y: 115, delay: 1 },
  { x: 165, y: 130, delay: 1.5 },
  { x: 195, y: 110, delay: 2 },
]

const BAR_HEIGHTS = [0.5, 0.8, 0.35, 0.95, 0.6]

export default function AdminScene({ className, ringColor = "rgba(255,255,255,0.18)", blipFill = "#34d399" }: AdminSceneProps) {
  return (
    <svg viewBox="0 0 340 200" className={className} fill="none">
      {/* radar rings */}
      {RADII.map((r) => (
        <circle key={r} cx={CENTER.x} cy={CENTER.y} r={r} stroke={ringColor} strokeWidth="1.5" strokeDasharray="3 5" />
      ))}

      {/* rotating sweep */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
      >
        <defs>
          <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8d85f0" stopOpacity="0" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path
          d={`M ${CENTER.x} ${CENTER.y} L ${CENTER.x + RADII[2]} ${CENTER.y} A ${RADII[2]} ${RADII[2]} 0 0 0 ${CENTER.x + RADII[2] * Math.cos(-0.5)} ${CENTER.y + RADII[2] * Math.sin(-0.5)} Z`}
          fill="url(#sweepGrad)"
        />
      </motion.g>

      {/* center hub */}
      <circle cx={CENTER.x} cy={CENTER.y} r="8" fill="white" />
      <ShieldCheck size={10} x={CENTER.x - 5} y={CENTER.y - 5} className="text-indigo-600" />

      {/* fleet blips */}
      {BLIPS.map((b, i) => (
        <g key={i}>
          <motion.circle
            cx={b.x}
            cy={b.y}
            r={10}
            fill={blipFill}
            animate={{ scale: [0.4, 1.3, 0.4], opacity: [0, 0.35, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: b.delay, ease: "easeOut" }}
            style={{ transformOrigin: `${b.x}px ${b.y}px` }}
          />
          <circle cx={b.x} cy={b.y} r={4} fill={blipFill} />
        </g>
      ))}

      {/* live stats bars, bottom-right */}
      <g transform="translate(252,150)">
        {BAR_HEIGHTS.map((h, i) => (
          <motion.rect
            key={i}
            x={i * 11}
            width={6}
            rx={2}
            fill="#a78bfa"
            initial={false}
            animate={{ height: [h * 14, h * 34, h * 14], y: [34 - h * 14, 34 - h * 34, 34 - h * 14] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </g>
    </svg>
  )
}
