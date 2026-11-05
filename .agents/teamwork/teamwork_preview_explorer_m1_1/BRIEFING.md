# BRIEFING — 2026-10-27T11:28:40Z

## Mission
Design backend AI fallback and timeout architecture for Murshid platform (aiChat.ts, aiFallback.ts, faqs.ts, documents.ts).

## 🔒 My Identity
- Archetype: explorer
- Roles: Backend Investigator, Architectural Designer
- Working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\
- Original parent: bd241cda-c8ae-4f16-b4be-daab58196b4d
- Milestone: M1 (Backend AI Fallback & Timeout Architecture)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement source code directly
- Must design concrete backend implementation for aiChat.ts, aiFallback.ts, faqs.ts, documents.ts
- 3-tier fallback engine: Tier 1 FAQ matching, Tier 2 student academic rules guidance, Tier 3 simulated advisor responses
- 1500ms timeout / fast abort for external AI requests
- Output handoff report to handoff.md and notify parent via send_message

## Current Parent
- Conversation ID: bd241cda-c8ae-4f16-b4be-daab58196b4d
- Updated: 2026-10-27T11:20:42Z

## Investigation State
- **Explored paths**:
  - `server/routers/aiChat.ts`: Identified missing `getStatus`, unhandled `fetch` without `AbortSignal.timeout`, and lack of fallback mechanism when Runpod returns 404 or times out.
  - `server/routers/faqs.ts`: Identified unguarded fetch to `${runpodUrl}/add_faq` at line 137.
  - `server/routers/documents.ts`: Identified unguarded fetches at lines 140, 353, 431, 500 without timeouts.
  - `server/utils/`: Confirmed `aiFallback.ts` did not exist.
  - `drizzle/schema.ts`: Inspected `chatMessages`, `aiConversations`, `faqs`, `documents`, and analytics schemas.
  - `scripts/validate-db.mjs`: Database verified (MariaDB 10.11, 29 tables).
- **Key findings**:
  - `RUNPOD_API_URL` currently returns HTTP 404 due to terminated pod proxy; causes chat to return raw error message or hang.
  - Implemented and verified prototype of 3-tier fallback engine in `proposed_aiFallback.ts`.
  - All 3 tiers successfully executed and validated via direct tsx execution.
- **Unexplored areas**: Frontend UI indicator changes (assigned to Explorer 2).

## Key Decisions Made
- Multi-tier architecture: Tier 1 (Database FAQs + built-in Al-Zaytoonah academic catalog) -> Tier 2 (Context-aware student rules: GPA, probation, credits, attendance, schedule, alerts) -> Tier 3 (Empathetic simulated academic advisor).
- 1500ms AbortSignal timeout for external fetches with graceful catch.
- In-memory 30s TTL cache for `getStatus` to prevent probe flood.
- Strict adherence to TypeScript type contracts for `@trpc/server`.

## Artifact Index
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\DISPATCH.md` — Dispatch instructions
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\BRIEFING.md` — Working memory and status
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\progress.md` — Liveness heartbeat
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\proposed_aiFallback.ts` — Complete tested reference implementation for aiFallback.ts
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\handoff.md` — Comprehensive architectural handoff report
