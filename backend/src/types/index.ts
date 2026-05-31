export type ScanType = "contract" | "wallet" | "app";
export type RiskTier = "AAA" | "AA" | "A" | "BB" | "C";
export type Severity = "none" | "low" | "medium" | "high" | "critical";

export interface Signal {
  name: string;
  severity: Severity;
  value: unknown;
  description: string;
}

export interface ScanResult {
  id: string;
  target: string;
  scanType: ScanType;
  meshScore: number;
  tier: RiskTier;
  signals: Signal[];
  reportMarkdown: string;
  reportHash: string;
  easUid?: string;
  reportUrl: string;
  scannedAt: number;
}

export interface ContractData {
  address: `0x${string}`;
  bytecode: `0x${string}` | null;
  isVerified: boolean;
  sourceCode: string | null;
  abi: AbiItem[] | null;
  compilerVersion: string | null;
  deployer: `0x${string}` | null;
  deployBlock: number | null;
  deployTimestamp: number | null;
  isProxy: boolean;
  implementationAddress: `0x${string}` | null;
}

export interface WalletData {
  address: `0x${string}`;
  ethBalance: bigint;
  txCount: number;
  recentTxs: BaseTx[];
  tokenApprovals: TokenApproval[];
}

export interface AppData {
  url: string;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
  bodyHtml: string;
}

export interface AbiItem {
  type: string;
  name?: string;
  inputs?: AbiParam[];
  outputs?: AbiParam[];
  stateMutability?: string;
}

export interface AbiParam {
  name: string;
  type: string;
}

export interface BaseTx {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  blockNumber: number;
  timeStamp: number;
}

export interface TokenApproval {
  tokenAddress: string;
  tokenName: string;
  spender: string;
  value: string;
  txHash: string;
}
