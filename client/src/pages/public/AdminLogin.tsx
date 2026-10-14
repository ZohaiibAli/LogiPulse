import RoleLoginForm from "@/components/auth/RoleLoginForm"

export default function AdminLogin() {
  return (
    <RoleLoginForm
      role="admin"
      title="Admin login"
      subtitle="Sign in to manage LogiPulse's platform."
      demoHint={{ email: "admin@logipulse.com", password: "admin12345" }}
      showSignup={false}
    />
  )
}
