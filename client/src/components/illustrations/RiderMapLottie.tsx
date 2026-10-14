import { Lottie } from "lottie-react"

interface RiderMapLottieProps {
  className?: string
}

// Served from client/public/lottie/rider_map.json — lottie-react fetches it
// at runtime so it never bundles into the main JS chunk. This source
// animation's accent is already a blue close to the brand hue, so only a
// light rotation is needed (unlike order.json's much wider palette).
export default function RiderMapLottie({ className }: RiderMapLottieProps) {
  return (
    <div className={className} style={{ filter: "hue-rotate(20deg) saturate(1.15)" }}>
      <Lottie src="/lottie/rider_map.json" loop autoplay className="h-full w-full" />
    </div>
  )
}
