/**
 * Basescan API wrapper — backed by Etherscan V2 (chainid=8453).
 *
 * Free tier limits:
 *   - 5 calls/second  → we cap at 4/s with a token-bucket rate limiter
 *   - 100,000 calls/day
 *   - 1,000 max records per request (enforced from July 2026, we stay under now)
 */

import axios from "axios";
import { config } from "../../config";
import { cache, TTL } from "./cache";
import type { BaseTx, TokenApproval } from "../../types";

// ── Rate limiter (token bucket, 4 req/s) ─────────────────────────────────────

const RATE_MS = 1000 / 4; // 250ms between calls
let lastCall = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const wait = RATE_MS - (now - lastCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
}

// ── Core request ──────────────────────────────────────────────────────────────

async function get<T>(params: Record<string, string>): Promise<T> {
  await throttle();
  const res = await axios.get(config.base.basescanUrl, {
    params: {
      chainid: String(config.base.chainId),
      apikey: config.base.basescanApiKey,
      ...params,
    },
    timeout: 10_000,
  });

  const { status, message, result } = res.data;
  if (
    status === "0" &&
    message !== "No transactions found" &&
    message !== "No records found" &&
    message !== "No data found"
  ) {
    throw new Error(`Basescan: ${message} — ${typeof result === "string" ? result : JSON.stringify(result)}`);
  }

  return result as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContractSource {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  Proxy: string;
  Implementation: string;
}

export interface ContractCreation {
  contractAddress: string;
  contractCreator: string;
  txHash: string;
}

export interface TokenHolder {
  TokenHolderAddress: string;
  TokenHolderQuantity: string;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export async function getSourceCode(address: string): Promise<ContractSource | null> {
  return cache.getOrFetch(`src:${address}`, TTL.CONTRACT_SOURCE, async () => {
    const results = await get<ContractSource[]>({
      module: "contract",
      action: "getsourcecode",
      address,
    });
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  });
}

export async function getContractCreation(address: string): Promise<ContractCreation | null> {
  return cache.getOrFetch(`creation:${address}`, TTL.CONTRACT_CREATION, async () => {
    const results = await get<ContractCreation[]>({
      module: "contract",
      action: "getcontractcreation",
      contractaddresses: address,
    });
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  });
}

export async function getContractsByDeployer(deployer: string): Promise<string[]> {
  return cache.getOrFetch(`deployer:${deployer}`, TTL.CONTRACT_SOURCE, async () => {
    const txs = await get<BaseTx[]>({
      module: "account",
      action: "txlist",
      address: deployer,
      startblock: "0",
      endblock: "latest",
      sort: "desc",
      offset: "100",
      page: "1",
    });
    if (!Array.isArray(txs)) return [];
    return txs.filter((tx) => !tx.to || tx.to === "").map((tx) => tx.hash);
  });
}

export async function getTokenHolders(address: string): Promise<TokenHolder[]> {
  return cache.getOrFetch(`holders:${address}`, TTL.TOKEN_HOLDERS, async () => {
    try {
      return await get<TokenHolder[]>({
        module: "token",
        action: "tokenholderlist",
        contractaddress: address,
        page: "1",
        offset: "50",
      });
    } catch {
      return [];
    }
  });
}

export async function getTransactions(address: string, limit = 50): Promise<BaseTx[]> {
  const cap = Math.min(limit, 1000);
  return cache.getOrFetch(`txs:${address}:${cap}`, TTL.TRANSACTIONS, async () => {
    const txs = await get<BaseTx[]>({
      module: "account",
      action: "txlist",
      address,
      startblock: "0",
      endblock: "latest",
      sort: "desc",
      offset: String(cap),
      page: "1",
    });
    return Array.isArray(txs) ? txs : [];
  });
}

export async function getTokenTransactions(address: string): Promise<TokenApproval[]> {
  return cache.getOrFetch(`tokentx:${address}`, TTL.WALLET, async () => {
    try {
      const logs = await get<any[]>({
        module: "account",
        action: "tokentx",
        address,
        startblock: "0",
        endblock: "latest",
        sort: "desc",
        offset: "200",
        page: "1",
      });
      if (!Array.isArray(logs)) return [];

      const MAX = BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );
      return logs
        .filter((tx: any) => {
          try {
            return BigInt(tx.value) >= MAX / 2n;
          } catch {
            return false;
          }
        })
        .map((tx: any) => ({
          tokenAddress: tx.contractAddress,
          tokenName: tx.tokenName ?? "",
          spender: tx.to,
          value: tx.value,
          txHash: tx.hash,
        }));
    } catch {
      return [];
    }
  });
}
