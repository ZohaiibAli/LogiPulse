import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Mail, Lock } from "lucide-react"
import { toast } from "sonner"

import AuthLayout, { AuthFooterLink, AUTH_PANELS } from "@/components/layouts/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, roleHome } from "@/contexts/AuthContext"
import { getErrorMessage } from "@/lib/api"
import type { UserRole } from "@/types"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

const ROLE_LABEL: Record<UserRole, string> = {
  customer: "customer",
  rider: "rider",
  admin: "admin",
}

const article = (role: UserRole) => (role === "admin" ? "an" : "a")

interface Props {
  role: UserRole
  title: string
  subtitle: string
  showSignup?: boolean
}

export default function RoleLoginForm({ role, title, subtitle, showSignup = true }: Props) {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const user = await login(values.email, values.password)

      if (user.role !== role) {
        logout(false)
        toast.error(
          `That's ${article(user.role)} ${ROLE_LABEL[user.role]} account, not ${article(role)} ${ROLE_LABEL[role]} account. Use the ${ROLE_LABEL[user.role]} login instead.`
        )
        return
      }

      const redirectTo = (location.state as { from?: string })?.from
      navigate(redirectTo || roleHome(user.role), { replace: true })
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}!`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={title} subtitle={subtitle} panel={AUTH_PANELS[role]}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register("password")} />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="h-11 w-full rounded-full bg-brand-gradient" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log in
        </Button>
      </form>

      {showSignup && (
        <AuthFooterLink prompt="Don't have an account?" linkText="Sign up" to={`/register?role=${role}`} />
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Not {article(role)} {ROLE_LABEL[role]}? <Link to="/login" className="font-semibold text-primary hover:underline">Choose a different login</Link>
      </p>
    </AuthLayout>
  )
}
