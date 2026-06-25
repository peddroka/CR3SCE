import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { SectionTimeline } from "@/components/landing/section-timeline";
import { PhoneScrollReveal } from "@/components/landing/phone-scroll-reveal";

// Lazy load: componentes abaixo do fold
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then((m) => ({ default: m.HowItWorks })));
const CasesSection = dynamic(() => import("@/components/landing/cases-section").then((m) => ({ default: m.CasesSection })));
const TestimonialsSection = dynamic(() => import("@/components/landing/testimonials-section").then((m) => ({ default: m.TestimonialsSection })));
const VideoSection = dynamic(() => import("@/components/landing/video-section").then((m) => ({ default: m.VideoSection })));
const PricingSection = dynamic(() => import("@/components/landing/pricing-section").then((m) => ({ default: m.PricingSection })));
const FaqSection = dynamic(() => import("@/components/landing/faq-section").then((m) => ({ default: m.FaqSection })));
const FinalCta = dynamic(() => import("@/components/landing/final-cta").then((m) => ({ default: m.FinalCta })));
const InstagramBanner = dynamic(() => import("@/components/landing/instagram-banner").then((m) => ({ default: m.InstagramBanner })));
const Footer = dynamic(() => import("@/components/landing/footer").then((m) => ({ default: m.Footer })));

// Cada item vira uma seção em tela cheia + um ponto na timeline lateral
const SECTIONS = [
  { id: "inicio", label: "Início" },
  { id: "como", label: "Como Funciona" },
  { id: "cases", label: "Cases" },
  { id: "depoimentos", label: "Depoimentos" },
  { id: "video", label: "Vídeo" },
  { id: "preco", label: "Preços" },
  { id: "faq", label: "Dúvidas" },
  { id: "comecar", label: "Começar" },
];

// Wrapper de seção em tela cheia com alinhamento de snap
const sectionClass =
  "flex min-h-screen flex-col justify-center snap-start";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <SectionTimeline sections={SECTIONS} />
      <main>
        <section id="inicio" className="snap-start">
          <HeroSection />
        </section>
        <PhoneScrollReveal />
        <div className="h-px w-full bg-border" />
        <StatsBar />
        <div className="h-px w-full bg-border" />
        <section id="como" className={sectionClass}>
          <HowItWorks />
        </section>
        <div className="h-px w-full bg-border" />
        <section id="cases" className={sectionClass}>
          <CasesSection />
        </section>
        <div className="h-px w-full bg-border" />
        <section id="depoimentos" className={sectionClass}>
          <TestimonialsSection />
        </section>
        <div className="h-px w-full bg-border" />
        <section id="video" className={sectionClass}>
          <VideoSection />
        </section>
        <div className="h-px w-full bg-border" />
        <section id="preco" className={sectionClass}>
          <PricingSection />
        </section>
        <div className="h-px w-full bg-border" />
        <section id="faq" className={sectionClass}>
          <FaqSection />
        </section>
        <section id="comecar" className={sectionClass}>
          <FinalCta />
        </section>
        <InstagramBanner />
      </main>
      <Footer />
    </>
  );
}
