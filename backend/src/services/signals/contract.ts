import type { ContractData, Signal, Severity } from "../../types";
import * as basescan from "../onchain/basescan";
import { publicClient } from "../onchain/client";
import { config } from "../../config";
import axios from "axios";

// ── helpers ──────────────────────────────────────────────────────────────────

function abiNames(abi: ContractData["abi"]): Set<string> {
  if (!abi) return new Set();
  return new Set(
    abi
      .filter((i) => i.type === "function" && i.name)
      .map((i) => i.name!.toLowerCase())
  );
}

/**
 * Disassembles bytecode into an ordered list of opcodes, correctly skipping
 * the immediate operand bytes of PUSH1–PUSH32 (0x60–0x7f). Without this, the
 * data bytes inside a PUSH would be misread as instructions.
 */
function disassemble(bytecode: `0x${string}` | null): number[] {
  if (!bytecode || bytecode.length < 4) return [];
  const hex = bytecode.slice(2);
  const ops: number[] = [];
  for (let i = 0; i + 2 <= hex.length; ) {
    const op = parseInt(hex.slice(i, i + 2), 16);
    if (Number.isNaN(op)) break;
    ops.push(op);
    i += 2;
    // PUSH1 (0x60) .. PUSH32 (0x7f) carry 1..32 immediate bytes
    if (op >= 0x60 && op <= 0x7f) {
      const n = op - 0x60 + 1;
      i += n * 2;
    }
  }
  return ops;
}

/** True if the contract's real instruction stream contains the given opcode. */
function hasOpcode(ops: number[], opcode: number): boolean {
  return ops.includes(opcode);
}

/** True if opcode A appears within `window` instructions before opcode B. */
function opcodeProximityOps(ops: number[], a: number, b: number, window = 20): boolean {
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === a) {
      for (let j = i + 1; j <= i + window && j < ops.length; j++) {
        if (ops[j] === b) return true;
      }
    }
  }
  return false;
}

// ── 1. Source Verification ────────────────────────────────────────────────────

export async function sourceVerification(c: ContractData): Promise<Signal> {
  return {
    name: "Source Verification",
    severity: c.isVerified ? "none" : "high",
    value: c.isVerified,
    description: c.isVerified
      ? "Contract source code is verified on Basescan."
      : "Contract source code is NOT verified. Hidden malicious logic cannot be ruled out.",
  };
}

// ── 2. Proxy + Upgrade Pattern ────────────────────────────────────────────────

export async function proxyPattern(c: ContractData): Promise<Signal> {
  // EIP-1967 implementation slot
  const EIP1967_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  let hasEip1967 = false;

  try {
    const slotVal = await publicClient.getStorageAt({
      address: c.address,
      slot: EIP1967_SLOT as `0x${string}`,
    });
    hasEip1967 = Boolean(slotVal && slotVal !== "0x" + "0".repeat(64));
  } catch {
    hasEip1967 = false;
  }

  const names = abiNames(c.abi);
  const hasUpgradeFns =
    names.has("upgradeto") ||
    names.has("upgradetoandcall") ||
    names.has("_upgradeto");

  const hasDelegatecall = hasOpcode(disassemble(c.bytecode), 0xf4); // DELEGATECALL
  const isProxy = c.isProxy || hasEip1967 || (hasDelegatecall && hasUpgradeFns);

  const severity: Severity = isProxy && hasUpgradeFns ? "medium" : isProxy ? "low" : "none";

  return {
    name: "Proxy + Upgrade Pattern",
    severity,
    value: { isProxy, hasUpgradeFns, hasEip1967 },
    description: isProxy
      ? hasUpgradeFns
        ? "Contract is an upgradeable proxy. The admin can silently replace logic."
        : "Contract uses a proxy pattern. No exposed upgrade functions detected."
      : "No proxy or upgrade pattern detected.",
  };
}

// ── 3. Owner Privileges ───────────────────────────────────────────────────────

const DANGEROUS_FUNCTIONS = [
  "mint",
  "burn",
  "pause",
  "unpause",
  "blacklist",
  "whitelist",
  "excludefromfee",
  "setmaxwalletamount",
  "setmaxtxamount",
  "setswapandsendtax",
  "setbuytax",
  "setselltax",
  "settaxfee",
  "setwallet",
  "withdraweth",
  "emergencywithdraw",
  "rescuetokens",
  "draintokens",
  "rug",
];

