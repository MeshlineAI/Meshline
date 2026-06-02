import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base = the logo's near-black, so the mark sits seamlessly on it.
        ink: {
          DEFAULT: "#070A0F",
          950: "#05070B",
          900: "#090D14",
          800: "#0E141D",
          700: "#131B26",
          600: "#1A2532",
        },
        // Brand = the logo gradient: cyan → mint → lime. `accent` is the leading
        // cyan; `soft` the mint; `lime` the tail. `cyan.brand`/`acid` kept as
        // legacy aliases so older components retheme automatically.
        cyan: { brand: "#00E5FF" },
        accent: { DEFAULT: "#00E5FF", soft: "#46E0B4", lime: "#AEF73C", dim: "#00B6CC" },
        acid: { DEFAULT: "#AEF73C" }, // legacy token → now the lime tail of the logo
        muted: { DEFAULT: "#8A99AC", faint: "#556678" },
        // Risk tiers + severity stay semantic (meaningful, not decorative) — they
        // intentionally read as risk signals, distinct from the indigo brand hue.
        tier: {
          aaa: "#5BC8E6",
          aa: "#7BE0B0",
          a: "#E8C766",
          bb: "#E0934E",
          c: "#E06A78",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Newsreader", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: { "8xl": "88rem" },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Vivid brand glows from the logo gradient.
        "glow-cyan": "0 0 44px -10px rgba(0,229,255,0.6)",
        "glow-acid": "0 0 44px -10px rgba(174,247,60,0.5)",
        "glow-iris": "0 12px 36px -10px rgba(0,229,255,0.55)",
        "glow-brand": "0 14px 44px -12px rgba(0,229,255,0.5), 0 8px 30px -14px rgba(174,247,60,0.4)",
        panel: "0 18px 50px -24px rgba(0,0,0,0.85)",
        // Liquid-glass depth: outer soft shadow + inner top specular highlight.
        glass:
          "0 8px 32px -8px rgba(0,0,0,0.55), inset 0 1px 0 0 rgba(255,255,255,0.14), inset 0 -1px 1px 0 rgba(0,0,0,0.3)",
        "glass-lg":
          "0 20px 60px -16px rgba(0,0,0,0.7), inset 0 1.5px 0 0 rgba(255,255,255,0.18), inset 0 -1px 2px 0 rgba(0,0,0,0.35)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        // Liquid-glass specular sweep.
        sheen: {
          "0%": { transform: "translateX(-120%) skewX(-18deg)", opacity: "0" },
          "20%": { opacity: "0.55" },
          "60%, 100%": { transform: "translateX(220%) skewX(-18deg)", opacity: "0" },
        },
        "glass-bob": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-3px) scale(1.012)" },
        },
        // Slow, organic drift for the ambient gradient blooms — three variants
        // so the page-wide background never reads as a synced loop.
        "drift-a": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(6%,-5%,0) scale(1.12)" },
        },
        "drift-b": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1.05)" },
          "50%": { transform: "translate3d(-7%,6%,0) scale(0.95)" },
        },
        "drift-c": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(5%,4%,0) scale(1.1)" },
          "66%": { transform: "translate3d(-4%,-3%,0) scale(0.97)" },
        },
        // Slow pan of the dotted grid for subtle living texture.
        "grid-pan": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "28px 28px" },
        },
        // Flowing brand gradient across clipped text.
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Scroll hint dot travelling down its track.
        "scroll-cue": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateY(14px)", opacity: "0" },
        },
        // Soft expanding glow ring — for the highlighted pricing card.
        "pulse-ring": {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(0,229,255,0.35), 0 0 44px -16px rgba(0,229,255,0.55)" },
          "50%": { boxShadow: "0 0 0 1px rgba(0,229,255,0.6), 0 0 60px -12px rgba(0,229,255,0.85)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        blink: "blink 1.1s step-end infinite",
        shimmer: "shimmer 2s infinite",
        sheen: "sheen 3.6s ease-in-out infinite",
        "glass-bob": "glass-bob 7s ease-in-out infinite",
        "drift-a": "drift-a 22s ease-in-out infinite",
        "drift-b": "drift-b 26s ease-in-out infinite",
        "drift-c": "drift-c 30s ease-in-out infinite",
        "grid-pan": "grid-pan 6s linear infinite",
        "gradient-pan": "gradient-pan 6s ease-in-out infinite",
        "scroll-cue": "scroll-cue 1.8s ease-in-out infinite",
        "pulse-ring": "pulse-ring 3.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
