import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ConverterDemo } from "@/components/landing/ConverterDemo";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { GamificationSection } from "@/components/landing/GamificationSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTA, Footer } from "@/components/landing/FinalCTA";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ConverterDemo />
        <section id="features">
          <FeaturesGrid />
        </section>
        <GamificationSection />
        <section id="pricing">
          <PricingSection />
        </section>
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
