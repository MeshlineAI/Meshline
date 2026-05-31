import { publicClient } from "./client";
import * as basescan from "./basescan";
import { assertSafeUrl } from "./ssrfGuard";
import type { ContractData, WalletData, AppData } from "../../types";
import axios from "axios";

export async function fetchContractData(address: `0x${string}`): Promise<ContractData> {
  const [bytecode, source, creation] = await Promise.all([
    publicClient.getBytecode({ address }).catch(() => null),
    basescan.getSourceCode(address).catch(() => null),
    basescan.getContractCreation(address).catch(() => null),
  ]);

  const isVerified = Boolean(source && source.ABI && source.ABI !== "Contract source code not verified");

  let abi = null;
  if (isVerified && source?.ABI) {
    try {
      abi = JSON.parse(source.ABI);
    } catch {
      abi = null;
    }
  }

  let deployBlock: number | null = null;
  let deployer: `0x${string}` | null = null;
  if (creation) {
    deployer = creation.contractCreator as `0x${string}`;
    try {
      const txReceipt = await publicClient.getTransactionReceipt({
        hash: creation.txHash as `0x${string}`,
      });
      deployBlock = Number(txReceipt.blockNumber);
    } catch {
      deployBlock = null;
    }
  }

  let deployTimestamp: number | null = null;
  if (deployBlock) {
    try {
      const block = await publicClient.getBlock({ blockNumber: BigInt(deployBlock) });
      deployTimestamp = Number(block.timestamp);
    } catch {
      deployTimestamp = null;
    }
  }

  const isProxy = Boolean(source?.Proxy === "1" || source?.Implementation);
  const implementationAddress =
    source?.Implementation && source.Implementation !== ""
      ? (source.Implementation as `0x${string}`)
      : null;

  return {
    address,
    bytecode: bytecode ?? null,
    isVerified,
    sourceCode: source?.SourceCode ?? null,
    abi,
    compilerVersion: source?.CompilerVersion ?? null,
    deployer,
    deployBlock,
    deployTimestamp,
    isProxy,
    implementationAddress,
  };
}

export async function fetchWalletData(address: `0x${string}`): Promise<WalletData> {
  const [ethBalance, txCount, txs, approvals] = await Promise.all([
    publicClient.getBalance({ address }),
    publicClient.getTransactionCount({ address }),
    basescan.getTransactions(address, 100).catch(() => []),
    basescan.getTokenTransactions(address).catch(() => []),
  ]);

  return {
    address,
    ethBalance,
    txCount,
    recentTxs: txs,
    tokenApprovals: approvals,
  };
}

export async function fetchAppData(url: string): Promise<AppData> {
  // SSRF guard: validate the initial URL, then follow redirects manually,
  // re-validating each hop so a redirect can't point at a private address.
  let currentUrl = url;
  let res;

  for (let hop = 0; hop <= 5; hop++) {
    await assertSafeUrl(currentUrl);

    res = await axios.get(currentUrl, {
      timeout: 15_000,
      maxRedirects: 0, // we follow manually to validate each hop
      validateStatus: () => true,
      headers: { "User-Agent": "Meshline-Security-Scanner/1.0" },
    });

    // 3xx with a Location → validate and follow
    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      currentUrl = new URL(res.headers.location, currentUrl).toString();
      continue;
    }
    break;
  }

  if (!res) throw Object.assign(new Error("No response from target"), { status: 502 });

  const headers: Record<string, string> = {};
  for (const [key, val] of Object.entries(res.headers)) {
    if (typeof val === "string") headers[key.toLowerCase()] = val;
  }

  return {
    url,
    finalUrl: currentUrl,
    statusCode: res.status,
    headers,
    bodyHtml: typeof res.data === "string" ? res.data.slice(0, 100_000) : "",
  };
}
