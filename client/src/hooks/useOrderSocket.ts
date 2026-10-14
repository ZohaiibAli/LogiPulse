import { useEffect, useRef, useState, useCallback } from "react"
import { WS_URL, TOKEN_KEY } from "@/lib/api"
import type { OrderStatus } from "@/types"

export interface SocketChatMessage {
  type: "chat"
  id: number
  order_id: number
  sender_id: number
  sender_name: string
  sender_role: string
  message: string
  created_at: string
}

export interface SocketLocationMessage {
  type: "location"
  order_id: number
  rider_id: number
  lat: number
  lng: number
}

export interface SocketStatusMessage {
  type: "status"
  order_id: number
  status: OrderStatus
  note?: string | null
  rider_id?: number
  rider_name?: string
}

export type SocketMessage = SocketChatMessage | SocketLocationMessage | SocketStatusMessage

export function useOrderSocket(orderId: number | undefined, onMessage: (msg: SocketMessage) => void) {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!orderId) return
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    const socket = new WebSocket(`${WS_URL}/ws/orders/${orderId}?token=${token}`)
    wsRef.current = socket

    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SocketMessage
        onMessageRef.current(data)
      } catch {
        // ignore malformed payloads
      }
    }

    return () => {
      socket.close()
      wsRef.current = null
    }
  }, [orderId])

  const sendChat = useCallback((message: string) => {
    wsRef.current?.readyState === WebSocket.OPEN &&
      wsRef.current.send(JSON.stringify({ type: "chat", message }))
  }, [])

  const sendLocation = useCallback((lat: number, lng: number) => {
    wsRef.current?.readyState === WebSocket.OPEN &&
      wsRef.current.send(JSON.stringify({ type: "location", lat, lng }))
  }, [])

  return { connected, sendChat, sendLocation }
}
