<!-- Satellite context file — extends the global hub (~/.claude/CLAUDE.md | ~/.pi/agent/AGENTS.md). Host-neutral; project-specific only. Do not duplicate hub standards here. -->

# governance-ui

> A fork of `@solana/governance-ui` (the SPL Governance frontend) — Next.js (Pages Router) UI for Solana on-chain governance: proposals, voting, realms, plugins, and treasury management.

**Org:** rz1989s (personal). This is a downstream fork — keep rebasable on upstream; preserve fork-specific plugins/strategies.

## Stack

- **Framework:** Next.js (Pages Router, `pages/`)
- **Web3:** `@solana/web3.js`, `@solana/spl-governance`, `@solana/wallet-adapter-*`, `@coral-xyz/anchor`, `@metaplex-foundation/*`, `@helium/*`, `@pythnetwork/*`, `@sqds/*`
- **State/data:** Zustand, `@tanstack/react-query`, urql (GraphQL w/ graphcache + auth + persisted exchanges), SWR, immer
- **UI:** Tailwind, Headless UI, Radix UI, `@nivo/*` charts, react-virtualized-window, d3, Emotion
- **Auth/zones:** `@civic/solana-gateway-react`, `@identity.com/sol-did-client`
- **Tooling:** Husky + lint-staged, Jest, Sentry, bundle-analyzer
- **Package manager:** yarn (lockfile present, `bigint-buffer` rebuild workaround)

## Common Commands

```bash
yarn install && yarn allow-scripts && yarn bigint-fix   # setup
yarn dev          # next dev
yarn build        # next build
yarn start        # next start
yarn type-check   # tsc --pretty --noEmit --skipLibCheck
yarn lint         # eslint . --ext ts --ext tsx --ext js --ext jsx
yarn format       # prettier --write .
yarn test         # jest
yarn test-all     # lint + type-check + test
yarn analyze      # ANALYZE=true next build (bundle analyzer)
yarn deduplicate  # check for duplicate deps after adding a package
yarn create-proposal  # ts-node cli/createProposalScript.ts
yarn notifier     # ts-node scripts/governance-notifier.ts
```

## Project Structure

```
pages/                    # Next.js routes (Pages Router)
components/ · actions/ · hooks/ · stores/ · models/ · utils/ · constants/
idls/                     # Anchor IDLs (incl. @helium/idls)
cli/                      # createProposalScript
scripts/                  # governance-notifier + helpers
*Plugin/                  # Vote plugins: DriftStakeVoter, Gateway, HeliumVote, NftVote,
                          # PythVote, Quadratic, TokenHaver, VoterWeightPlugins, VoteStakeRegistry
Strategies/ · hub/ · tools/ · tools/
```

## Deployment

- **`netlify.toml`** — Netlify config. **`Procfile`** — alternative process setup. **Sentry** — `sentry.{client,server}.config.js` + `sentry.properties`.

## Configuration

Custom self-hosted Jupiter Swap API endpoint via env:
```
NEXT_PUBLIC_JUPTER_SWAP_API_ENDPOINT=https://quote-api.jup.ag/v6
```

## Notes

- Large dependency surface (many protocol SDKs); after adding a package run `yarn deduplicate` and review/allow scripts in the allowScripts section, then `yarn allow-scripts`.
- `bigint-fix` rebuilds `bigint-buffer` native bindings — required for BN serialization in the Solana stack.
- No test framework beyond Jest; coverage is light. If asked to add tests, surface this first.