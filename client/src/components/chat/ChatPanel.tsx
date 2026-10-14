import { useEffect, useRef, useState } from "react"
import { Send, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, getInitials } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import type { Order } from "@/types"

interface ChatMessageLike {
  id: number
  sender_id: number
  message: string
}

interface Props {
  order: Order
  messages: ChatMessageLike[]
  sendChat: (message: string) => void
  connected: boolean
}

export default function ChatPanel({ order, messages, sendChat, connected }: Props) {
  const { user } = useAuth()
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const canChat = order.status !== "pending" && order.status !== "cancelled" && order.status !== "delivered"
  const otherPartyName = user?.id === order.customer.id ? order.rider?.full_name : order.customer.full_name

  const send = () => {
    const text = input.trim()
    if (!text) return
    sendChat(text)
    setInput("")
  }

  return (
    <div className="flex h-[420px] flex-col rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{otherPartyName ? `Chat with ${otherPartyName}` : "Delivery chat"}</span>
        </div>
        <span className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-500" : "bg-muted-foreground/40")} />
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {!canChat && (
          <p className="text-center text-xs text-muted-foreground">
            Chat opens once a rider accepts the order and stays open until delivery.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id
          return (
            <div key={m.id} className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
                {getInitials(mine ? user?.full_name || "" : otherPartyName || "?")}
              </div>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                  mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}
              >
                {m.message}
              </div>
            </div>
          )
        })}
      </div>

      <form
        className="flex items-center gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          value={input}
          disabled={!canChat}
          onChange={(e) => setInput(e.target.value)}
          placeholder={canChat ? "Type a message…" : "Chat unavailable"}
          className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={!canChat}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
