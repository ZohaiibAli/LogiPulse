import { Logo } from "@/components/logo"

export default function PublicFooter() {
  return (
    <footer className="bg-navy-gradient text-navy-foreground">
      <div className="container grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo dark />
          <p className="max-w-xs text-sm text-white/60">
            On-demand courier & delivery platform connecting customers with riders in real time —
            book, track, and deliver, all in one place.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Product</p>
          <a href="/#how-it-works" className="block text-white/60 hover:text-white">How it works</a>
          <a href="/#pricing" className="block text-white/60 hover:text-white">Pricing</a>
          <a href="/register" className="block text-white/60 hover:text-white">Become a rider</a>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Company</p>
          <a href="/#faq" className="block text-white/60 hover:text-white">FAQ</a>
          <a href="/login" className="block text-white/60 hover:text-white">Log in</a>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Get the app</p>
          <p className="text-white/60">Web app available now. Mobile apps coming soon.</p>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="container text-center text-xs text-white/40">
          © {new Date().getFullYear()} SwiftShip Logistics. Built for the hackathon demo.
        </p>
      </div>
    </footer>
  )
}
