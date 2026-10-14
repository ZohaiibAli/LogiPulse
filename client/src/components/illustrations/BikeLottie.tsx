import { Lottie } from "lottie-react"

interface BikeLottieProps {
  className?: string
}

// Served from client/public/lottie/bike.json — lottie-react fetches it at
// runtime from this path, so the ~170KB animation never bundles into the
// main JS chunk. Same filter recipe as OrderLottie (customer login) so both
// auth-panel animations read as one consistent color treatment rather than
// two different tints.
export default function BikeLottie({ className }: BikeLottieProps) {
  return (
    <div className={className} style={{ filter: "grayscale(1) sepia(1) hue-rotate(230deg) saturate(3.6) brightness(0.92) contrast(1.1)" }}>
      <Lottie src="/lottie/bike.json" loop autoplay className="h-full w-full" />
    </div>
  )
}
