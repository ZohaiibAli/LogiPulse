import { Lottie } from "lottie-react"

interface AdminLottieProps {
  className?: string
}

// Served from client/public/lottie/admin.json — lottie-react fetches it at
// runtime so it never bundles into the main JS chunk. Same filter recipe as
// BikeLottie/OrderLottie so all three auth-panel animations read as one
// consistent color treatment.
export default function AdminLottie({ className }: AdminLottieProps) {
  return (
    <div className={className} style={{ filter: "grayscale(1) sepia(1) hue-rotate(230deg) saturate(3.6) brightness(0.92) contrast(1.1)" }}>
      <Lottie src="/lottie/admin.json" loop autoplay className="h-full w-full" />
    </div>
  )
}
