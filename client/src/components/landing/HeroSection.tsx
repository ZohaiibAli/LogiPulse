import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Navigation, Package, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const partners = ["QuickMart", "Daraz Express", "FoodieGo", "UrbanBox", "SwiftLogix"]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient pb-20 pt-16 md:pt-24">
      <div className="pointer-events-none absolute -top-24 right-0 h-[480px] w-[480px] rounded-full bg-violet-300/30 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-40 h-[320px] w-[320px] rounded-full bg-indigo-300/30 blur-3xl" />

      <div className="container relative grid items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-card/70 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm dark:border-indigo-500/30 dark:text-indigo-300">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live in your city — riders online now
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Courier delivery,
            <br />
            made <span className="accent-italic text-gradient">effortlessly fast.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
            Book a rider in seconds, watch your parcel move on a live map, and chat
            directly with your courier — the all-in-one delivery platform that
            connects senders, riders, and businesses.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-full bg-brand-gradient px-7 text-base shadow-lg shadow-indigo-500/30">
              <Link to="/register">
                Book a courier <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-indigo-200 bg-card/70 px-7 text-base dark:border-indigo-500/30">
              <Link to="/register?role=rider">Become a rider</Link>
            </Button>
          </div>

          <div className="mt-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Trusted by businesses like</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 opacity-70">
              {partners.map((p) => (
                <span key={p} className="text-sm font-semibold text-foreground/70">{p}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -left-10 top-10 z-20 w-60 animate-float rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">#OTC-8565-09</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">On the way</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-brand-gradient" />
            </div>
          </div>

          <div className="absolute -right-6 bottom-20 z-20 w-48 animate-float rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur [animation-delay:1s]">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Star className="h-4 w-4 fill-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">4.9/5</p>
                <p className="text-[11px] text-muted-foreground">Rider rating avg.</p>
              </div>
            </div>
          </div>

          <div className="card-glow relative z-10 rounded-[2rem] border border-white/60 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Navigation className="h-4 w-4 text-primary" /> Live Delivery Map
              </span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            </div>

            <div className="relative h-56 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#eef1ff_0%,#f3eeff_100%)]">
              <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 300 200" fill="none">
                <path d="M20 160 C 80 60, 160 180, 280 40" stroke="#5B4FE8" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
              </svg>
              <span className="absolute left-4 top-[72%] flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-4 ring-white">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="absolute right-6 top-[14%] flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg ring-4 ring-white">
                <Package className="h-4 w-4" />
              </span>
              <span className="absolute left-[46%] top-[46%] flex h-6 w-6 items-center justify-center rounded-full bg-white text-indigo-600 shadow-md">
                <Navigation className="h-3 w-3 animate-pulse" />
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[["120", "Deliveries"], ["10", "Riders online"], ["4.9", "Avg. rating"]].map(([num, label]) => (
                <div key={label} className="rounded-xl bg-secondary/60 py-2">
                  <p className="text-lg font-extrabold text-foreground">{num}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
