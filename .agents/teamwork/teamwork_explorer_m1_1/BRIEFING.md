# BRIEFING — 2026-11-07T17:41:50Z

## Mission
Investigate server/_core/index.ts and related server middleware to define CORS, OPTIONS preflight, and CSP policies for iOS Capacitor & local network support, providing drop-in code recommendations for Worker M1.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Backend CORS Specialist, Investigator
- Working directory: s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_1
- Original parent: 989118c4-ff40-4848-b0e9-e8e037ab7df2
- Milestone: Milestone 1 (Backend Network & Dual-Auth Readiness)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Investigate server/_core/index.ts and related server middleware
- Output report.md and handoff.md in own folder
- Notify parent agent via send_message

## Current Parent
- Conversation ID: 989118c4-ff40-4848-b0e9-e8e037ab7df2
- Updated: 2026-11-07T17:41:50Z

## Investigation State
- **Explored paths**:
  - `server/_core/index.ts` (middleware stack, CSP, security headers, rate limiters, tRPC)
  - `server/_core/rateLimiter.ts` (rate limiting behavior on OPTIONS requests)
  - `server/_core/sdk.ts` (session extraction, JWT verification)
  - `server/routers/auth.ts` (login mutation and me query)
  - `PROJECT.md` & `ORIGINAL_REQUEST.md` (milestone specifications)
- **Key findings**:
  - Zero CORS headers currently present in `server/_core/index.ts`.
  - OPTIONS preflight unhandled, causing rate limiting increments and 404/method errors at tRPC.
  - CSP `connect-src` at line 38 blocks cleartext HTTP and Capacitor schemes (`'self' https:`).
  - Clean modular CORS middleware `server/_core/cors.ts` designed with origin reflection for `capacitor://localhost`, `http://localhost`, `http://172.20.10.*`, and private LANs.
  - Dual-Auth Bearer token support defined for `sdk.ts` and `routers/auth.ts`.
  - Independent 3-layer verification strategy designed (vitest, live curl/HTTP, typecheck).
- **Unexplored areas**: None for M1 CORS scope.

## Key Decisions Made
- Recommend modular `server/_core/cors.ts` registered early in `index.ts` right after `app.set("trust proxy", 1)`.
- Use origin reflection (never wildcard `*` with credentials) to comply with W3C CORS spec.
- Return 204 immediately on OPTIONS requests to prevent rate limit consumption.

## Artifact Index
- `DISPATCH.md` — incoming dispatch instructions
- `progress.md` — liveness heartbeat
- `BRIEFING.md` — persistent working memory
- `report.md` — full detailed technical report with drop-in code recommendations
- `handoff.md` — 5-component hard handoff report for Worker M1
