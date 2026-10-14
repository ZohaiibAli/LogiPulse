import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="bg-hero-gradient py-24">
      <div className="container">
        <div className="card-glow relative overflow-hidden rounded-[2rem] bg-brand-gradient px-8 py-16 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative mx-auto max-w-xl text-3xl font-extrabold sm:text-4xl">
            Ready to send your first parcel?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/80">
            Join customers and riders already using LogiPulse for fast, trackable deliveries.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-full bg-white px-7 text-base text-indigo-700 hover:bg-white/90">
              <Link to="/register">
                Get started free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10">
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
