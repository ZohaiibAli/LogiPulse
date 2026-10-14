import { useState } from "react"
import { motion } from "framer-motion"
import type { TrendPoint } from "./TrendBarChart"

type Vehicle = "truck" | "bike" | "radar"

interface Props {
  data: TrendPoint[]
  vehicle: Vehicle
  valuePrefix?: string
  height?: number
}

function compactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return `${Math.round(n)}`
}

const VIEW_W = 400
const VIEW_H = 190
const ROAD_Y = 128
const BAR_TOP = 26
const LABEL_Y = 146
const CHART_LEFT = 98
const CHART_RIGHT = 392

function VehicleIcon({ vehicle }: { vehicle: Vehicle }) {
  if (vehicle === "truck") {
    return (
      <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
        <defs>
          <linearGradient id="vtcCab" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6d5bf7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect x="14" y="78" width="40" height="42" rx="6" fill="url(#vtcCab)" />
        <rect x="19" y="86" width="20" height="16" rx="3" fill="#dbe3ff" opacity="0.9" />
        <rect x="52" y="70" width="34" height="58" rx="4" fill="hsl(var(--card))" stroke="#8d85f0" strokeWidth="2" />
        <circle cx="30" cy="124" r="9" fill="#241c4d" />
        <circle cx="72" cy="124" r="9" fill="#241c4d" />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "30px 124px" }}>
          <circle cx="30" cy="124" r="4" fill="#8d85f0" />
        </motion.g>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "72px 124px" }}>
          <circle cx="72" cy="124" r="4" fill="#8d85f0" />
        </motion.g>
      </motion.g>
    )
  }
  if (vehicle === "bike") {
    return (
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
        <defs>
          <linearGradient id="vtcBikeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6d5bf7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="112" r="16" fill="none" stroke="#8d85f0" strokeWidth="3" />
        <circle cx="64" cy="112" r="16" fill="none" stroke="#8d85f0" strokeWidth="3" />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "24px 112px" }}>
          <line x1="24" y1="100" x2="24" y2="124" stroke="#8d85f0" strokeWidth="1.5" />
          <line x1="12" y1="112" x2="36" y2="112" stroke="#8d85f0" strokeWidth="1.5" />
        </motion.g>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "64px 112px" }}>
          <line x1="64" y1="100" x2="64" y2="124" stroke="#8d85f0" strokeWidth="1.5" />
          <line x1="52" y1="112" x2="76" y2="112" stroke="#8d85f0" strokeWidth="1.5" />
        </motion.g>
        <path d="M24 112 L42 80 L64 112 M42 80 L50 80 M50 80 L58 96" stroke="url(#vtcBikeGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="50" cy="68" r="7" fill="#7c3aed" />
      </motion.g>
    )
  }
  return (
    <g>
      <defs>
        <linearGradient id="vtcRadarGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8d85f0" stopOpacity="0" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[14, 26, 38].map((r) => (
        <circle key={r} cx="44" cy="100" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="2 4" />
      ))}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "44px 100px" }}>
        <path d="M44 100 L82 100 A38 38 0 0 0 44 62 Z" fill="url(#vtcRadarGrad)" />
      </motion.g>
      <circle cx="44" cy="100" r="6" fill="hsl(var(--primary))" />
    </g>
  )
}

export default function VehicleTrendChart({ data, vehicle, valuePrefix = "", height = 180 }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.value), 1)
  const peakIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0)
  const barSlot = (CHART_RIGHT - CHART_LEFT) / data.length
  const barWidth = Math.min(16, barSlot * 0.55)
  const labelEvery = Math.max(1, Math.ceil(data.length / 6))

  return (
    <div style={{ height }}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full overflow-visible">
        <line x1="0" y1={ROAD_Y} x2={VIEW_W} y2={ROAD_Y} stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 6" />

        <VehicleIcon vehicle={vehicle} />

        {data.map((d, i) => {
          const barH = Math.max((d.value / max) * (ROAD_Y - BAR_TOP), d.value > 0 ? 3 : 0)
          const x = CHART_LEFT + i * barSlot + (barSlot - barWidth) / 2
          const y = ROAD_Y - barH
          const isHover = hover === i
          return (
            <g
              key={i}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              role="img"
              aria-label={`${d.full}: ${valuePrefix}${d.value}`}
            >
              <rect x={x} y={y} width={barWidth} height={barH} rx={3} fill="hsl(var(--primary))" opacity={hover === null || isHover ? 1 : 0.45} />
              {i % labelEvery === 0 && (
                <text x={x + barWidth / 2} y={LABEL_Y} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
                  {d.label}
                </text>
              )}
              {i === peakIndex && hover === null && d.value > 0 && (
                <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(var(--foreground))">
                  {valuePrefix}{compactNumber(d.value)}
                </text>
              )}
              {isHover && (
                <g>
                  <rect x={x + barWidth / 2 - 30} y={y - 36} width="60" height="28" rx="6" fill="hsl(var(--popover))" stroke="hsl(var(--border))" />
                  <text x={x + barWidth / 2} y={y - 21} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(var(--foreground))">
                    {valuePrefix}{d.value.toLocaleString()}
                  </text>
                  <text x={x + barWidth / 2} y={y - 10} textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">
                    {d.full}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
