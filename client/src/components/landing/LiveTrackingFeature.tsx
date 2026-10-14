import { motion } from "framer-motion"
import { Navigation2, ShieldCheck, Timer } from "lucide-react"
import RiderMapLottie from "@/components/illustrations/RiderMapLottie"

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
        >
          <RiderMapLottie className="h-96 w-full" />
        </motion.div>
      </div>
    </section>
  )
}
