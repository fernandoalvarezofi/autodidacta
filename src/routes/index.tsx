import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { MethodSection } from "@/components/landing/MethodSection";
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection";
import { EvidenceSection } from "@/components/landing/EvidenceSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTA, Footer } from "@/components/landing/FinalCTA";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <main>
        <Hero />
        <MethodSection />
        <CapabilitiesSection />
        <EvidenceSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
