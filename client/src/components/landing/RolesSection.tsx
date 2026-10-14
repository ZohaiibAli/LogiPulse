import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, User, Bike, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const roles = [
  {
    icon: User,
    title: "Customer",
    tagline: "Send anything, anywhere",
    perks: ["Book a courier in under a minute", "Live tracking & instant chat", "Transparent, distance-based pricing"],
    cta: "Book as customer",
    to: "/register",
    highlight: false,
  },
  {
    icon: Bike,
    title: "Rider",
    tagline: "Earn on your own schedule",
    perks: ["InDrive-style request feed", "Go online / offline anytime", "Track earnings & delivery history"],
    cta: "Join as a rider",
    to: "/register?role=rider",
    highlight: true,
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    tagline: "Run the whole operation",
    perks: ["Approve & manage riders", "Live fleet overview", "Full order & revenue analytics"],
    cta: "Admin access",
    to: "/login/admin",
    highlight: false,
  },
]

export default function RolesSection() {
  return (
    <section id="pricing" className="bg-navy-gradient py-24 text-navy-foreground">
      <div className="container">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-300">Built for everyone</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            One platform, <span className="accent-italic text-violet-300">three roles.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "flex flex-col rounded-2xl border p-7",
                role.highlight
                  ? "border-transparent bg-brand-gradient shadow-xl shadow-indigo-600/30"
                  : "border-white/10 bg-white/5"
              )}
            >
              <div className={cn("mb-5 flex h-11 w-11 items-center justify-center rounded-xl", role.highlight ? "bg-white/20" : "bg-white/10")}>
                <role.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">{role.title}</h3>
              <p className={cn("mb-6 text-sm", role.highlight ? "text-white/80" : "text-white/50")}>{role.tagline}</p>

              <ul className="mb-8 flex-1 space-y-3 text-sm">
                {role.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className={role.highlight ? "text-white/90" : "text-white/70"}>{perk}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "w-full rounded-full",
                  role.highlight ? "bg-white text-indigo-700 hover:bg-white/90" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Link to={role.to}>{role.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
