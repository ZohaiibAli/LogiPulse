import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, TOKEN_KEY } from "@/lib/api"
import type { User, UserRole } from "@/types"

interface RegisterPayload {
  full_name: string
  email: string
  phone?: string
  password: string
  role: "customer" | "rider"
  vehicle_type?: string
  vehicle_number?: string
  cnic?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: (navigateHome?: boolean) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get<User>("/auth/me")
      setUser(data)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setUser(data.user)
    return data.user as User
  }

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post("/auth/register", payload)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setUser(data.user)
    return data.user as User
  }

  const logout = (navigateHome = true) => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    if (navigateHome) window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function roleHome(role: UserRole): string {
  if (role === "admin") return "/admin"
  if (role === "rider") return "/rider"
  return "/app"
}
