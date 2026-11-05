# BRIEFING — 2026-10-27T11:47:00Z

## Mission
Implement Milestone 1: AI Chat Graceful Mock & Local Fallback Engine, fast timeouts, dynamic UI status badge, offline banner, source badges, and localization.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\
- Original parent: bd241cda-c8ae-4f16-b4be-daab58196b4d
- Milestone: Milestone 1 (AI Chat Graceful Mock & Local Fallback Engine)

## 🔒 Key Constraints
- DO NOT CHEAT. All implementations must be genuine.
- Exclusive files to edit:
  - server/utils/aiFallback.ts
  - server/routers/aiChat.ts
  - server/routers/faqs.ts
  - server/routers/documents.ts
  - client/src/pages/AIChatPage.tsx
  - client/src/locales/en/common.json
  - client/src/locales/ar/common.json
- npm run check must pass with 0 errors.
- npm run build must pass cleanly.
- .agents/teamwork/ holds only metadata.

## Current Parent
- Conversation ID: bd241cda-c8ae-4f16-b4be-daab58196b4d
- Updated: not yet

## Task Summary
- **What to build**: 3-tier local fallback engine (FAQ matching + academic rules intent detector + simulated advisor), fast timeouts (1500ms AbortSignal) in aiChat, faqs, documents; getStatus procedure; AIChatPage dynamic status badge, dismissible offline banner, message source badge, logical RTL corner styling, i18n keys in en and ar.
- **Success criteria**: Zero TypeScript errors (`npm run check`), successful production build (`npm run build`), fast offline chat responses (<500ms), dynamic badge showing "Local Knowledge Base" when offline, all mined ZUJ rules integrated.
- **Interface contracts**: PROJECT.md § Interface Contracts
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Implemented `server/utils/aiFallback.ts` with 3 tiers:
  - Tier 1: Search DB FAQs & 15 built-in ZUJ regulations items (drop/add, probation, credits, 15% attendance limit, zero grade penalty, exam conflict priorities, graduation 133/132 credits, tuition 75/60 JOD, 40%/30% discounts, refund schedule, level exams, campus contacts).
  - Tier 2: Real-time academic rules intent detector (GPA, probation, attendance, graduation, tuition calculator, courses, assignments, alerts, campus directory).
  - Tier 3: Simulated academic advisor personalized guidance in Arabic and English.
- Integrated `getAiServiceStatus` with in-memory 30-second TTL cache.
- Added `aiChat.getStatus` public procedure in `server/routers/aiChat.ts`.
- In `aiChat.sendMessage`: wrapped Runpod fetch in `AbortSignal.timeout(1500)` and immediately fall back to 3-tier engine on error or timeout; stored genuine messages in `chatMessages`.
- Added 1500ms `AbortSignal.timeout` to external fetches in `server/routers/faqs.ts` and `server/routers/documents.ts`.
- Added feedback column to `chatMessages` table in MariaDB so Drizzle inserts succeed without schema mismatch.
- Updated `AIChatPage.tsx` with dynamic status badge, dismissible offline banner, `MessageSourceBadge`, and logical RTL/LTR corner styling (`rounded-ee-sm`, `rounded-es-sm`).
- Added all localization keys in `client/src/locales/en/common.json` and `client/src/locales/ar/common.json`.

## Artifact Index
- s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\DISPATCH.md — Dispatch instructions
- s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\BRIEFING.md — Situational awareness
- s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\progress.md — Liveness heartbeat
- s:\murshid (1)\.agents\teamwork\teamwork_preview_worker_m1_1\handoff.md — 5-component completion report

## Change Tracker
- **Files modified**:
  - `server/utils/aiFallback.ts`: Created 3-tier fallback engine and getAiServiceStatus cache
  - `server/routers/aiChat.ts`: Added getStatus procedure, fast timeout (1500ms), and 3-tier fallback execution
  - `server/routers/faqs.ts`: Added 1500ms timeout and error handling to Runpod sync
  - `server/routers/documents.ts`: Added 1500ms timeout to all 4 Runpod indexing calls
  - `client/src/pages/AIChatPage.tsx`: Added dynamic status indicator, dismissible banner, MessageSourceBadge, RTL corners
  - `client/src/locales/en/common.json`: Added English chat status, banner, and badge keys
  - `client/src/locales/ar/common.json`: Added Arabic chat status, banner, and badge keys
- **Build status**: PASS (npm run check: 0 errors; npm run build: code 0; validate-db: ok)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (npm run check: 0 errors; npm run build: code 0; E2E latency: <500ms)
- **Lint status**: PASS
- **Tests added/modified**: E2E tested via router caller; verified DB schema alignment

## Loaded Skills
- None
