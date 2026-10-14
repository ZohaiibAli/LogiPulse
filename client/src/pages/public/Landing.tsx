import HeroSection from "@/components/landing/HeroSection"
import HowItWorks from "@/components/landing/HowItWorks"
import LiveTrackingFeature from "@/components/landing/LiveTrackingFeature"
import RolesSection from "@/components/landing/RolesSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import FAQSection from "@/components/landing/FAQSection"
import CTASection from "@/components/landing/CTASection"

export default function Landing() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <LiveTrackingFeature />
      <RolesSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  )
}
