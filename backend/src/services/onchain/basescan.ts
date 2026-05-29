import axios from "axios";
import { config } from "../../config";
import type { AbiItem, BaseTx, TokenApproval } from "../../types";

const BASE = config.base.basescanUrl;
const KEY = config.base.basescanApiKey;

async function get<T>(params: Record<string, string>): Promise<T> {
  const res = await axios.get(BASE, {
    params: { ...params, apikey: KEY },
    timeout: 10_000,
  });
  if (res.data.status === "0" && res.data.message !== "No transactions found") {
    if (res.data.message !== "No records found") {
      throw new Error(`Basescan error: ${res.data.message} — ${res.data.result}`);
    }
  }
  return res.data.result as T;
}

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

export async function getSourceCode(address: string): Promise<ContractSource | null> {
  const results = await get<ContractSource[]>({
    module: "contract",
    action: "getsourcecode",
    address,
  });
  if (!results || results.length === 0) return null;
  return results[0];
}

export async function getContractCreation(address: string): Promise<ContractCreation | null> {
  const results = await get<ContractCreation[]>({
    module: "contract",
    action: "getcontractcreation",
    contractaddresses: address,
  });
  if (!results || results.length === 0) return null;
  return results[0];
}

export async function getContractsByDeployer(deployer: string): Promise<string[]> {
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
  return txs
    .filter((tx) => tx.to === null || tx.to === "")
    .map((tx) => tx.hash);
}

export async function getTokenHolders(address: string): Promise<TokenHolder[]> {
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
}

export async function getTransactions(address: string, limit = 50): Promise<BaseTx[]> {
  const txs = await get<BaseTx[]>({
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "latest",
    sort: "desc",
    offset: String(limit),
    page: "1",
  });
  return Array.isArray(txs) ? txs : [];
}

export async function getTokenTransactions(address: string): Promise<TokenApproval[]> {
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
    // Filter for Approval events (value = max uint256 or large)
    const MAX = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");
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
}

export async function getBlockTimestamp(blockNumber: number): Promise<number> {
  const result = await get<{ timeStamp: string }>({
    module: "block",
    action: "getblockreward",
    blockno: String(blockNumber),
  });
  return parseInt(result.timeStamp);
}
