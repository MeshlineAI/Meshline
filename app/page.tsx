import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/nav/Footer";
import { ScanlineOverlay } from "@/components/ui/ScanlineOverlay";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ScanTypes } from "@/components/landing/ScanTypes";
import { AgentSection } from "@/components/landing/AgentSection";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { ConnectCTA } from "@/components/landing/ConnectCTA";
import { Reveal } from "@/components/ui/Reveal";
import { DrawLine } from "@/components/ui/DrawLine";

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <ScanlineOverlay />
      <Nav />
      <main className="relative">
        <Hero />
        <StatsBar />
        <HowItWorks />
        <ProblemSection />
        <ScanTypes />
        <AgentSection />
        <Pricing />
        <FAQ />

        {/* closing CTA */}
        <section className="relative z-10 overflow-hidden py-20 sm:py-28">
          <div className="grid-dots animate-grid-pan pointer-events-none absolute inset-0 opacity-40" />
          <DrawLine className="pointer-events-none absolute inset-x-0 top-0" />
          <div className="container-mesh relative">
            <Reveal
              blur
              className="panel glass-specular mx-auto max-w-3xl overflow-hidden px-6 py-14 text-center sm:px-8 sm:py-16"
            >
              <h2 className="mx-auto max-w-2xl font-display text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl">
                Read the risk before you{" "}
                <span className="text-gradient-flow">trust it.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] text-muted">
                Open your dashboard and run a scan — a clear MESH Score and full report, attested
                onchain, in about 30 seconds.
              </p>
              <div className="mt-9 flex justify-center">
                <ConnectCTA />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
