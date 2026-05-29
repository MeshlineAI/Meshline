import { describe, it, expect } from "bun:test";
import { generateBadgeSvg } from "../src/services/badge";
import type { RiskTier } from "../src/types";

const tiers: RiskTier[] = ["AAA", "AA", "A", "BB", "C"];

describe("generateBadgeSvg", () => {
  it("returns valid SVG markup", () => {
    const svg = generateBadgeSvg({
      score: 924,
      tier: "AAA",
      target: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      reportUrl: "https://meshline.io/scan/abc",
    });
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("xmlns=");
  });

  it("includes the MESH score in the output", () => {
    const svg = generateBadgeSvg({ score: 724, tier: "AA", target: "0x1234", reportUrl: "" });
    expect(svg).toContain("724");
  });

  it("includes the tier in the output", () => {
    const svg = generateBadgeSvg({ score: 450, tier: "BB", target: "0x1234", reportUrl: "" });
    expect(svg).toContain("BB");
    expect(svg).toContain("HIGH RISK");
  });

  it("uses different colors for each tier", () => {
    const colors = tiers.map((tier) =>
      generateBadgeSvg({ score: 500, tier, target: "0x1234", reportUrl: "" })
    );
    const uniqueColorCount = new Set(
      colors.map((svg) => svg.match(/fill="(#[0-9a-f]+)"/i)?.[1])
    ).size;
    expect(uniqueColorCount).toBeGreaterThan(1);
  });

  it("truncates long contract addresses", () => {
    const svg = generateBadgeSvg({
      score: 800,
      tier: "AA",
      target: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      reportUrl: "",
    });
    // Full 42-char address should not appear verbatim
    expect(svg).not.toContain("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
    // Truncated form should be present
    expect(svg).toContain("0x8335");
  });

  it("each tier renders the correct label", () => {
    const expected: Record<RiskTier, string> = {
      AAA: "VERIFIED SAFE",
      AA: "LOW RISK",
      A: "CAUTION",
      BB: "HIGH RISK",
      C: "DANGER",
    };
    for (const [tier, label] of Object.entries(expected)) {
      const svg = generateBadgeSvg({ score: 500, tier: tier as RiskTier, target: "0x", reportUrl: "" });
      expect(svg).toContain(label);
    }
  });
});
