import type { WalletData, Signal, Severity } from "../../types";
import { publicClient } from "../onchain/client";
import { formatEther } from "viem";

// Known drainer addresses on Base. Loaded from the DRAINER_ADDRESSES env var
// (comma-separated, lowercase) so the list can be maintained/updated without a
// code change. Empty by default — see description handling below.
const KNOWN_DRAINERS = new Set(
  (process.env.DRAINER_ADDRESSES ?? "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter((a) => /^0x[0-9a-f]{40}$/.test(a))
);

export async function approvalExposure(w: WalletData): Promise<Signal> {
  const unlimited = w.tokenApprovals.filter((a) => {
    try {
      const MAX = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");
      return BigInt(a.value) >= MAX / 2n;
    } catch {
      return false;
    }
  });

  const severity: Severity =
    unlimited.length >= 10 ? "critical" :
    unlimited.length >= 5 ? "high" :
    unlimited.length >= 2 ? "medium" :
    unlimited.length >= 1 ? "low" : "none";

  return {
    name: "Approval Exposure",
    severity,
    value: {
      unlimitedApprovals: unlimited.length,
      approvals: unlimited.slice(0, 5).map((a) => ({
        token: a.tokenName,
        spender: a.spender,
      })),
    },
    description:
      unlimited.length > 0
        ? `${unlimited.length} unlimited ERC-20 approval(s) active. Spenders can drain tokens at any time.`
        : "No unlimited token approvals found.",
  };
}

export async function drainerInteractions(w: WalletData): Promise<Signal> {
  // If no drainer list is configured, be honest that screening didn't run
  // rather than reporting a falsely-clean "none".
  if (KNOWN_DRAINERS.size === 0) {
    return {
      name: "Drainer Interactions",
      severity: "none",
      value: { listConfigured: false },
      description: "Drainer screening unavailable — no drainer address list configured.",
    };
  }

  const drainerTxs = w.recentTxs.filter(
    (tx) => tx.to && KNOWN_DRAINERS.has(tx.to.toLowerCase())
  );

  const severity: Severity = drainerTxs.length > 0 ? "critical" : "none";

  return {
    name: "Drainer Interactions",
    severity,
    value: { listConfigured: true, matches: drainerTxs.map((t) => t.hash) },
    description:
      drainerTxs.length > 0
        ? `Wallet has interacted with ${drainerTxs.length} known drainer address(es).`
        : "No interactions with known drainer addresses.",
  };
}

export async function mevActivity(w: WalletData): Promise<Signal> {
  // Heuristic: many transactions in short succession to the same contract = possible MEV bot
  if (w.recentTxs.length < 10) {
    return {
      name: "MEV Activity",
      severity: "none",
      value: null,
      description: "Insufficient transaction history to assess MEV activity.",
    };
  }

  const toCount: Record<string, number> = {};
  for (const tx of w.recentTxs) {
    if (tx.to) toCount[tx.to] = (toCount[tx.to] ?? 0) + 1;
  }
  const maxRepeat = Math.max(...Object.values(toCount));
  const isMevLike = maxRepeat >= 10;

  return {
    name: "MEV Activity",
    severity: isMevLike ? "medium" : "none",
    value: { maxRepeatedTarget: maxRepeat },
    description: isMevLike
      ? `Wallet sent ${maxRepeat} transactions to the same address — possible MEV bot or drainer interaction.`
      : "No MEV bot-like transaction patterns detected.",
  };
}

export async function transactionPatterns(w: WalletData): Promise<Signal> {
  const totalTxs = w.txCount;
  const balanceEth = parseFloat(formatEther(w.ethBalance));

  // High tx count but very low balance = likely drainer victim or bot
  const isSuspicious = totalTxs > 500 && balanceEth < 0.001;

  return {
    name: "Transaction Patterns",
    severity: isSuspicious ? "medium" : "none",
    value: { totalTxs, balanceEth: balanceEth.toFixed(6) },
    description: isSuspicious
      ? `High transaction count (${totalTxs}) with near-zero balance (${balanceEth.toFixed(6)} ETH) — possible drained wallet.`
      : `${totalTxs} total transactions, ${balanceEth.toFixed(6)} ETH balance.`,
  };
}

export async function protocolFingerprint(w: WalletData): Promise<Signal> {
  const uniqueTargets = new Set(w.recentTxs.map((tx) => tx.to).filter(Boolean));

  return {
    name: "Protocol Fingerprint",
    severity: "none",
    value: {
      uniqueProtocols: uniqueTargets.size,
      txCount: w.recentTxs.length,
    },
    description: `Wallet has interacted with ${uniqueTargets.size} unique address(es) in recent history.`,
  };
}
