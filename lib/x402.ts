// x402 payment client (Base) — "exact" scheme over EVM, per the x402 v1 spec
// and frontend-integration.md. On a 402 the server returns PaymentRequirements;
// the client signs an EIP-3009 `transferWithAuthorization` (USDC) via the wallet
// and resends it base64-encoded in the `X-Payment` header. The facilitator
// settles before the report is returned.

import type { Eip1193Provider } from "@/components/wallet/WalletProvider";

export interface PaymentRequirements {
  scheme?: string; // "exact"
  network?: string; // "base-mainnet" | "base" | "base-sepolia"
  maxAmountRequired?: string; // atomic units (USDC has 6 decimals)
  resource?: string;
  description?: string;
  mimeType?: string;
  payTo?: string; // treasury address
  maxTimeoutSeconds?: number;
  asset?: string; // ERC-20 (USDC) contract address
  extra?: { name?: string; version?: string };
}

const NETWORK_CHAIN_ID: Record<string, number> = {
  "base-mainnet": 8453,
  base: 8453,
  "8453": 8453,
  "base-sepolia": 84532,
  "84532": 84532,
};

/** Decode a base64 `X-Payment-Requirements` header into a requirements object. */
export function decodeRequirements(raw: string | null): PaymentRequirements | null {
  if (!raw) return null;
  try {
    const json = typeof atob === "function" ? atob(raw) : Buffer.from(raw, "base64").toString();
    return JSON.parse(json) as PaymentRequirements;
  } catch {
    return null;
  }
}

/** Human-readable USDC amount from atomic units (6 decimals). */
export function formatUsdc(atomic?: string): string {
  if (!atomic) return "—";
  const n = Number(atomic) / 1e6;
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

function chainIdFor(network?: string): number {
  return NETWORK_CHAIN_ID[(network ?? "base-mainnet").toLowerCase()] ?? 8453;
}

function randomNonce(): string {
  const bytes = new Uint8Array(32);
  (globalThis.crypto ?? (window as unknown as { crypto: Crypto }).crypto).getRandomValues(bytes);
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface BuildArgs {
  requirements: PaymentRequirements;
  provider: Eip1193Provider;
  from: string;
}

/**
 * Build the `X-Payment` header value: sign EIP-3009 TransferWithAuthorization
 * via the wallet and base64-encode the x402 "exact" payload.
 */
export async function buildPaymentHeader({
  requirements,
  provider,
  from,
}: BuildArgs): Promise<string> {
  const {
    payTo,
    asset,
    maxAmountRequired,
    network = "base-mainnet",
    maxTimeoutSeconds = 600,
    extra,
  } = requirements;

  if (!payTo || !asset || !maxAmountRequired) {
    throw new Error("Incomplete payment requirements from server.");
  }

  const chainId = chainIdFor(network);
  const now = Math.floor(Date.now() / 1000);
  const validAfter = "0";
  const validBefore = String(now + Math.max(60, maxTimeoutSeconds));
  const nonce = randomNonce();

  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    },
    primaryType: "TransferWithAuthorization",
    domain: {
      name: extra?.name ?? "USD Coin",
      version: extra?.version ?? "2",
      chainId,
      verifyingContract: asset,
    },
    message: {
      from,
      to: payTo,
      value: maxAmountRequired,
      validAfter,
      validBefore,
      nonce,
    },
  };

  const signature = (await provider.request({
    method: "eth_signTypedData_v4",
    params: [from, JSON.stringify(typedData)],
  })) as string;

  const payload = {
    x402Version: 1,
    scheme: requirements.scheme ?? "exact",
    network,
    payload: {
      signature,
      authorization: {
        from,
        to: payTo,
        value: maxAmountRequired,
        validAfter,
        validBefore,
        nonce,
      },
    },
  };

  const json = JSON.stringify(payload);
  return typeof btoa === "function" ? btoa(json) : Buffer.from(json).toString("base64");
}
