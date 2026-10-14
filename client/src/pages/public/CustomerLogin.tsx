import RoleLoginForm from "@/components/auth/RoleLoginForm"

export default function CustomerLogin() {
  return (
    <RoleLoginForm
      role="customer"
      title="Welcome back"
      subtitle="Log in to book and track your deliveries."
    />
  )
}
