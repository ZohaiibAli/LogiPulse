import { useState } from "react"
import { toast } from "sonner"
import { Star, Loader2, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRateOrder } from "@/hooks/useApi"
import { getErrorMessage } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Order } from "@/types"

export default function RateDeliveryCard({ order }: { order: Order }) {
  const rateOrder = useRateOrder()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [review, setReview] = useState("")

  const submit = async () => {
    if (rating < 1) {
      toast.error("Pick a star rating first")
      return
    }
    try {
      await rateOrder.mutateAsync({ orderId: order.id, rating, review: review || undefined })
      toast.success("Thanks for the feedback!")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <PackageCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold">Your parcel was delivered!</p>
          <p className="text-sm text-muted-foreground">
            Order #{order.id}{order.rider ? ` · Rate ${order.rider.full_name}` : ""}
          </p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                (hovered || rating) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>

      <Textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Leave a quick review for your rider (optional)"
        className="mb-3 bg-card"
        rows={2}
      />

      <Button onClick={submit} disabled={rateOrder.isPending} className="rounded-full bg-brand-gradient">
        {rateOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit rating
      </Button>
    </div>
  )
}
