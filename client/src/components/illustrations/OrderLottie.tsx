import { Lottie } from "lottie-react"

interface OrderLottieProps {
  className?: string
}

// Served from client/public/lottie/order.json — lottie-react fetches it at
// runtime from this path, so the animation never bundles into the main JS
// chunk. A CSS filter (not an overlay div) nudges the source illustration's
// colors toward the brand's indigo/violet — filters only recolor drawn
// pixels, so transparent areas stay transparent instead of turning into a
// solid tinted rectangle the way a blend-mode overlay would.
export default function OrderLottie({ className }: OrderLottieProps) {
  return (
    <div className={className} style={{ filter: "grayscale(1) sepia(1) hue-rotate(230deg) saturate(3.6) brightness(0.92) contrast(1.1)" }}>
      <Lottie src="/lottie/order.json" loop autoplay className="h-full w-full" />
    </div>
  )
}
