import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { config } from "../config";
import type { ScanType, RiskTier, Signal } from "../types";
import { createHash } from "crypto";

const SCHEMA =
  "string targetAddress,string scanType,uint256 meshScore,string tier,string topSignals,uint256 scannedAt,bytes32 reportHash,string reportUrl";

let easInstance: EAS | null = null;

function getEAS(): EAS {
  if (easInstance) return easInstance;
  if (!config.eas.privateKey) throw new Error("EAS_PRIVATE_KEY not configured");

  const provider = new ethers.JsonRpcProvider(config.base.rpcUrl);
  const signer = new ethers.Wallet(config.eas.privateKey, provider);
  const eas = new EAS(config.eas.contractAddress);
  eas.connect(signer);
  easInstance = eas;
  return eas;
}

export function hashReport(markdown: string): `0x${string}` {
  const hash = createHash("sha256").update(markdown, "utf8").digest("hex");
  return `0x${hash}` as `0x${string}`;
}

export async function attest(params: {
  target: string;
  scanType: ScanType;
  meshScore: number;
  tier: RiskTier;
  topSignals: Signal[];
  reportMarkdown: string;
  reportUrl: string;
}): Promise<string> {
  if (!config.eas.schemaUid) throw new Error("EAS_SCHEMA_UID not configured");

  const eas = getEAS();
  const encoder = new SchemaEncoder(SCHEMA);
  const reportHash = hashReport(params.reportMarkdown);
  const scannedAt = BigInt(Math.floor(Date.now() / 1000));

  const encoded = encoder.encodeData([
    { name: "targetAddress", value: params.target, type: "string" },
    { name: "scanType", value: params.scanType, type: "string" },
    { name: "meshScore", value: BigInt(params.meshScore), type: "uint256" },
    { name: "tier", value: params.tier, type: "string" },
    {
      name: "topSignals",
      value: JSON.stringify(
        params.topSignals.map((s) => ({ name: s.name, severity: s.severity }))
      ),
      type: "string",
    },
    { name: "scannedAt", value: scannedAt, type: "uint256" },
    { name: "reportHash", value: reportHash, type: "bytes32" },
    { name: "reportUrl", value: params.reportUrl, type: "string" },
  ]);

  const tx = await eas.attest({
    schema: config.eas.schemaUid,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: 0n,
      revocable: true,
      refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
      data: encoded,
      value: 0n,
    },
  });

  const uid = await tx.wait();
  return uid;
}
