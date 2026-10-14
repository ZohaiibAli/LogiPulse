import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { getInitials } from "@/lib/utils"

const testimonials = [
  {
    name: "Ayesha Raza",
    role: "Small business owner",
    quote: "I book 10+ deliveries a day for my store and the live tracking alone has cut my customer complaints in half.",
  },
  {
    name: "Hamza Abbasi",
    role: "Rider, 8 months",
    quote: "Going online and picking up requests feels exactly like InDrive — simple, fast, and I get to choose my hours.",
  },
  {
    name: "Faizan Khan",
    role: "University student",
    quote: "Sent important documents across the city in under 30 minutes. The chat with the rider made it so easy.",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="bg-background py-24">
      <div className="container">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">Testimonials</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Trusted by <span className="accent-italic text-gradient">thousands of users.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-glow rounded-2xl border bg-card p-6"
            >
              <div className="mb-4 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-foreground/80">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                  {getInitials(t.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
