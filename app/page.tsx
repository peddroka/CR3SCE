import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsBar } from "@/components/landing/stats-bar";

// Lazy load: componentes abaixo do fold
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then((m) => ({ default: m.HowItWorks })));
const PillarsSection = dynamic(() => import("@/components/landing/pillars-section").then((m) => ({ default: m.PillarsSection })));
const CasesSection = dynamic(() => import("@/components/landing/cases-section").then((m) => ({ default: m.CasesSection })));
const TestimonialsSection = dynamic(() => import("@/components/landing/testimonials-section").then((m) => ({ default: m.TestimonialsSection })));
const VideoSection = dynamic(() => import("@/components/landing/video-section").then((m) => ({ default: m.VideoSection })));
const PricingSection = dynamic(() => import("@/components/landing/pricing-section").then((m) => ({ default: m.PricingSection })));
const FaqSection = dynamic(() => import("@/components/landing/faq-section").then((m) => ({ default: m.FaqSection })));
const FinalCta = dynamic(() => import("@/components/landing/final-cta").then((m) => ({ default: m.FinalCta })));
const InstagramBanner = dynamic(() => import("@/components/landing/instagram-banner").then((m) => ({ default: m.InstagramBanner })));
const Footer = dynamic(() => import("@/components/landing/footer").then((m) => ({ default: m.Footer })));

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <div className="h-px w-full bg-border" />
        <StatsBar />
        <div className="h-px w-full bg-border" />
        <HowItWorks />
        <div className="h-px w-full bg-border" />
        <PillarsSection />
        <div className="h-px w-full bg-border" />
        <CasesSection />
        <div className="h-px w-full bg-border" />
        <TestimonialsSection />
        <div className="h-px w-full bg-border" />
        <VideoSection />
        <div className="h-px w-full bg-border" />
        <PricingSection />
        <div className="h-px w-full bg-border" />
        <FaqSection />
        <FinalCta />
        <InstagramBanner />
      </main>
      <Footer />
    </>
  );
}
