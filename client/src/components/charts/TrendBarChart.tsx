import { useState } from "react"

export interface TrendPoint {
  label: string   // short axis tick, e.g. "Oct 12"
  full: string     // full date for the tooltip, e.g. "Monday, Oct 12"
  value: number
}

interface Props {
  data: TrendPoint[]
  valuePrefix?: string   // e.g. "Rs " for currency
  height?: number
}

function compactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return `${Math.round(n)}`
}

export default function TrendBarChart({ data, valuePrefix = "", height = 180 }: Props) {
  const [hover, setHover] = useState<number | null>(null)

  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.value), 1)
  // Round the axis ceiling to a clean step above the max.
  const niceMax = (() => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(max || 1)))
    const step = magnitude / 2 || 1
    return Math.ceil((max * 1.15) / step) * step
  })()
  const gridSteps = [0, 0.25, 0.5, 0.75, 1].map((f) => niceMax * f)

  const plotHeight = height
  const barWidthPct = 100 / data.length
  const barMax = 24 // px cap per the mark spec
  const peakIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0)

  return (
    <div className="relative">
      <div className="relative" style={{ height: plotHeight }}>
        {/* hairline gridlines */}
        {gridSteps.map((g) => (
          <div
            key={g}
            className="absolute left-0 right-0 border-t border-border"
            style={{ bottom: `${(g / niceMax) * 100}%` }}
          >
            <span className="absolute -top-2 right-full mr-2 text-[10px] text-muted-foreground">
              {compactNumber(g)}
            </span>
          </div>
        ))}

        {/* bars */}
        <div className="absolute inset-0 flex items-end">
          {data.map((d, i) => {
            const pct = (d.value / niceMax) * 100
            const isHover = hover === i
            return (
              <div
                key={i}
                className="relative flex h-full flex-1 items-end justify-center"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="img"
                aria-label={`${d.full}: ${valuePrefix}${d.value}`}
              >
                <div
                  className="rounded-t-[4px] transition-opacity"
                  style={{
                    width: `min(${barMax}px, 70%)`,
                    height: `${Math.max(pct, d.value > 0 ? 2 : 0)}%`,
                    background: "hsl(var(--primary))",
                    opacity: hover === null || isHover ? 1 : 0.45,
                  }}
                />
                {isHover && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-lg">
                    <p className="font-semibold text-foreground">{valuePrefix}{d.value.toLocaleString()}</p>
                    <p className="text-muted-foreground">{d.full}</p>
                  </div>
                )}
                {i === peakIndex && hover === null && d.value > 0 && (
                  <span className="pointer-events-none absolute -top-5 text-[10px] font-semibold text-foreground">
                    {valuePrefix}{compactNumber(d.value)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* x-axis band — included in layout, never clipped */}
      <div className="mt-2 flex border-t border-border pt-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground" style={{ width: `${barWidthPct}%` }}>
            {i % Math.max(1, Math.ceil(data.length / 7)) === 0 ? d.label : ""}
          </div>
        ))}
      </div>
    </div>
  )
}
