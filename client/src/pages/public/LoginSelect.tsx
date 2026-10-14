import { Link } from "react-router-dom"
import { ArrowRight, Bike, ShieldCheck, User } from "lucide-react"
import { Logo } from "@/components/logo"

const options = [
  {
    to: "/login/customer",
    icon: User,
    title: "Customer",
    desc: "Book deliveries, track live, chat with your rider.",
  },
  {
    to: "/login/rider",
    icon: Bike,
    title: "Rider",
    desc: "Go online, accept requests, manage earnings.",
  },
  {
    to: "/login/admin",
    icon: ShieldCheck,
    title: "Admin",
    desc: "Approve riders, manage users, view platform stats.",
  },
]

export default function LoginSelect() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero-gradient px-6 py-16">
      <div className="mb-10">
        <Logo />
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Log in as <span className="accent-italic text-gradient">who you are.</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Choose your account type to continue.</p>
      </div>

      <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-3">
        {options.map((o) => (
          <Link
            key={o.to}
            to={o.to}
            className="group card-glow flex flex-col items-start rounded-2xl border bg-card p-6 transition-transform hover:-translate-y-1"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <o.icon className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold">{o.title}</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">{o.desc}</p>
            <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-primary">
              Continue <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
