import { motion } from "framer-motion"
import { Navigation2, ShieldCheck, Timer } from "lucide-react"

const points = [
  { icon: Timer, title: "Real-time ETA", desc: "Know exactly when your parcel will arrive, down to the minute." },
  { icon: Navigation2, title: "Live rider location", desc: "Every move your rider makes streams straight to your map." },
  { icon: ShieldCheck, title: "Verified riders", desc: "Every rider is manually approved by our admin team before going live." },
]

export default function LiveTrackingFeature() {
  return (
    <section className="bg-background py-24">
      <div className="container grid items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">Live tracking</p>
          <h2 className="mb-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            Know exactly <span className="accent-italic text-gradient">where your parcel is.</span>
          </h2>
          <p className="mb-8 max-w-md text-muted-foreground">
            No more guessing. Follow your delivery on a live Google Map, get status
            notifications at every step, and message your rider instantly if plans change.
          </p>

          <div className="space-y-5">
            {points.map((p) => (
              <div key={p.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="card-glow relative rounded-[2rem] border border-indigo-100 bg-[linear-gradient(145deg,#f6f3ff_0%,#eef1ff_100%)] p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Order #HG-20481</span>
            <span className="text-xs font-semibold text-emerald-600">ETA 12 min</span>
          </div>

          <div className="relative h-72 overflow-hidden rounded-2xl bg-white">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 260" fill="none">
              <path d="M30 220 C 100 120, 120 220, 170 140 S 260 40, 300 40" stroke="#5B4FE8" strokeWidth="3" strokeDasharray="1 10" strokeLinecap="round" />
            </svg>
            <span className="absolute left-7 top-[78%] h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
            <span className="absolute right-6 top-[12%] flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg ring-4 ring-white">
              <Navigation2 className="h-4 w-4" />
            </span>
            <span className="absolute left-[44%] top-[48%] h-10 w-10 animate-pulse-ring rounded-full border-2 border-indigo-400" />
            <span className="absolute left-[44%] top-[48%] flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
              <Navigation2 className="h-3 w-3" />
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
            <div>
              <p className="text-xs text-muted-foreground">Rider</p>
              <p className="text-sm font-semibold">Hamza A. — Bike</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">In transit</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
