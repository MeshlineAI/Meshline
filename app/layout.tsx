import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { WalletModal } from "@/components/wallet/WalletModal";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

// Editorial display face for headlines — tight, characterful, premium.
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

// Soft serif for editorial emphasis — calm, readable, "trustworthy". Set in
// italic inside the grotesk headlines (the Atlas signature).
const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  // Newsreader is an optical-sizing variable font; Next can't compute auto
  // fallback metrics for it. Disable the override to keep the build clean.
  adjustFontFallback: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meshline.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Meshline — AI-powered onchain risk intelligence for Base",
    template: "%s · Meshline",
  },
  description:
    "Paste any Base contract, wallet, or app URL. Meshline runs a real onchain security scan and returns a full AI risk report with a 0–1000 MESH Score in under 30 seconds. EAS-attested. x402 native.",
  keywords: [
    "Base",
    "onchain security",
    "smart contract scanner",
    "rug pull detection",
    "wallet risk",
    "x402",
    "EAS",
    "MESH Score",
  ],
  openGraph: {
    type: "website",
    title: "Meshline — onchain risk intelligence for Base",
    description:
      "Real onchain security scans for Base contracts, wallets, and apps. AI risk report + MESH Score in 30 seconds.",
    siteName: "Meshline",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Meshline — onchain risk intelligence for Base",
    description:
      "Scan any Base contract, wallet, or app. AI risk report + MESH Score, EAS-attested, in 30 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${serif.variable}`}
    >
      <body className="min-h-screen bg-ink text-[#e7ecf3] antialiased">
        <WalletProvider>
          {children}
          <WalletModal />
        </WalletProvider>
      </body>
    </html>
  );
}