export async function ownerPrivileges(c: ContractData): Promise<Signal> {
  const names = abiNames(c.abi);
  const found = DANGEROUS_FUNCTIONS.filter((fn) => names.has(fn));

  const severity: Severity =
    found.length >= 4 ? "critical" :
    found.length >= 2 ? "high" :
    found.length === 1 ? "medium" : "none";

  return {
    name: "Owner Privileges",
    severity,
    value: found,
    description:
      found.length > 0
        ? `Owner has ${found.length} privileged function(s): ${found.join(", ")}.`
        : "No significant owner privilege functions detected.",
  };
}

// ── 4. Deployer History ───────────────────────────────────────────────────────

export async function deployerHistory(c: ContractData): Promise<Signal> {
  if (!c.deployer) {
    return {
      name: "Deployer History",
      severity: "low",
      value: null,
      description: "Could not determine deployer address.",
    };
  }

  const deployerTxHashes = await basescan.getContractsByDeployer(c.deployer).catch(() => []);
  const count = deployerTxHashes.length;

  // Heuristic: single-deployment deployers with no on-chain history are higher risk
  const severity: Severity = count === 0 ? "medium" : "none";

  return {
    name: "Deployer History",
    severity,
    value: { deployer: c.deployer, otherContractDeployments: count },
    description:
      count > 0
        ? `Deployer ${c.deployer} has deployed ${count} other contract(s).`
        : `Deployer ${c.deployer} has no other deployment history — first-time deployer.`,
  };
}

// ── 5. Reentrancy Vectors ─────────────────────────────────────────────────────

export async function reentrancyVectors(c: ContractData): Promise<Signal> {
  // Heuristic: CALL (0xf1) within 20 instructions of SSTORE (0x55) — the
  // classic "external call before state write" shape. Disassembled so PUSH
  // immediates aren't misread as opcodes.
  const ops = disassemble(c.bytecode);
  const hasSuspiciousPattern = opcodeProximityOps(ops, 0xf1, 0x55, 20);
  const names = abiNames(c.abi);
  const hasReentrancyGuard =
    names.has("_reentrancyguard_entered") ||
    names.has("_status") ||
    hasOpcode(ops, 0x5c); // TLOAD — transient-storage guard (EIP-1153)

  // Heuristic signal — capped at medium so a false positive can't tank a score
  const severity: Severity =
    hasSuspiciousPattern && !hasReentrancyGuard ? "medium" :
    hasSuspiciousPattern ? "low" : "none";

  return {
    name: "Reentrancy Vectors",
    severity,
    value: { hasSuspiciousPattern, hasReentrancyGuard, heuristic: true },
    description:
      hasSuspiciousPattern && !hasReentrancyGuard
        ? "Heuristic: external call appears before a state write with no reentrancy guard detected. Manual review advised."
        : hasSuspiciousPattern
        ? "Potential reentrancy pattern found, but a reentrancy guard appears to be in place."
        : "No reentrancy indicators found.",
  };
}

// ── 6. Honeypot Detection ─────────────────────────────────────────────────────

const HONEYPOT_SIGNATURES = [
  "transfer",
  "_transfer",
  "transferfrom",
];

export async function honeypotDetection(c: ContractData): Promise<Signal> {
  const names = abiNames(c.abi);

  // Look for sell-blocking patterns in ABI
  const hasBlacklist = names.has("blacklist") || names.has("addtoblacklist");
  const hasMaxTx = names.has("setmaxtxamount") || names.has("setmaxwalletamount");

  // Check for extremely high tax functions
  const hasTaxFns =
    names.has("setselltax") || names.has("setbuytax") || names.has("settaxfee");

  // Concentrated-holder heuristic — only when holder data is actually available
  let noSellActivity = false;
  const holders = await basescan.getTokenHolders(c.address);
  if (holders && holders.length > 100) {
    const total = holders.reduce((sum, h) => sum + parseFloat(h.TokenHolderQuantity), 0);
    const top2 = holders.slice(0, 2).reduce((sum, h) => sum + parseFloat(h.TokenHolderQuantity), 0);
    noSellActivity = total > 0 && top2 / total > 0.95;
  }

  const flagCount = [hasBlacklist, hasMaxTx, hasTaxFns, noSellActivity].filter(Boolean).length;
  const severity: Severity =
    flagCount >= 3 ? "critical" :
    flagCount >= 2 ? "high" :
    flagCount === 1 ? "medium" : "none";

  return {
    name: "Honeypot Detection",
    severity,
    value: { hasBlacklist, hasMaxTx, hasTaxFns, concentratedHolders: noSellActivity },
    description:
      flagCount > 0
        ? `${flagCount} honeypot indicator(s): ${[
            hasBlacklist && "blacklist capability",
            hasMaxTx && "max tx/wallet limits",
            hasTaxFns && "adjustable sell tax",
            noSellActivity && "concentrated holder distribution",
          ]
            .filter(Boolean)
            .join(", ")}.`
        : "No honeypot indicators detected.",
  };
}

