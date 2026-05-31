# Contributing to Meshline

Thanks for your interest. Meshline is an early-stage product — contributions that tighten the scan engine, improve signal accuracy, or reduce false positives are especially valuable.

## Before you start

Open an issue before writing code for anything non-trivial. This keeps effort from going in a direction that won't merge. For bug fixes and small improvements, a PR is fine without prior discussion.

## What we're looking for

- **Signal improvements** — better detection logic for the 12 Contract Intel signals
- **Wallet Intel accuracy** — drainer pattern matching, approval risk heuristics
- **Base App Audit coverage** — new frontend security checks
- **Agent API** — x402 integration improvements, new endpoints
- **Test coverage** — unit and integration tests for the analysis pipeline

## What we're not looking for right now

- UI redesigns without prior discussion
- New token mechanics
- Dependency upgrades without a clear reason

## Setup

```bash
git clone https://github.com/meshline-io/meshline
cd meshline
# follow setup instructions in docs/SETUP.md
```

## Workflow

1. Fork the repo and create a branch: `git checkout -b feat/your-thing`
2. Make your changes
3. Run tests: `npm test` (or the project equivalent)
4. Open a PR against `main` with a clear description of what changed and why

## PR guidelines

- Keep PRs focused — one concern per PR
- Write a clear description: what the change does, why it's needed, how you tested it
- If your change touches signal logic, include a test case with a known-risky and known-safe contract
- Don't bump the MESH Score formula without opening an issue first — score changes affect all existing attestations

## Commit style

Plain English, present tense. Describe what the commit does, not what you did.

```
add honeypot simulation for ERC-20 tokens
fix false positive on verified proxy contracts
improve reentrancy pattern matching for Solidity 0.8+
```

## Code style

Follow the existing patterns in the file you're editing. We'll add a linter config in Phase 1.

## Reporting bugs

Open an issue with:
- What you scanned (contract/wallet/app)
- What score/result you got
- What you expected
- Steps to reproduce

For security vulnerabilities, see [SECURITY.md](SECURITY.md).

## Questions

Open a discussion or drop into the Base ecosystem channels. We'll add a Discord link once the community is live.
