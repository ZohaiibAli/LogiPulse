import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Mail, Lock, User, Phone, Bike, User as UserIcon } from "lucide-react"
import { toast } from "sonner"

import AuthLayout, { AuthFooterLink, AUTH_PANELS } from "@/components/layouts/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth, roleHome } from "@/contexts/AuthContext"
import { getErrorMessage } from "@/lib/api"
import { cn } from "@/lib/utils"

const schema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "At least 6 characters"),
  role: z.enum(["customer", "rider"]),
  vehicle_type: z.string().optional(),
  vehicle_number: z.string().optional(),
  cnic: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [loading, setLoading] = useState(false)

  const defaultRole = params.get("role") === "rider" ? "rider" : "customer"

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole, vehicle_type: "bike" },
  })

  const role = watch("role")

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const user = await registerUser(values)
      navigate(roleHome(user.role), { replace: true })
      toast.success(`Welcome to SwiftShip, ${user.full_name.split(" ")[0]}!`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Book deliveries or start earning as a rider." panel={AUTH_PANELS[role]}>
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
        {(["customer", "rider"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setValue("role", r)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors",
              role === r ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
            )}
          >
            {r === "customer" ? <UserIcon className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
            {r === "customer" ? "Customer" : "Rider"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="full_name" placeholder="Jane Doe" className="pl-9" {...register("full_name")} />
          </div>
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="phone" placeholder="03xx-xxxxxxx" className="pl-9" {...register("phone")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register("password")} />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {role === "rider" && (
          <div className="space-y-4 rounded-xl border border-dashed border-indigo-200 bg-secondary/40 p-4">
            <p className="text-xs font-semibold text-indigo-700">Rider details</p>
            <div className="space-y-1.5">
              <Label>Vehicle type</Label>
              <Select defaultValue="bike" onValueChange={(v) => setValue("vehicle_type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vehicle_number">Vehicle number</Label>
                <Input id="vehicle_number" placeholder="ABC-123" {...register("vehicle_number")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cnic">CNIC</Label>
                <Input id="cnic" placeholder="xxxxx-xxxxxxx-x" {...register("cnic")} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your account will need admin approval before you can accept deliveries.
            </p>
          </div>
        )}

        <Button type="submit" className="h-11 w-full rounded-full bg-brand-gradient" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <AuthFooterLink prompt="Already have an account?" linkText="Log in" to={`/login/${role}`} />
    </AuthLayout>
  )
}
