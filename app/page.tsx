import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InstagramBanner } from "@/components/landing/instagram-banner";
import { Navbar } from "@/components/landing/navbar";
import { PillarsSection } from "@/components/landing/pillars-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { StatsBar } from "@/components/landing/stats-bar";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CasesSection } from "@/components/landing/cases-section";
import { VideoSection } from "@/components/landing/video-section";

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
