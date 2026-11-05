# Milestone 1 Review & Adversarial Stress Report: AI Chat Graceful Mock & Local Fallback Engine

**Agent:** Reviewer 2 (`teamwork_preview_reviewer_m1_2`)  
**Role:** Reviewer & Adversarial Critic  
**Date:** 2026-10-27  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_preview_reviewer_m1_2\`  
**Milestone:** M1 — AI Chat Graceful Mock & Local Fallback Engine  
**Verdict:** **APPROVE**

---

## 1. Observation

1. **Timeout & Network Isolation Verification**:
   - `server/routers/aiChat.ts:234`: External call to `${runpodUrl}/chat` contains `signal: AbortSignal.timeout(1500)`.
   - `server/routers/faqs.ts:144`: External call to `${runpodUrl}/add_faq` contains `signal: AbortSignal.timeout(1500)`.
   - `server/routers/documents.ts`:
     - Line 143 (`upload_document`): `signal: AbortSignal.timeout(1500)`
     - Line 364 (`add_url` via `importOfficialResource`): `signal: AbortSignal.timeout(1500)`
     - Line 441 (`add_url` via `addOfficialLink`): `signal: AbortSignal.timeout(1500)`
     - Line 512 (`add_url` via `retryDocumentIndexing`): `signal: AbortSignal.timeout(1500)`
   - `server/utils/aiFallback.ts:553`: Probe call in `getAiServiceStatus()` contains `signal: AbortSignal.timeout(800)`.
   - Every fetch call to external endpoints is safely enclosed in try/catch blocks with fallback logic; none propagate uncaught network rejections.

2. **Absence of Raw Error Leakage**:
   - In `server/routers/aiChat.ts:245-247`, network failures are trapped via `catch (fetchError: any) { console.warn("[AI Chat] Runpod request skipped or timed out (1500ms limit); engaging local fallback engine.", fetchError?.message); }`. No raw error text or stack traces are passed to the student.
   - In `server/routers/aiChat.ts:291-299`, procedure-level exceptions fall back to a clean localized user-facing message: `"عذراً، حدث خطأ أثناء معالجة المحادثة. يرجى المحاولة مرة أخرى."`.
   - In `client/src/pages/AIChatPage.tsx:249-251`, mutation errors fall back to localized `t("chat.sendError")`.

3. **Frontend UI/UX, Dynamic Badges & Local Fallback Banner**:
   - `client/src/pages/AIChatPage.tsx:184-187`: Uses `trpc.aiChat.getStatus.useQuery` with `refetchInterval: 30000`.
   - `client/src/pages/AIChatPage.tsx:303-315`: Renders an amber status badge (`chat.statusLocal` / "Local Knowledge Base" / "قاعدة المعرفة المحلية") with an offline badge (`chat.statusOffline` / "Offline Mode") when offline/mock fallback is active.
   - `client/src/pages/AIChatPage.tsx:662-690`: Renders a dismissible amber banner (`showFallbackBanner`) informing the student of local regulation fallback mode with an `X` dismiss button.
   - `client/src/pages/AIChatPage.tsx:98-148`: `MessageSourceBadge` displays explicit provenance tags:
     - `faq`: "لوائح وأسئلة الزيتونة" / "ZUJ Regulations FAQ"
     - `academic_rules`: "الخطة الدراسية والقواعد" / "Academic Rules"
     - `local_advisor`: "إرشادات المرشد المحلي" / "Advisor Guidance"
     - `external_llm`: "نموذج سحابي حي" / "Live Model"
   - RTL Layout: Chat bubbles use Tailwind logical corner classes (`rounded-ee-sm` and `rounded-es-sm`) and directional spacing (`me-1.5`, `start-0`, `end-0`) ensuring correct bidirectional alignment in both Arabic and English.

4. **Localization Key Parity**:
   - Both `client/src/locales/en/common.json:496-521` and `client/src/locales/ar/common.json:496-521` define identical keys:
     - `statusOnline`, `statusLocal`, `statusChecking`, `statusOffline`
     - `bannerTitle`, `bannerDescription`
     - `badgeFaq`, `badgeAcademicRules`, `badgeLocalAdvisor`, `badgeLocalFallback`, `badgeLiveModel`
     - `sendError`, `placeholder`, `startNewChat`, etc.

5. **Automated Testing & Build Verification**:
   - `npm test` (`vitest run`): 5 test suites passed, 27 tests passed, 0 failures.
   - `npm run check` (`tsc --noEmit`): Exited with code 0 (zero type errors).
   - `npm run build` (Vite client + esbuild server): Built in 14.55s, generated `dist/index.js` (349.7 kB) and client bundle cleanly with code 0.
   - `node scripts/validate-db.mjs`: Exited with code 0 (`"ok": true`, 29 tables).

6. **Adversarial Stress Test Results**:
   - **Timeout Test**: Under an unreachable IP (`http://10.255.255.1:8000`), `sendMessage` aborted cleanly after 1534ms and fell back to `academic_rules` without throwing.
   - **Malformed 500 Test**: Under an HTTP 500 endpoint returning broken JSON, `sendMessage` fell back to Tier 1 FAQ in < 30ms without error leakage.
   - **Degraded Context Test**: When `StudentAcademicContext` contained empty strings, `undefined`, and zeroed numbers, all 9 intent patterns (`gpa`, `probation`, `attendance`, `graduation`, `tuition`, `courses`, `assignments`, `alerts`, `campus_offices`) produced valid responses with zero exceptions.
   - **Adversarial Inputs**: Evaluated empty queries, whitespace, single letters, emojis, SQL injection strings (`DROP TABLE`), XSS script tags, and 5000-character payloads. All handled safely.
   - **Security Authorization**: Attempting to invoke `aiChat.sendMessage` without a session returned `UNAUTHORIZED`. Calling as an `advisor` role was rejected with `UNAUTHORIZED`. Conversations are strictly validated against `eq(aiConversations.studentId, ctx.user.id)`.

