/**
 * One-time script: registers the MESH Scan Result schema on EAS (Base mainnet).
 * Run once. Copy the printed UID into EAS_SCHEMA_UID in your .env.
 *
 * Usage: bun run scripts/register-schema.ts
 */

import "dotenv/config";
import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

const SCHEMA =
  "string targetAddress,string scanType,uint256 meshScore,string tier,string topSignals,uint256 scannedAt,bytes32 reportHash,string reportUrl";

const REGISTRY_ADDRESS =
  process.env.EAS_SCHEMA_REGISTRY_ADDRESS ?? "0x4200000000000000000000000000000000000020";

async function main() {
  const { BASE_RPC_URL, EAS_PRIVATE_KEY } = process.env;
  if (!BASE_RPC_URL) throw new Error("BASE_RPC_URL not set");
  if (!EAS_PRIVATE_KEY) throw new Error("EAS_PRIVATE_KEY not set");

  const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
  const signer = new ethers.Wallet(EAS_PRIVATE_KEY, provider);

  console.log("Registering schema on Base mainnet...");
  console.log("Attester address:", signer.address);
  console.log("Schema:", SCHEMA);

  const registry = new SchemaRegistry(REGISTRY_ADDRESS);
  registry.connect(signer);

  const tx = await registry.register({
    schema: SCHEMA,
    resolverAddress: ethers.ZeroAddress,
    revocable: true,
  });

  console.log("Transaction submitted, waiting for confirmation...");
  const uid = await tx.wait();

  console.log("\n✓ Schema registered successfully");
  console.log("Schema UID:", uid);
  console.log("\nAdd this to your .env:");
  console.log(`EAS_SCHEMA_UID=${uid}`);
}

main().catch((err) => {
  console.error("Registration failed:", err.message);
  process.exit(1);
});
