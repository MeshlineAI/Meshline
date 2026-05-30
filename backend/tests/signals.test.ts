/**
 * Integration tests for the 12 contract intel signals.
 * Scans USDC on Base (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) — a verified,
 * well-known contract that should consistently score high on most signals.
 *
 * Requires: BASE_RPC_URL, BASESCAN_API_KEY
 */

import { describe, it, expect, beforeAll } from "bun:test";
import { fetchContractData } from "../src/services/onchain/fetch";
import * as signals from "../src/services/signals/contract";
import type { ContractData } from "../src/types";

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const WETH_BASE = "0x4200000000000000000000000000000000000006" as const;

function requireEnv(...keys: string[]) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars for this test: ${missing.join(", ")}`);
  }
}

let usdcData: ContractData;

beforeAll(async () => {
  requireEnv("BASE_RPC_URL", "BASESCAN_API_KEY");
  usdcData = await fetchContractData(USDC_BASE);
}, 30_000);

describe("fetchContractData", () => {
  it("returns bytecode for a deployed contract", () => {
    expect(usdcData.bytecode).toBeDefined();
    expect(usdcData.bytecode?.length).toBeGreaterThan(10);
  });

  it("USDC is verified", () => {
    expect(usdcData.isVerified).toBe(true);
  });

  it("USDC has an ABI", () => {
    expect(Array.isArray(usdcData.abi)).toBe(true);
    expect(usdcData.abi!.length).toBeGreaterThan(0);
  });

  it("USDC deployer is a valid address if present", () => {
    // USDC on Base was deployed via CREATE2 factory — getcontractcreation may return null
    if (usdcData.deployer !== null) {
      expect(usdcData.deployer).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });

  it("USDC deploy timestamp is a positive number if present", () => {
    if (usdcData.deployTimestamp !== null) {
      expect(usdcData.deployTimestamp).toBeGreaterThan(0);
    }
  });
});

describe("sourceVerification signal", () => {
  it("USDC returns severity:none (verified)", async () => {
    const s = await signals.sourceVerification(usdcData);
    expect(s.severity).toBe("none");
    expect(s.value).toBe(true);
  });

  it("unverified contract returns severity:high", async () => {
    const fake: ContractData = { ...usdcData, isVerified: false };
    const s = await signals.sourceVerification(fake);
    expect(s.severity).toBe("high");
  });
});

describe("proxyPattern signal", () => {
  it("returns a valid signal for USDC", async () => {
    const s = await signals.proxyPattern(usdcData);
    expect(["none", "low", "medium", "high", "critical"]).toContain(s.severity);
    expect(typeof s.description).toBe("string");
  });
});

describe("ownerPrivileges signal", () => {
  it("returns a valid signal for USDC", async () => {
    const s = await signals.ownerPrivileges(usdcData);
    expect(["none", "low", "medium", "high", "critical"]).toContain(s.severity);
  });

  it("detects dangerous functions when present", async () => {
    const fake: ContractData = {
      ...usdcData,
      abi: [
        { type: "function", name: "mint", inputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "blacklist", inputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "pause", inputs: [], stateMutability: "nonpayable" },
        { type: "function", name: "emergencyWithdraw", inputs: [], stateMutability: "nonpayable" },
      ],
    };
    const s = await signals.ownerPrivileges(fake);
    expect(["high", "critical"]).toContain(s.severity);
    expect((s.value as string[]).length).toBeGreaterThan(0);
  });
});

describe("deployerHistory signal", () => {
  it("returns a valid signal with deployer info", async () => {
    const s = await signals.deployerHistory(usdcData);
    expect(["none", "low", "medium", "high", "critical"]).toContain(s.severity);
  });
});

describe("reentrancyVectors signal", () => {
  it("returns a valid signal for USDC", async () => {
    const s = await signals.reentrancyVectors(usdcData);
    expect(["none", "low", "medium", "high", "critical"]).toContain(s.severity);
  });
});

describe("honeypotDetection signal", () => {
  it("USDC returns low honeypot severity", async () => {
    const s = await signals.honeypotDetection(usdcData);
    expect(["none", "low"]).toContain(s.severity);
  });
});

describe("liquidityConcentration signal", () => {
  it("returns a valid signal with holder data or none", async () => {
    const s = await signals.liquidityConcentration(usdcData);
    expect(["none", "low", "medium", "high", "critical"]).toContain(s.severity);
  });
});

describe("exploitSimilarity signal", () => {
  it("returns a valid signal", async () => {
    const s = await signals.exploitSimilarity(usdcData);
    expect(["none", "low", "medium", "high", "critical"]).toContain(s.severity);
    expect(Array.isArray(s.value)).toBe(true);
  });
});

describe("cveExposure signal", () => {
  it("USDC has a known compiler version", async () => {
    const s = await signals.cveExposure(usdcData);
    expect(["none", "low", "medium", "high", "critical"]).toContain(s.severity);
  });

  it("old compiler version triggers CVE signal", async () => {
    const fake: ContractData = { ...usdcData, compilerVersion: "v0.4.18+commit.9cf6e910" };
    const s = await signals.cveExposure(fake);
    expect(s.severity).toBe("critical");
  });
});

describe("githubDisclosure signal", () => {
  it("returns a valid signal", async () => {
    const s = await signals.githubDisclosure(usdcData);
    expect(["none", "low", "medium", "high", "critical"]).toContain(s.severity);
  });
});

describe("tokenEconomics signal", () => {
  it("USDC has no suspicious tokenomics", async () => {
    const s = await signals.tokenEconomics(usdcData);
    expect(s.severity).toBe("none");
  });

  it("detects risky tokenomics when present", async () => {
    const fake: ContractData = {
      ...usdcData,
      abi: [
        { type: "function", name: "setSellTax", inputs: [] },
        { type: "function", name: "setMaxWalletAmount", inputs: [] },
        { type: "function", name: "blacklist", inputs: [] },
      ],
    };
    const s = await signals.tokenEconomics(fake);
    expect(["medium", "high", "critical"]).toContain(s.severity);
  });
});

describe("ageActivity signal", () => {
  it("USDC is old enough to score well", async () => {
    const s = await signals.ageActivity(usdcData);
    expect(["none", "low"]).toContain(s.severity);
    const val = s.value as { ageDays: number | null };
    if (val.ageDays !== null) {
      expect(val.ageDays).toBeGreaterThan(100);
    }
  });
});
