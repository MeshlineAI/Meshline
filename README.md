# Meshline

**AI-powered onchain risk intelligence for Base.**

Paste a contract address, wallet, or Base app URL. Get a risk report in under 30 seconds.

---

## What it does

Meshline runs a deep analysis pipeline on any Base target and returns a **MESH Score** (0–1000), a human-readable AI-written report, an onchain EAS attestation, and a shareable trust badge — all from a single input.

### Three scan types

| Scan | Input | What you get |
|------|-------|-------------|
| **Contract Intel** | `0x` contract address | 12-signal report: reentrancy, honeypot, proxy patterns, deployer history, exploit similarity, and more |
| **Wallet Intel** | `0x` wallet or Basename | Drainer interactions, unlimited approval exposure, MEV activity, behavioral fingerprint |
| **Base App Audit** | dApp URL (e.g. `app.uniswap.org`) | DNS/TLS, CSP headers, phishing pattern match, connected contract risk |

### MESH Score

| Score | Tier | Label |
|-------|------|-------|
| 900–1000 | AAA | Verified Safe |
| 700–899 | AA | Low Risk |
| 500–699 | A | Caution |
| 300–499 | BB | High Risk |
| 0–299 | C | Danger |

Every score is attested onchain via EAS on Base within 5 seconds of report generation. Any contract, wallet, or agent can read the latest MESH Score directly from the attestation registry.

---

## How a scan works

```
input → onchain fetch (Viem) → x402 payment gate → 12 signals (parallel) → Claude report → EAS attestation → public URL + trust badge
```

Total time: ~25 seconds.

---

## Agent API (x402)

Meshline is natively queryable by AI agents via x402 on Base. No API key. No account. Pay per scan in USDC.

```
GET  /v1/scan/contract/:address   0.001 USDC  →  MESH Score + top signals JSON
GET  /v1/scan/wallet/:address     0.001 USDC  →  Wallet score + approval count
GET  /v1/scan/app?url=...         0.005 USDC  →  App security headers + risk
GET  /v1/report/:uid              0.001 USDC  →  Full report JSON + EAS UID
POST /v1/batch                    0.0005/ea   →  Array of MESH Scores (bulk)
```

Listed on [Agent.market](https://agent.market) — discoverable by any AgentKit or x402-compatible agent on Base.

---

## Trust badge

Every scan generates an embeddable SVG badge that refreshes live from the latest EAS attestation.

```html
<a href="https://meshline.io/scan/YOUR_SCAN_UID">
  <img src="https://meshline.io/badge/YOUR_ADDRESS" alt="Meshline Security Score" />
</a>
```

---

## Pricing

| Tier | Price | Scans |
|------|-------|-------|
| Free | $0 | 3 contract scans/mo |
| Pro | $49/mo | Unlimited + PDF export + alerts |
| Enterprise | $199/mo | Private audits + bulk API + SSO + SLA |
| x402 Agent | Pay-per-scan | 0.001 USDC/scan, no account needed |

---

## MESH Token

ERC-20 on Base. Fixed supply: 50,000,000 MESH.

- 1 MESH = 1 free Pro scan (burn-on-use)
- Hold 100 MESH → 20% off Pro. Hold 10,000 → free Pro.
- 20% of all scan revenue distributed weekly to MESH stakers in USDC
- 10% of revenue used to buyback and permanently burn MESH

---

## Roadmap

| Phase | Weeks | Focus |
|-------|-------|-------|
| 1 | 1–4 | Contract Intel + Wallet Intel live on Base, EAS, x402, free tier, Agent.market listing |
| 2 | 5–8 | Pro tier, Base App Audit, MESH token launch, badge flywheel, 1K scans/day |
| 3 | 9–12 | Enterprise tier, MCP skill for Claude/Cursor, Morpho/Aerodrome integrations, $1M cumulative scan volume |

---

## Tech stack

Base L2 · x402 · EAS · OnchainKit · Agentic Wallets · Coinbase CDP · Viem · Claude

---

Built on Base. MESHLINE v0.1 — May 2026.
