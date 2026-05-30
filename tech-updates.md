# Meshline — Tech Updates

Post-launch shipping plan. 5 waves, 5 features each, one wave per day.
Features range from model swaps to full capabilities — size doesn't matter, shippability does.

---

## Wave 1 — Report Quality + Pro Foundation

- **Gemini 2.0 Flash upgrade** `#1`
  - Frontend: No change
  - Backend: Update `GEMINI_MODEL` default from `gemini-1.5-flash` to `gemini-2.0-flash` in `config/index.ts`

- **PDF report export** `#2`
  - Frontend: Add download button on `/scan/[uid]` page that fetches `/v1/report/:uid/pdf`
  - Backend: New endpoint `GET /v1/report/:uid/pdf` — renders report markdown to PDF via Puppeteer or similar, returns `application/pdf`

- **Free tier limit increase** `#3`
  - Frontend: Update all "3 free scans/month" copy to "5 free scans/month"
  - Backend: Change `FREE_LIMIT` constant in `middleware/freeTier.ts` from `3` to `5`

- **Redis cache swap** `#4`
  - Frontend: No change
  - Backend: Replace in-memory `Map` cache in `services/onchain/cache.ts` with Redis (Upstash or Render Redis). Keeps same TTL values, survives restarts and scales across instances

- **Signal weight fine-tuning** `#5`
  - Frontend: No change
  - Backend: Recalibrate severity penalty values in `services/score.ts` based on false positives seen in production scans — e.g. raise `low` penalty from 25 to 30, lower `medium` from 75 to 60

---

## Wave 2 — Alerts + Watched Contracts

- **Watched contracts** `#6`
  - Frontend: "Watch this contract" toggle on `/scan/[uid]` report page. Watched address appears in a user dashboard list
  - Backend: New `watched_contracts` table (address, user identifier, last_score). Cron job re-scans all watched contracts every 6 hours, stores new results

- **MESH Score drop alert** `#7`
  - Frontend: Alert badge on watched contract card if score dropped since last scan. Show delta (e.g. `↓ 150 pts`)
  - Backend: After re-scan cron, compare new score to previous. If delta > 100 points, write to `alerts` table and trigger notification

- **Email notifications via Resend** `#8`
  - Frontend: Email input field in user settings / watch setup flow
  - Backend: Integrate Resend SDK. Send alert email when score drop detected. Template: target address, old score, new score, report link

- **Scan history by address** `#9`
  - Frontend: History tab on address pages listing all past scans with timestamps and scores
  - Backend: New endpoint `GET /v1/history/:address` — returns paginated list of all scans for a given address, sorted by `created_at DESC`

- **Alert latency tier copy** `#10`
  - Frontend: Add "Sub-5min alerts for MESH stakers" badge on the Pro/pricing page (non-functional until staking live — sets expectation)
  - Backend: Add priority flag to re-scan queue for future use when staking contract is integrated

---

## Wave 3 — Token + Staking Integration

- **MESH balance discount check** `#11`
  - Frontend: "Connect wallet → see your discount" CTA on pricing page. Show active discount tier once connected
  - Backend: New utility in `services/onchain/client.ts` — reads MESH token balance via viem `readContract`. Apply discount logic (100 MESH = 20% off, 1K = 40%, 10K = free Pro) before charging x402

- **MESH scan credit burn** `#12`
  - Frontend: "Burn 1 MESH for a free scan" button on scan input. Calls wallet to sign `burnForScan()` tx, then sends tx hash to backend
  - Backend: New endpoint `POST /v1/credits/burn` — verifies `burnForScan()` tx on Base via viem, issues a one-time scan token stored in DB

- **Staking stats endpoint** `#13`
  - Frontend: Staking dashboard page — shows TVL (MESH staked), staker count, weekly USDC distributed, user's pending reward
  - Backend: New endpoint `GET /v1/staking/stats` — reads `MeshStaking` contract via viem: `totalStaked`, `pendingReward(address)`, `accRewardPerShare`

