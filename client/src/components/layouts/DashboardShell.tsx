import { useState, type ReactNode } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { Menu, LogOut } from "lucide-react"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/AuthContext"
import { cn, getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import ChatbotWidget from "@/components/chatbot/ChatbotWidget"
import ThemeToggle from "@/components/ThemeToggle"
import NotificationsBell from "@/components/notifications/NotificationsBell"

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

export default function DashboardShell({ navItems, roleLabel }: { navItems: NavItem[]; roleLabel: string }) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-gradient text-white shadow-md shadow-indigo-500/25"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
            {user ? getInitials(user.full_name) : "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.full_name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{roleLabel}</p>
          </div>
          <button onClick={() => logout()} aria-label="Log out" className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card shadow-xl">{sidebarContent}</aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationsBell />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ChatbotWidget />
    </div>
  )
}
