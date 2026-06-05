import "dotenv/config";

function require(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port: parseInt(optional("PORT", "3001")),
  nodeEnv: optional("NODE_ENV", "development"),

  db: {
    url: process.env.DATABASE_URL!,
  },

  base: {
    rpcUrl: process.env.BASE_RPC_URL!,
    basescanApiKey: process.env.BASESCAN_API_KEY!,
    // Basescan now runs on Etherscan V2 — use chainid=8453 to query Base
    basescanUrl: "https://api.etherscan.io/v2/api",
    chainId: 8453,
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY!,
    model: optional("GEMINI_MODEL", "gemini-2.0-flash"),
  },

  eas: {
    privateKey: process.env.EAS_PRIVATE_KEY,
    schemaUid: process.env.EAS_SCHEMA_UID,
    contractAddress: optional(
      "EAS_CONTRACT_ADDRESS",
      "0x4200000000000000000000000000000000000021"
    ),
    schemaRegistryAddress: optional(
      "EAS_SCHEMA_REGISTRY_ADDRESS",
      "0x4200000000000000000000000000000000000020"
    ),
  },

  payment: {
    treasuryAddress: process.env.TREASURY_ADDRESS,
    facilitatorUrl: optional("X402_FACILITATOR_URL", "https://x402.org/facilitate"),
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  },

  cors: {
    origins: optional("ALLOWED_ORIGINS", "https://meshline.tech,http://localhost:3000")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  },

  github: {
    token: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN,
  },

  redis: {
    url: process.env.REDIS_URL,
  },
} as const;
