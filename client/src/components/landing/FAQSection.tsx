import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "How is the delivery price calculated?",
    a: "Pricing is based on the straight-line distance between pickup and drop-off plus a small base fare — you see the exact price before you confirm your booking.",
  },
  {
    q: "How do riders get approved?",
    a: "Anyone can sign up as a rider, but every account is reviewed and approved by an admin before they can accept delivery requests — keeping the platform safe.",
  },
  {
    q: "Can I chat with my rider?",
    a: "Yes — once a rider accepts your order, a live chat opens between you and them for the entire delivery, alongside the AI assistant for general questions.",
  },
  {
    q: "What areas are supported?",
    a: "LogiPulse works anywhere Google Maps has coverage — pickup and drop-off locations are set directly on the map.",
  },
]

export default function FAQSection() {
  return (
    <section id="faq" className="bg-background py-24">
      <div className="container max-w-3xl">
        <div className="mx-auto mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">FAQ</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Questions, answered.</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border px-4 data-[state=open]:bg-secondary/40 mb-3 border-indigo-100">
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