// ── 7. Liquidity Concentration ────────────────────────────────────────────────

export async function liquidityConcentration(c: ContractData): Promise<Signal> {
  const holders = await basescan.getTokenHolders(c.address);

  if (holders === null) {
    return {
      name: "Liquidity Concentration",
      severity: "none",
      value: { dataAvailable: false },
      description: "Holder data unavailable (requires a paid Basescan plan) — concentration could NOT be assessed.",
    };
  }

  if (holders.length === 0) {
    return {
      name: "Liquidity Concentration",
      severity: "none",
      value: { dataAvailable: true, totalHolders: 0 },
      description: "No token holder data (non-ERC-20 or not indexed).",
    };
  }

  const total = holders.reduce((s, h) => s + parseFloat(h.TokenHolderQuantity), 0);
  const top1Pct = total > 0 ? parseFloat(holders[0].TokenHolderQuantity) / total : 0;
  const top3Pct =
    total > 0
      ? holders.slice(0, 3).reduce((s, h) => s + parseFloat(h.TokenHolderQuantity), 0) / total
      : 0;

  const severity: Severity =
    top1Pct > 0.5 ? "critical" :
    top1Pct > 0.3 ? "high" :
    top3Pct > 0.7 ? "medium" : "none";

  return {
    name: "Liquidity Concentration",
    severity,
    value: {
      totalHolders: holders.length,
      top1AddressPct: Math.round(top1Pct * 100),
      top3AddressesPct: Math.round(top3Pct * 100),
    },
    description:
      severity !== "none"
        ? `Top holder owns ${Math.round(top1Pct * 100)}% of supply — rug pull risk.`
        : `Supply reasonably distributed. Top holder: ${Math.round(top1Pct * 100)}%.`,
  };
}

// ── 8. Exploit Similarity ─────────────────────────────────────────────────────

// NOTE: the previous version matched ubiquitous ERC-20 selectors (transfer,
// balanceOf, transferFrom), which are present in every token — so it flagged
// almost everything. We now match on genuinely dangerous low-level opcodes
// instead. A full exploit-bytecode similarity DB is a planned later update.

export async function exploitSimilarity(c: ContractData): Promise<Signal> {
  if (!c.bytecode || c.bytecode.length < 10) {
    return {
      name: "Exploit Similarity",
      severity: "none",
      value: { findings: [] },
      description: "No bytecode to analyze.",
    };
  }

  const ops = disassemble(c.bytecode);
  const findings: string[] = [];

  // SELFDESTRUCT (0xff) — contract can be destroyed, funds/logic wiped
  if (hasOpcode(ops, 0xff)) findings.push("SELFDESTRUCT opcode present");
  // CALLCODE (0xf2) — deprecated, dangerous delegate-style call
  if (hasOpcode(ops, 0xf2)) findings.push("CALLCODE opcode present (deprecated/unsafe)");

  // Heuristic signal — capped at medium so it cannot alone drive a DANGER tier
  const severity: Severity = findings.length >= 1 ? "medium" : "none";

  return {
    name: "Exploit Similarity",
    severity,
    value: { findings, heuristic: true },
    description:
      findings.length > 0
        ? `Heuristic: ${findings.join("; ")}. Manual review advised.`
        : "No dangerous low-level opcode patterns detected.",
  };
}

// ── 9. CVE Exposure ───────────────────────────────────────────────────────────

const VULNERABLE_VERSIONS = [
  { range: "<0.4.22", severity: "critical" as Severity, notes: "Integer overflow, multiple critical bugs" },
  { range: "<0.5.0", severity: "high" as Severity, notes: "Delegatecall context issues" },
  { range: "<0.6.0", severity: "medium" as Severity, notes: "Various medium severity CVEs" },
  { range: "<0.8.0", severity: "low" as Severity, notes: "No overflow protection by default" },
];

