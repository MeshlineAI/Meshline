// Input-type detection for the scan box.
// Address vs URL is shape-based; contract-vs-wallet is resolved via eth_getCode on Base.

import type { ScanType } from "./api";

export type DetectedType = ScanType | "invalid";
export type SelectorValue = "auto" | ScanType;

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isAddress(value: string): boolean {
  return ADDRESS_RE.test(value.trim());
}

export function looksLikeUrl(value: string): boolean {
  const s = value.trim();
  if (!s || isAddress(s)) return false;
  if (/^https?:\/\//i.test(s)) return true;
  // bare domain like app.uniswap.org or example.com/path
  return /^([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(s);
}

/** Synchronous best-guess for live UI feedback (address defaults to contract). */
export function quickType(value: string): DetectedType {
  const s = value.trim();
  if (!s) return "invalid";
  if (isAddress(s)) return "contract";
  if (looksLikeUrl(s)) return "app";
  return "invalid";
}

/** Classify a 0x address as contract or wallet using a Base RPC (eth_getCode). */
export async function classifyAddress(
  address: string,
  rpc?: string,
): Promise<"contract" | "wallet"> {
  const url = rpc ?? process.env.NEXT_PUBLIC_BASE_RPC ?? "https://mainnet.base.org";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [address, "latest"],
      }),
    });
    const json = await res.json();
    const code: string = json?.result ?? "0x";
    return code && code !== "0x" && code !== "0x0" ? "contract" : "wallet";
  } catch {
    return "contract"; // contract scan is the safe primary path
  }
}

type Resolved = { type: ScanType; input: string } | { error: string };

/** Resolve the endpoint to hit, honoring an explicit selector or auto-detecting. */
export async function resolveScanType(
  rawInput: string,
  selected: SelectorValue,
): Promise<Resolved> {
  const s = rawInput.trim();
  if (!s) return { error: "Enter a contract address, wallet address, or app URL." };

  if (selected !== "auto") {
    if (selected !== "app" && !isAddress(s)) {
      return { error: "That isn't a valid 0x address." };
    }
    return { type: selected, input: s };
  }

  if (isAddress(s)) {
    const type = await classifyAddress(s);
    return { type, input: s };
  }
  if (looksLikeUrl(s)) return { type: "app", input: s };
  return { error: "That doesn't look like a Base address (0x…) or an app URL." };
}
