import { motion } from "framer-motion"
import { Bike, MapPin, Package, Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface RiderHeroProps {
  name?: string
  online: boolean
  onToggle: (v: boolean) => void
  toggling?: boolean
}

export default function RiderHero({ name, online, onToggle, toggling }: RiderHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-lg shadow-indigo-500/25 sm:p-7"
    >
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={online ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 1.8, repeat: online ? Infinity : 0, ease: "easeInOut" }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur"
          >
            <Bike className="h-6 w-6" />
          </motion.span>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/70">
              <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-white/40"}`} />
              {online ? "You're online" : "You're offline"}
            </p>
            <h2 className="mt-0.5 text-xl font-extrabold sm:text-2xl">
              {online ? `Ready to roll${name ? `, ${name}` : ""}` : `Let's hit the road${name ? `, ${name}` : ""}`}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
          <span className="text-sm font-semibold">{online ? "Go offline" : "Go online"}</span>
          <Switch checked={online} onCheckedChange={onToggle} disabled={toggling} />
        </div>
      </div>

      <div className="relative z-10 mt-7 h-20 w-full sm:h-24">
        <svg viewBox="0 0 400 100" className="h-full w-full overflow-visible" fill="none">
          <path
            id="rider-route"
            d="M24 72 C 100 16, 170 110, 240 46 S 356 8, 378 34"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="3"
            strokeDasharray="7 9"
            strokeLinecap="round"
          />

          <g transform="translate(24,72)">
            <circle r="11" fill="white" />
            <MapPin size={13} x={-6.5} y={-6.5} className="text-indigo-600" />
          </g>

          <g transform="translate(378,34)">
            <circle r="11" fill="white" />
            <Package size={13} x={-6.5} y={-6.5} className="text-indigo-600" />
          </g>

          {online && (
            <g>
              <circle r="15" fill="white" className="drop-shadow-md" />
              <Bike size={16} x={-8} y={-8} className="text-indigo-600" />
              <animateMotion dur="5.5s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" rotate="auto">
                <mpath href="#rider-route" />
              </animateMotion>
            </g>
          )}
        </svg>
      </div>

      <div className="relative z-10 mt-2 flex items-center gap-1.5 text-xs text-white/70">
        <Zap className="h-3.5 w-3.5" />
        {online ? "We're matching you with nearby requests in real time." : "Go online to start receiving nearby delivery requests."}
      </div>
    </motion.div>
  )
}
