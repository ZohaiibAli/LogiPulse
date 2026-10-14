import { Link } from "react-router-dom"
import { PackageX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NoMatch() {
  return (
    <div className="flex min-h-screen flex-grow flex-col items-center justify-center bg-hero-gradient px-4 text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg">
        <PackageX className="h-8 w-8" />
      </span>
      <h2 className="text-7xl font-black text-gradient">404</h2>
      <h1 className="mt-2 text-2xl font-bold">This route got lost in transit</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button asChild className="mt-6 rounded-full bg-brand-gradient">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}
