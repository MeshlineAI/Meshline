# Security Policy

## Scope

This policy covers the Meshline scan engine, API, onchain contracts, and EAS attestation infrastructure.

### In scope

- The x402 payment gate and API endpoints
- MESH Score computation and signal logic
- EAS attestation contract and schema
- MESH token contract
- Authentication and access control
- Report generation pipeline (prompt injection, data leakage)
- Trust badge SVG generation

### Out of scope

- Third-party data sources (Basescan, GitHub API, etc.)
- Base L2 itself or the EAS protocol
- Issues already publicly known or previously reported

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Send a report to: **meshlines@outlook.com**

Include:
- A clear description of the vulnerability
- Steps to reproduce
- Potential impact (what an attacker could do)
- If applicable: contract address, transaction hash, or scan UID

We'll acknowledge within 48 hours and aim to have a fix or mitigation in place within 7 days for critical issues.

## What to expect

- We won't take legal action against researchers who follow this policy
- We'll keep you informed as we investigate and fix
- We'll credit you in the fix announcement unless you prefer to stay anonymous

## Known risks and mitigations

**AI report generation:** The Claude-powered report step processes onchain data that could contain adversarial strings. We sanitize all onchain inputs before they reach the prompt. If you find a prompt injection vector that changes report output or leaks system context, report it.

**MESH Score manipulation:** Scores are computed from onchain signals and attested via EAS. A manipulated score that gets attested onchain is a high-severity issue — report it immediately.

**x402 payment bypass:** Any path that returns a full scan result without a verified x402 payment receipt is in scope.

**Trust badge spoofing:** The badge SVG is generated server-side from the latest EAS attestation. Any mechanism to serve a badge with a score that doesn't match the current attestation is in scope.

## Onchain contracts

Once contracts are deployed, their addresses will be listed here. Critical vulnerabilities in deployed contracts may be eligible for a bounty — details to be published at launch.
