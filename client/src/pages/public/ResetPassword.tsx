import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Lock, ShieldAlert } from "lucide-react"

import AuthLayout from "@/components/layouts/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useResetPassword } from "@/hooks/useApi"
import { getErrorMessage } from "@/lib/api"

const schema = z
  .object({
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

type FormValues = z.infer<typeof schema>

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()
  const resetPassword = useResetPassword()
  const [done, setDone] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    if (!token) return
    try {
      await resetPassword.mutateAsync({ token, new_password: values.new_password })
      setDone(true)
      toast.success("Password reset — you can log in now")
      setTimeout(() => navigate("/login"), 1500)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Reset password" subtitle="This link looks incomplete.">
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500" />
          <p className="text-sm text-muted-foreground">
            No reset token found in the link. Request a new one from the{" "}
            <Link to="/forgot-password" className="font-semibold text-primary hover:underline">forgot password</Link> page.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your account.">
      {done ? (
        <p className="text-sm text-muted-foreground">Redirecting you to log in…</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new_password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="new_password" type="password" className="pl-9" {...register("new_password")} />
            </div>
            {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirm_password" type="password" className="pl-9" {...register("confirm_password")} />
            </div>
            {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>

          <Button type="submit" className="h-11 w-full rounded-full bg-brand-gradient" disabled={resetPassword.isPending}>
            {resetPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
