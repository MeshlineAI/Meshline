# Meshline

![CI](https://github.com/MeshlineAI/Meshline/actions/workflows/backend.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.x-000000?logo=bun&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![Base](https://img.shields.io/badge/Base-L2-0052FF?logo=coinbase&logoColor=white)

**AI-powered onchain risk intelligence for Base.**

**Contract Address (MESH):** `0xe51190b973f32024c41471cc71c22c1f97e76b07`

Paste a contract address, wallet address, or Base app URL — get a deep risk report in under 30 seconds.

---

## What it does

Meshline scans any Base target and returns a **MESH Score** (0–1000), an AI-written risk report, an onchain EAS attestation, and an embeddable trust badge. One input. One action.

### Scan types

| Scan | Input | Signals |
|---|---|---|
| **Contract Intel** | `0x` contract address | Source verification, proxy patterns, owner privileges, deployer history, reentrancy vectors, honeypot detection, liquidity concentration, exploit similarity, CVE exposure, GitHub disclosure, token economics, age + activity |
| **Wallet Intel** | `0x` wallet address | Drainer interactions, unlimited approval exposure, MEV activity, transaction patterns, protocol fingerprint |
| **Base App Audit** | dApp URL | TLS/HTTPS, security headers, API key exposure, phishing pattern match, CSP policy |

### MESH Score

| Score | Tier | Meaning |
|---|---|---|
| 900–1000 | AAA | Verified Safe |
| 700–899 | AA | Low Risk |
| 500–699 | A | Caution |
| 300–499 | BB | High Risk |
| 0–299 | C | Danger |

Every score is attested onchain via EAS on Base. Any contract, wallet, or agent can read the latest MESH Score directly from the attestation registry.

---

## Scan pipeline

```
input → type detection → onchain fetch (Viem + Basescan)
      → signals computed in parallel
      → Gemini AI writes the report
      → EAS attestation on Base
      → public report URL + trust badge SVG
```

~25 seconds end to end.

---

## API

All endpoints live at `https://meshline-backend-latest.onrender.com`.

First 3 contract and wallet scans per IP per month are free. After that, pay per scan in USDC on Base via x402 — no account, no API key.

| Endpoint | Price | Returns |
|---|---|---|
| `GET /v1/scan/contract/:address` | Free × 3, then 0.001 USDC | MESH Score + 12 signals + AI report |
| `GET /v1/scan/wallet/:address` | Free × 3, then 0.001 USDC | Wallet score + approval risk |
| `GET /v1/scan/app?url=` | 0.005 USDC | App security audit |
| `POST /v1/batch` | 0.0005 USDC/ea | Bulk MESH Scores (max 50) |
| `GET /v1/report/:uid` | Free | Full report JSON |
| `GET /v1/badge/:address` | Free | Live SVG trust badge |

### x402 — machine-native payments

AI agents using Coinbase AgentKit or any x402-compatible client call Meshline with zero setup. The agent pays 0.001 USDC per scan and gets structured JSON back. No subscription, no API key, no account.

---

## Trust badge

Every scan generates an embeddable SVG badge that auto-refreshes from the latest EAS attestation.

```html
<a href="https://meshline.tech/scan/YOUR_REPORT_UID">
  <img src="https://meshline-backend-latest.onrender.com/v1/badge/YOUR_ADDRESS"
       alt="Meshline Security Score" />
</a>
```

---

## Pricing

| Tier | Price | Scans |
|---|---|---|
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


## Tech stack

Base L2 · Bun · Express · PostgreSQL · Viem · Gemini AI · EAS · x402 · Next.js · Tailwind · Foundry


