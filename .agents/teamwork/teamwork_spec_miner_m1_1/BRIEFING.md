# BRIEFING — 2026-11-07T17:43:15Z

## Mission
Extract all formal specifications, contracts, and test cases for Backend Network & Dual-Auth endpoints (SuperJSON wire format, auth.login, auth.me, CORS, verification assertions) for Milestone 1.

## 🔒 My Identity
- Archetype: specification_miner
- Roles: auth_spec_investigator
- Working directory: s:\murshid (1)\.agents\teamwork\teamwork_spec_miner_m1_1
- Original parent: 989118c4-ff40-4848-b0e9-e8e037ab7df2
- Milestone: Milestone 1 (Backend Network & Dual-Auth Readiness)

## 🔒 Key Constraints
- Read-only probe: do NOT implement code changes.
- Prioritize authoritative spec sources (codebase, router, superjson, CORS config, iOS WebKit requirements).
- Document exact schemas, wire formats, error shapes, CORS headers, verification assertions.
- Deliver findings in report.md and handoff.md, notify parent via send_message.

## Current Parent
- Conversation ID: 989118c4-ff40-4848-b0e9-e8e037ab7df2
- Updated: 2026-11-07T17:43:15Z

## Task Summary
- **What to build**: Specification report for Milestone 1 Backend Network & Dual-Auth Readiness (SuperJSON wire protocol, auth.login & auth.me success/failure schemas, iOS WebKit CORS specs, verification assertions).
- **Success criteria**: Comprehensive, verified, actionable formal spec in report.md and handoff.md.
- **Interface contracts**: PROJECT.md, tRPC router, SuperJSON specs.
- **Code layout**: .agents/teamwork/ holds only metadata.

## Key Decisions Made
- Extracted exact tRPC SuperJSON wire framing: `{ json: <data> }` for standalone mutations and queries, with `meta.values` for serialized Date fields.
- Formulated exact success response for `auth.login` including `token` field alongside `user` profile for native iOS mobile clients.
- Formulated exact error responses: HTTP 401 UNAUTHORIZED for invalid password and unknown user, HTTP 400 BAD_REQUEST for Zod validation failures.
- Documented `auth.me` behavior: returns HTTP 200 `{ result: { data: { json: null } } }` for unauthenticated requests, contrast with protected endpoints returning HTTP 401.
- Detailed exact iOS WebKit WKWebView CORS requirements: origin reflection for `capacitor://localhost`, `Access-Control-Allow-Credentials: true`, preflight `OPTIONS` status 204 bypass, and CSP `connect-src` update.
- Formulated Reviewer, Challenger, and Auditor assertions with zero DB drift invariance.

## Artifact Index
- DISPATCH.md — Dispatch assignment
- BRIEFING.md — Working memory
- progress.md — Liveness heartbeat
- report.md — Formal specifications, schemas, tables, and assertions
- handoff.md — 5-component handoff report
