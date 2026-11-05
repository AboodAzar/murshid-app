# DISPATCH: Milestone 1 Explorer 1 (Backend AI Fallback & Timeout Architecture)

You are Explorer 1 for Milestone 1 (AI Chat Graceful Mock & Local Fallback Engine).
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md

Please read `ORIGINAL_REQUEST.md` and `PROJECT.md` carefully.

Objective:
Design the concrete backend implementation for decoupling the platform from Runpod and providing a fast, resilient local fallback engine:
1. Analyze `server/routers/aiChat.ts`:
   - Design the `aiChat.getStatus` procedure returning `{ isOnline: boolean, mode: "local_mock_fallback", model: string }`.
   - Design `aiChat.sendMessage` refactor: Add `AbortSignal.timeout(1500)` to any external fetch or catch immediately if `RUNPOD_API_URL` is unavailable/offline, and invoke local fallback without hanging or throwing raw errors.
   - Return `{ success: true, response: text, isOfflineFallback: true, source: "faq" | "academic_rules" | "local_advisor" }`.
   - Ensure `chatmessages` records are saved with appropriate metadata.
2. Analyze `server/routers/faqs.ts` and `server/routers/documents.ts`:
   - Identify where external Runpod calls occur and ensure they have short timeouts and fail gracefully without breaking the user experience or throwing 500 errors.
3. Design `server/utils/aiFallback.ts`:
   - Design a modular 3-tier fallback engine:
     * Tier 1: Search `faqs` table (both English and Arabic questions/answers).
     * Tier 2: Academic rules intent detector using student context (GPA, courses, attendance, prerequisites).
     * Tier 3: Simulated advisor guidance in the user's preferred language.
4. Verify TypeScript type safety and contract compatibility with `@trpc/server` and existing schemas.

Deliverable:
Write your structured architecture and implementation blueprint into:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\handoff.md`
Report when done via `send_message`.


## 2026-10-27T11:20:42Z
You are Explorer 1 for Milestone 1 (Backend AI Fallback & Timeout Architecture).
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md
Your dispatch instructions: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\DISPATCH.md

Read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md first.
Design the backend implementation for:
1. `server/routers/aiChat.ts` (getStatus procedure, fast 1500ms timeout/fallback in sendMessage).
2. `server/utils/aiFallback.ts` (3-tier fallback: FAQ matching, student academic rules, simulated advisor).
3. `server/routers/faqs.ts` and `server/routers/documents.ts` (graceful timeout handling).
Ensure clean TypeScript types and contracts.
Write your report to:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\handoff.md`
Report when done via send_message.