function parseVersion(v: string): [number, number, number] {
  const m = v.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

function isBelow(version: [number, number, number], threshold: string): boolean {
  const t = parseVersion(threshold.replace("<", "").replace("=", ""));
  for (let i = 0; i < 3; i++) {
    if (version[i] < t[i]) return true;
    if (version[i] > t[i]) return false;
  }
  return false;
}

export async function cveExposure(c: ContractData): Promise<Signal> {
  if (!c.compilerVersion) {
    return {
      name: "CVE Exposure",
      severity: "none",
      value: null,
      description: "Compiler version unknown (unverified contract).",
    };
  }

  const parsed = parseVersion(c.compilerVersion);
  const matched = VULNERABLE_VERSIONS.find((v) => isBelow(parsed, v.range.replace("<", "")));

  return {
    name: "CVE Exposure",
    severity: matched?.severity ?? "none",
    value: { compilerVersion: c.compilerVersion },
    description: matched
      ? `Compiler ${c.compilerVersion} has known CVEs: ${matched.notes}`
      : `Compiler ${c.compilerVersion} has no known critical CVEs.`,
  };
}

// ── 10. GitHub Disclosure ─────────────────────────────────────────────────────

export async function githubDisclosure(c: ContractData): Promise<Signal> {
  if (!c.sourceCode || !c.isVerified) {
    return {
      name: "GitHub Disclosure",
      severity: "none",
      value: null,
      description: "Contract unverified — no source code to check.",
    };
  }

  // Extract a unique function name to search
  const fnMatch = c.sourceCode.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]+)\s*\(/);
  if (!fnMatch) {
    return {
      name: "GitHub Disclosure",
      severity: "none",
      value: null,
      description: "Could not extract identifiers for search.",
    };
  }

  const query = encodeURIComponent(`${fnMatch[1]} solidity language:Solidity`);
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Meshline-Scanner",
  };
  if (config.github.token) headers.Authorization = `Bearer ${config.github.token}`;

  try {
    const res = await axios.get(`https://api.github.com/search/code?q=${query}&per_page=5`, {
      headers,
      timeout: 8_000,
    });
    const count = res.data.total_count ?? 0;
    const items: Array<{ repository: { full_name: string } }> = res.data.items ?? [];
    const repos = items.map((i) => i.repository.full_name);

    return {
      name: "GitHub Disclosure",
      severity: count > 10 ? "medium" : "none",
      value: { matchCount: count, repos },
      description:
        count > 10
          ? `Source code appears in ${count} public GitHub repositories. Potential weaponized fork risk.`
          : `Found ${count} GitHub match(es) — no mass disclosure risk.`,
    };
  } catch {
    return {
      name: "GitHub Disclosure",
      severity: "none",
      value: null,
      description: "GitHub search unavailable.",
    };
  }
}

// ── 11. Token Economics ───────────────────────────────────────────────────────

export async function tokenEconomics(c: ContractData): Promise<Signal> {
  const names = abiNames(c.abi);
  const issues: string[] = [];

  if (names.has("settaxfee") || names.has("setselltax") || names.has("setbuytax"))
    issues.push("adjustable tax functions");
  if (names.has("setmaxwalletamount") || names.has("setmaxwallet"))
    issues.push("capped max wallet");
  if (names.has("setmaxtxamount") || names.has("setmaxtransactionamount"))
    issues.push("capped max transaction");
  if (names.has("blacklist") || names.has("addtoblacklist") || names.has("ban"))
    issues.push("blacklist function");
  if (names.has("mint") && !names.has("burn"))
    issues.push("uncapped mint without burn");

  const severity: Severity =
    issues.length >= 3 ? "high" :
    issues.length >= 2 ? "medium" :
    issues.length === 1 ? "low" : "none";

  return {
    name: "Token Economics",
    severity,
    value: issues,
    description:
      issues.length > 0
        ? `Risky tokenomics: ${issues.join(", ")}.`
        : "No problematic token economic patterns detected.",
  };
}

// ── 12. Age + Activity ────────────────────────────────────────────────────────

export async function ageActivity(c: ContractData): Promise<Signal> {
  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = c.deployTimestamp ? now - c.deployTimestamp : null;
  const ageDays = ageSeconds !== null ? Math.floor(ageSeconds / 86400) : null;

  let txCount = 0;
  try {
    const txs = await basescan.getTransactions(c.address, 5);
    txCount = txs.length;
  } catch {
    txCount = 0;
  }

  const isNew = ageDays !== null && ageDays < 7;
  const isLow = txCount < 10;

  const severity: Severity =
    isNew && isLow ? "high" :
    isNew ? "medium" :
    isLow ? "low" : "none";

  return {
    name: "Age + Activity",
    severity,
    value: { ageDays, recentTxCount: txCount },
    description:
      ageDays !== null
        ? `Contract is ${ageDays} day(s) old with ${txCount} recent transaction(s).${isNew ? " Very new contract." : ""}${isLow ? " Low activity." : ""}`
        : "Contract age unknown.",
  };
}
