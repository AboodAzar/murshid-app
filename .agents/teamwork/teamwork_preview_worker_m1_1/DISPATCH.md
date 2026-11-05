# DISPATCH: Milestone 1 Worker (AI Chat Graceful Mock & Local Fallback Engine)

You are the Implementation Worker for Milestone 1: AI Chat Graceful Mock & Local Fallback Engine.
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Input Findings to Read First:
1. `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\handoff.md` (Backend AI Fallback architecture)
2. `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\proposed_aiFallback.ts` (Drop-in reference implementation of the 3-tier fallback engine)
3. `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_2\handoff.md` (Frontend AIChatPage architecture, status badge, banner, source badges, i18n keys)
4. `s:\murshid (1)\.agents\teamwork\teamwork_preview_spec_miner_m1_1\handoff.md` (Authoritative ZUJ academic regulations, fees, attendance rules, and contact info)

## Your Exclusive File Ownership:
- `server/utils/aiFallback.ts`
- `server/routers/aiChat.ts`
- `server/routers/faqs.ts`
- `server/routers/documents.ts`
- `client/src/pages/AIChatPage.tsx`
- `client/src/locales/en/common.json`
- `client/src/locales/ar/common.json`

## Tasks to Execute:
1. Create `server/utils/aiFallback.ts` integrating the 3-tier local fallback engine (FAQ matching, academic rules intent detector, simulated advisor) enriched with the mined ZUJ regulations from the Spec Miner report. Implement cached `getAiServiceStatus()`.
2. Update `server/routers/aiChat.ts`:
   - Add `aiChat.getStatus` public query returning `{ isOnline: boolean, mode: "local_mock_fallback", model: string }`.
   - In `aiChat.sendMessage`: Add `signal: AbortSignal.timeout(1500)` to Runpod fetch or fallback immediately when unreachable. On fallback, generate local response, insert into `chatMessages`, and return `{ success: true, response: text, isOfflineFallback: true, source: "faq" | "academic_rules" | "local_advisor" }`. Ensure it NEVER hangs or throws raw errors.
3. Update `server/routers/faqs.ts` and `server/routers/documents.ts`:
   - Add `signal: AbortSignal.timeout(1500)` and try/catch around external Runpod fetch calls so advisor operations never hang.
4. Update `client/src/pages/AIChatPage.tsx`:
   - Replace static "AI Online" badge with dynamic status querying `trpc.aiChat.getStatus` (amber "Local Knowledge Base" when offline/fallback, emerald "AI Online" when connected).
   - Add dismissible amber "Local Fallback Mode" banner at the top of the chat area.
   - Add `MessageSourceBadge` displaying the origin of assistant messages.
   - Use logical RTL/LTR corner styling (`rounded-ee-sm`, `rounded-es-sm`).
5. Update `client/src/locales/en/common.json` and `client/src/locales/ar/common.json` with the required chat localization keys.
6. Verify your implementation:
   - Run `npm run check` (`tsc --noEmit`) — MUST PASS WITH ZERO ERRORS.
   - Run `npm run build` — MUST PASS CLEANLY.
   - Test sending an AI chat message via a quick node test script or tRPC call to ensure fast (<500ms) response without Runpod.

## Deliverable:
Write your structured completion report with verified test output into:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\handoff.md`
Report when done via `send_message`.


## 2026-10-27T11:31:20Z
[Message] timestamp=2026-10-27T11:31:20Z sender=bd241cda-c8ae-4f16-b4be-daab58196b4d priority=MESSAGE_PRIORITY_HIGH content=You are Worker 1 for Milestone 1 (AI Chat Graceful Mock & Local Fallback Engine).
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md
Your dispatch instructions: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\DISPATCH.md

Read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md first.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive files to edit:
- server/utils/aiFallback.ts
- server/routers/aiChat.ts
- server/routers/faqs.ts
- server/routers/documents.ts
- client/src/pages/AIChatPage.tsx
- client/src/locales/en/common.json
- client/src/locales/ar/common.json

Implement the 3-tier local fallback engine, aiChat.getStatus, fast timeouts, dynamic UI status badge, offline banner, source badges, and localization.
Run npm run check and npm run build to verify zero errors.
Write your completion report to:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\handoff.md`
Report when done via send_message.
