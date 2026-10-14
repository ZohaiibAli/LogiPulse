// Stat-tile trend: a compact sparkline, line only (no axes/gridlines — a
// sparkline's job is shape, not reading exact values), 2px line, >=8px end
// marker, area wash at ~10% per the mark specs.
interface Props {
  values: number[]
  width?: number
  height?: number
  className?: string
}

export default function Sparkline({ values, width = 96, height = 32, className }: Props) {
  if (values.length < 2) return null

  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const padY = 4
  const stepX = width / (values.length - 1)

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = padY + (1 - (v - min) / range) * (height - padY * 2)
    return [x, y] as const
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},${height} L0,${height} Z`
  const [lastX, lastY] = points[points.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <path d={areaPath} fill="hsl(var(--primary) / 0.12)" stroke="none" />
      <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={4} fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth={2} />
    </svg>
  )
}
