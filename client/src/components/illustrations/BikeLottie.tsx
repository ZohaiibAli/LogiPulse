import { Lottie } from "lottie-react"

interface BikeLottieProps {
  className?: string
}

// Served from client/public/lottie/bike.json — lottie-react fetches it at
// runtime from this path, so the ~170KB animation never bundles into the
// main JS chunk. A CSS filter (not an overlay div) nudges the source
// illustration's green toward the brand's indigo/violet — filters only
// recolor drawn pixels, so transparent areas stay transparent instead of
// turning into a solid tinted rectangle the way a blend-mode overlay would.
export default function BikeLottie({ className }: BikeLottieProps) {
  return (
    <div className={className} style={{ filter: "hue-rotate(135deg) saturate(1.3)" }}>
      <Lottie src="/lottie/bike.json" loop autoplay className="h-full w-full" />
    </div>
  )
}
