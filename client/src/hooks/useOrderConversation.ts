import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useChatMessages } from "@/hooks/useApi"
import { useOrderSocket, type SocketChatMessage, type SocketMessage } from "@/hooks/useOrderSocket"
import type { Order, OrderStatus } from "@/types"

export function useOrderConversation(order?: Order) {
  const qc = useQueryClient()
  const { data: history } = useChatMessages(order?.id)
  const [liveMessages, setLiveMessages] = useState<SocketChatMessage[]>([])
  const [riderPosition, setRiderPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [liveStatus, setLiveStatus] = useState<OrderStatus | null>(null)

  const handleMessage = (msg: SocketMessage) => {
    if (msg.type === "chat") {
      setLiveMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
    } else if (msg.type === "location") {
      setRiderPosition({ lat: msg.lat, lng: msg.lng })
    } else if (msg.type === "status") {
      setLiveStatus(msg.status)
      if (order) qc.invalidateQueries({ queryKey: ["orders", order.id] })
    }
  }

  const { sendChat, sendLocation, connected } = useOrderSocket(order?.id, handleMessage)

  const messages = [
    ...(history || []),
    ...liveMessages.filter((m) => !(history || []).some((h) => h.id === m.id)),
  ]

  return { messages, sendChat, sendLocation, connected, riderPosition, liveStatus }
}