- **Weekly revenue distribution cron** `#14`
  - Frontend: "Next distribution in X days" countdown on staking page
  - Backend: Weekly cron job — calculates 20% of that week's scan revenue from DB, calls `depositRevenue(amount)` on `MeshStaking` contract via ethers signer

- **Pro access via MESH hold** `#15`
  - Frontend: "Hold 10,000 MESH → free Pro" CTA on pricing. Show active Pro status if wallet qualifies
  - Backend: Before applying x402 gate on Pro scan endpoints, check MESH balance via `holdingDiscount()`. If returns 100, bypass payment entirely

---

## Wave 4 — Enterprise + Scale

- **API key auth system** `#16`
  - Frontend: API keys management page in enterprise settings — generate, name, revoke keys. Show usage stats per key
  - Backend: `api_keys` table (key hash, org id, created_at, last_used). New middleware that accepts `Authorization: Bearer <key>` as alternative to x402 for enterprise tier

- **Private scans** `#17`
  - Frontend: Private / Public toggle on scan form. Private scans don't appear in public search or registry
  - Backend: Add `is_private BOOLEAN` column to `scans` table (migration). `GET /v1/report/:uid` returns 404 for private scans unless request includes a valid API key for the owning org

- **Batch limit increase** `#18`
  - Frontend: Update batch UI max input count from 50 to 200. Update copy
  - Backend: Change max batch size constant in `routes/scan.ts` from 50 to 200. Verify concurrency doesn't hit Basescan rate limit — adjust throttle if needed

- **SOC2 audit log export** `#19`
  - Frontend: "Export audit log" button in enterprise dashboard — triggers CSV download for a date range
  - Backend: New `audit_log` table tracking every scan by org (who, what, when, result). New endpoint `GET /v1/audit-log?from=&to=` returns structured CSV for enterprise customers

- **Morpho / Aerodrome pre-scan webhook** `#20`
  - Frontend: No change (partner-side integration)
  - Backend: New endpoint `POST /v1/partner/scan` — accepts a contract address from a whitelisted partner API key, runs contract scan, returns MESH Score. Partners embed "Scan this contract before depositing" in their UI

---

## Wave 5 — Agent + Discovery Scale

- **MCP skill endpoint** `#21`
  - Frontend: No change — this is for Claude / Cursor developers
  - Backend: New `/mcp` route exposing Meshline as an MCP-compatible tool. Accepts JSON-RPC `tools/call` with `scan_contract`, `scan_wallet`, `get_report` methods. Listed in MCP server registry

- **Agent.market discovery metadata** `#22`
  - Frontend: No change
  - Backend: New `GET /v1/meta` endpoint returns structured capability manifest: available tools, pricing per call, input/output schema, x402 payment details. Used by Agent.market and x402 Bazaar for auto-discovery

- **Onchain attestation indexer** `#23`
  - Frontend: Public registry page at `/registry` — searchable list of all attested scans, filterable by tier and scan type
  - Backend: Background job indexes all Meshline EAS attestations from Base into DB using `getLogs` on the EAS contract. Enables fast lookup without hitting EAS scan API on every request

- **Exploit similarity DB expansion** `#24`
  - Frontend: No change
  - Backend: Expand the known exploit selector set in `services/signals/contract.ts` from current ~7 entries to 50+ signatures sourced from Rekt.news and DeFiHackLabs. Improves `exploitSimilarity` signal accuracy

- **Scan time target: sub-15s** `#25`
  - Frontend: Update "under 30 seconds" copy on landing and docs to "under 15 seconds"
  - Backend: Profile the scan pipeline. Move slowest Basescan calls to background after initial response (async attestation + GitHub disclosure). Return core score + signals to client immediately, push EAS UID via a follow-up `GET /v1/report/:uid` poll
