import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth, roleHome } from "@/contexts/AuthContext"
import type { UserRole } from "@/types"
import { Loader2 } from "lucide-react"

export default function ProtectedRoute({ allow }: { allow: UserRole[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    const loginPath = allow.length === 1 ? `/login/${allow[0]}` : "/login"
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />
  }

  return <Outlet />
}
