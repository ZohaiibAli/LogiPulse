import { Bike, MapPin, Package } from "lucide-react"

interface BikeSceneProps {
  className?: string
  routeColor?: string
}

// A courier on a bike riding back and forth along a dashed route between a
// pickup pin and a drop-off pin — pure SVG <animateMotion>, no JS loop.
export default function BikeScene({ className, routeColor = "rgba(255,255,255,0.3)" }: BikeSceneProps) {
  return (
    <svg viewBox="0 0 340 200" className={className} fill="none">
      <path
        id="bike-route"
        d="M24 150 C 100 70, 180 180, 260 90 S 320 50, 316 40"
        stroke={routeColor}
        strokeWidth="3"
        strokeDasharray="7 9"
        strokeLinecap="round"
      />

      <g transform="translate(24,150)">
        <circle r="11" fill="white" />
        <MapPin size={13} x={-6.5} y={-6.5} className="text-indigo-600" />
      </g>

      <g transform="translate(316,40)">
        <circle r="11" fill="white" />
        <Package size={13} x={-6.5} y={-6.5} className="text-indigo-600" />
      </g>

      <g>
        <circle r="15" fill="white" className="drop-shadow-md" />
        <Bike size={16} x={-8} y={-8} className="text-indigo-600" />
        <animateMotion dur="5.5s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" rotate="auto">
          <mpath href="#bike-route" />
        </animateMotion>
      </g>
    </svg>
  )
}
