import { Link } from "react-router-dom"
import { Home, RefreshCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error500() {
  return (
    <div className="flex min-h-screen flex-grow flex-col items-center justify-center bg-hero-gradient px-4 text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg">
        <TriangleAlert className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-bold">Something went wrong on our end</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Our server hit a snag delivering this page. Try again, or head back home.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild className="rounded-full bg-brand-gradient">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Home
          </Link>
        </Button>
        <Button variant="outline" className="rounded-full" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
      </div>
    </div>
  )
}
