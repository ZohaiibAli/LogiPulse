import RoleLoginForm from "@/components/auth/RoleLoginForm"

export default function AdminLogin() {
  return (
    <RoleLoginForm
      role="admin"
      title="Admin login"
      subtitle="Sign in to manage SwiftShip's platform."
      demoHint={{ email: "admin@swiftship.com", password: "admin12345" }}
      showSignup={false}
    />
  )
}
