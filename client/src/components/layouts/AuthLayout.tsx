import { type ComponentType, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { PackageSearch, MapPin, MessageCircle, ShieldCheck, Bike, Wallet, Navigation, Users, BarChart3 } from "lucide-react"
import { Logo } from "@/components/logo"

export interface AuthPanelContent {
  icon: ComponentType<{ className?: string }>
  heading: ReactNode
  perks: { icon: ComponentType<{ className?: string }>; text: string }[]
}

export const AUTH_PANELS: Record<"customer" | "rider" | "admin", AuthPanelContent> = {
  customer: {
    icon: PackageSearch,
    heading: (
      <>
        Courier delivery, <span className="accent-italic text-violet-300">reimagined.</span>
      </>
    ),
    perks: [
      { icon: MapPin, text: "Live map tracking on every delivery" },
      { icon: MessageCircle, text: "Direct chat with your rider + AI assistant" },
      { icon: ShieldCheck, text: "Riders verified by our admin team" },
    ],
  },
  rider: {
    icon: Bike,
    heading: (
      <>
        Earn on <span className="accent-italic text-violet-300">your own schedule.</span>
      </>
    ),
    perks: [
      { icon: Navigation, text: "InDrive-style live request feed" },
      { icon: Wallet, text: "Track earnings after every delivery" },
      { icon: MessageCircle, text: "Direct chat with customers" },
    ],
  },
  admin: {
    icon: ShieldCheck,
    heading: (
      <>
        Run the <span className="accent-italic text-violet-300">whole operation.</span>
      </>
    ),
    perks: [
      { icon: Users, text: "Approve riders & manage users" },
      { icon: BarChart3, text: "Platform-wide stats & revenue" },
      { icon: MapPin, text: "Full visibility into every order" },
    ],
  },
}

export default function AuthLayout({
  title,
  subtitle,
  panel = AUTH_PANELS.customer,
  children,
}: {
  title: string
  subtitle: string
  panel?: AuthPanelContent
  children: ReactNode
}) {
  const PanelIcon = panel.icon

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-gradient p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />

        <Logo dark />

        <div className="relative z-10 max-w-sm">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient">
            <PanelIcon className="h-6 w-6" />
          </span>
          <h2 className="mb-4 text-3xl font-extrabold leading-tight">{panel.heading}</h2>
          <ul className="space-y-4">
            {panel.perks.map((p) => (
              <li key={p.text} className="flex items-start gap-3 text-sm text-white/70">
                <p.icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} LogiPulse</p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ prompt, linkText, to }: { prompt: string; linkText: string; to: string }) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link to={to} className="font-semibold text-primary hover:underline">
        {linkText}
      </Link>
    </p>
  )
}
