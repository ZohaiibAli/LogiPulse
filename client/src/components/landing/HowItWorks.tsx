import { motion } from "framer-motion"
import { PackagePlus, UserCheck, Bike, PartyPopper } from "lucide-react"

const steps = [
  {
    icon: PackagePlus,
    title: "Book your parcel",
    desc: "Drop a pickup & drop-off pin, describe the package, and get an instant price.",
  },
  {
    icon: UserCheck,
    title: "A rider accepts",
    desc: "Nearby approved riders see your request and accept it instantly — InDrive style.",
  },
  {
    icon: Bike,
    title: "Track it live",
    desc: "Watch your rider move on the map in real time and chat with them directly.",
  },
  {
    icon: PartyPopper,
    title: "Delivered & done",
    desc: "Your receiver gets the package, you get a receipt — rate the experience.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-navy-gradient py-24 text-navy-foreground">
      <div className="container">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-300">How it works</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Delivering in <span className="accent-italic text-violet-300">4 simple steps</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <span className="absolute right-5 top-5 text-3xl font-black text-white/10">0{i + 1}</span>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient">
                <step.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
