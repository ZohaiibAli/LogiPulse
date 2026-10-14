import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Bell, Package, UserPlus, Inbox } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useMyOrders, usePendingRiders } from "@/hooks/useApi"
import { formatDate, ORDER_STATUS_LABEL, cn } from "@/lib/utils"

interface NotifItem {
  id: string
  icon: ReactNode
  text: string
  time: string
  to: string
}

const SEEN_KEY_PREFIX = "logipulse_notif_seen_"

export default function NotificationsBell() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const { data: orders } = useMyOrders()
  const { data: pendingRiders } = usePendingRiders(isAdmin)
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(0)

  const seenKey = user ? `${SEEN_KEY_PREFIX}${user.id}` : null

  useEffect(() => {
    if (!seenKey) return
    const stored = Number(localStorage.getItem(seenKey) || 0)
    setLastSeen(stored)
  }, [seenKey])

  const items = useMemo<NotifItem[]>(() => {
    const list: NotifItem[] = []

    if (isAdmin) {
      for (const rider of pendingRiders ?? []) {
        list.push({
          id: `rider-${rider.id}`,
          icon: <UserPlus className="h-4 w-4 text-indigo-500" />,
          text: `New rider application: ${rider.full_name}`,
          time: rider.created_at,
          to: "/admin/riders",
        })
      }
      for (const order of orders ?? []) {
        list.push({
          id: `order-${order.id}`,
          icon: <Package className="h-4 w-4 text-violet-500" />,
          text: `New order #${order.id} placed by ${order.customer.full_name}`,
          time: order.created_at,
          to: `/admin/orders/${order.id}`,
        })
      }
    } else {
      const base = user?.role === "rider" ? "/rider/orders" : "/app/orders"
      for (const order of orders ?? []) {
        for (const h of order.status_history) {
          list.push({
            id: `order-${order.id}-${h.status}-${h.created_at}`,
            icon: <Package className="h-4 w-4 text-indigo-500" />,
            text: `Order #${order.id} — ${ORDER_STATUS_LABEL[h.status] ?? h.status}`,
            time: h.created_at,
            to: `${base}/${order.id}`,
          })
        }
      }
    }

    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15)
  }, [isAdmin, orders, pendingRiders, user?.role])

  const unreadCount = items.filter((i) => new Date(i.time).getTime() > lastSeen).length

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next && seenKey) {
      const now = Date.now()
      localStorage.setItem(seenKey, String(now))
      setLastSeen(now)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-sm text-muted-foreground">
            <Inbox className="h-6 w-6" />
            Nothing yet
          </div>
        ) : (
          <div className="max-h-80 space-y-1">
            {items.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-accent",
                )}
              >
                {item.icon}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 leading-snug">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.time)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
