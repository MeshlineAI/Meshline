import type { Metadata } from "next";
import { ComingSoon } from "@/components/landing/ComingSoon";

export const metadata: Metadata = {
  title: "Coming soon",
  description:
    "Meshline is almost here — one MESH Score for every address on Base. Onchain risk intelligence, EAS-attested. Join the waitlist.",
  openGraph: {
    title: "Meshline — coming soon",
    description:
      "One MESH Score for every address on Base. Onchain risk intelligence, EAS-attested. Join the waitlist.",
  },
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
