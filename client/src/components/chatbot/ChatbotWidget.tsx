import { useEffect, useRef, useState } from "react"
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react"
import { api, getErrorMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  message: string
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && !loaded) {
      api.get("/chatbot/history").then(({ data }) => {
        setMessages(
          data.length
            ? data
            : [{ role: "assistant", message: "Hi! I'm the LogiPulse assistant. Ask me about booking, pricing, or tracking a delivery." }]
        )
        setLoaded(true)
      }).catch(() => {
        setMessages([{ role: "assistant", message: "Hi! I'm the LogiPulse assistant. Ask me anything about your deliveries." }])
        setLoaded(true)
      })
    }
  }, [open, loaded])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", message: text }])
    setSending(true)
    try {
      const { data } = await api.post("/chatbot/message", { message: text })
      setMessages((prev) => [...prev, { role: "assistant", message: data.reply }])
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", message: getErrorMessage(error) }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-xl shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-card shadow-2xl shadow-indigo-500/20">
          <div className="flex items-center gap-2 bg-brand-gradient px-4 py-3 text-white">
            <Sparkles className="h-4 w-4" />
            <div>
              <p className="text-sm font-semibold">LogiPulse Assistant</p>
              <p className="text-xs text-white/80">Powered by Gemini</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "self-end bg-primary text-primary-foreground"
                      : "self-start bg-muted text-foreground"
                  )}
                >
                  {m.message}
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-1 self-start rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              )}
            </div>
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
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your delivery…"
              className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
