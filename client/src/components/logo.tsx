import { Link } from "react-router-dom"
import { PackageSearch } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-indigo-500/30">
        <PackageSearch className="h-5 w-5" />
      </span>
      <span className={cn("text-lg font-extrabold tracking-tight", dark ? "text-white" : "text-foreground")}>
        Logi<span className="text-gradient">Pulse</span>
      </span>
    </Link>
  )
}