7. **Integrity Mode Audit**:
   - No hardcoded test values, facade mocks, or bypassed logic were detected.
   - `aiFallback.ts` contains 586 lines of authentic business rules, Arabic text normalization (tashkeel stripping, alef/taa marbuta normalization), and calculation algorithms reflecting Al-Zaytoonah University regulations.

---

## 2. Logic Chain

1. **Resilience under Network Failure (Obs. 1 & 6)**:
   - Because `AbortSignal.timeout(1500)` is enforced on all external endpoints, an unreachable, hanging, or slow Runpod instance will never block tRPC worker threads or hang the student UI beyond 1.5 seconds.
   - When an abort or network error occurs, the try/catch block intercepts the failure, logs a diagnostic warning, and smoothly transitions execution to `generateLocalFallbackResponse()`.
2. **Deterministic Fallback Quality & Context Enrichment (Obs. 2 & 6)**:
   - When external LLMs are unavailable, student queries are answered with authoritative, verified data mined directly from ZUJ regulations (Articles 10, 11, 15, 18, 21, 27, 28) and live student records from MariaDB (`studyPlans`, `studentCourses`, `attendance`, `academicAlerts`).
   - Token-overlap scoring and Arabic normalization ensure robust keyword detection even with typos or dialectal variations.
3. **UX Transparency & RTL Fidelity (Obs. 3 & 4)**:
   - Displaying dynamic status indicators ("Local Knowledge Base", "Offline Mode") and provenance badges ("ZUJ Regulations FAQ", "Academic Rules", "Advisor Guidance") prevents user confusion and makes the offline state transparent and trustworthy.
   - Logical Tailwind properties ensure that the UI behaves natively whether viewing in Arabic (RTL) or English (LTR).
4. **Safety & Security (Obs. 1, 2, 6)**:
   - Server-side role checks and user ownership verification prevent unauthorized students or advisors from accessing or mutating other users' conversations.
   - Error masking ensures that database connection errors or upstream HTTP errors are never exposed in user chat bubbles.
5. **Compilation & System Integrity (Obs. 5 & 7)**:
   - With `npm test`, `npm run check`, `npm run build`, and `validate-db.mjs` all passing with code 0, Milestone 1 meets all architectural and quality gates specified in `PROJECT.md` and `ORIGINAL_REQUEST.md`.

---

## 3. Caveats

- **Runpod Future Reconnection**: When a new Runpod instance is provisioned, setting `RUNPOD_API_URL` in `.env` will automatically re-enable live LLM inferences without requiring any code modifications, because the probe in `getAiServiceStatus()` checks for HTTP 200 responses.
- **In-Memory Cache Window**: `getAiServiceStatus()` caches health status for 30 seconds (`STATUS_CACHE_TTL_MS = 30_000`) to avoid excessive ping requests.
- No other caveats.

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone 1 satisfies all functional, security, robustness, UX, and testing requirements:
- External Runpod dependency has been safely decoupled with 1500ms fast timeouts across `aiChat.ts`, `faqs.ts`, and `documents.ts`.
- The 3-tier local fallback engine functions deterministically with zero crash potential under degraded or adversarial conditions.
- Frontend status badges, dismissible offline notice, source provenance pills, and bilingual RTL support are fully implemented and visually polished.
- Unit tests (`npm test`), TypeScript verification (`npm run check`), production build (`npm run build`), and database checks (`validate-db.mjs`) all exit with code 0.

---

## 5. Verification Method

To verify these results independently from PowerShell in the project root:

1. **Run Vitest Unit Tests**:
   ```powershell
   npm test
   ```
   *Expected Output*: 5 test files passed, 27 passed, code 0.

2. **Run TypeScript Typecheck**:
   ```powershell
   npm run check
   ```
   *Expected Output*: Zero errors, code 0.

3. **Run Production Build**:
   ```powershell
   npm run build
   ```
   *Expected Output*: Vite client and esbuild server bundle created with code 0.

4. **Verify Database Validation**:
   ```powershell
   node scripts/validate-db.mjs
   ```
   *Expected Output*: `{"ok": true, "tableCount": 29, ...}`.

5. **Verify Fast Timeout & Fallback Execution (< 2000ms)**:
   ```powershell
   npx tsx -e "import 'dotenv/config'; import { appRouter } from './server/routers'; import { getDb } from './server/db'; import { users } from './drizzle/schema'; import { eq } from 'drizzle-orm'; async function test() { process.env.RUNPOD_API_URL = 'http://10.255.255.1:8000'; const db = await getDb(); const [student] = await db.select().from(users).where(eq(users.role, 'student')).limit(1); const caller = appRouter.createCaller({ user: student, req: {} as any, res: {} as any }); const newConv = await caller.aiChat.createConversation({ title: 'Reviewer Test' }); const start = Date.now(); const res = await caller.aiChat.sendMessage({ conversationId: newConv.conversationId, message: 'كم معدلي الحالي؟' }); const elapsed = Date.now() - start; console.log('Elapsed:', elapsed, 'ms | Fallback Source:', res.source, '| isOfflineFallback:', res.isOfflineFallback); await caller.aiChat.deleteConversation(newConv.conversationId); process.exit(0); } test();"
   ```
   *Expected Output*: Elapsed ~1500ms, `source: 'academic_rules'`, `isOfflineFallback: true`.
