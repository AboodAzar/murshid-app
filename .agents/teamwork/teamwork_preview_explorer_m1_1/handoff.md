# Handoff Report: Milestone 1 — Backend AI Fallback & Timeout Architecture

**Explorer:** Explorer 1 (Milestone 1)  
**Date:** 2026-10-27  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\`  
**Reference Implementation:** `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\proposed_aiFallback.ts`

---

## 1. Observation

### Codebase Observations & Exact Locations
1. **External Runpod API Offline (HTTP 404)**:
   - File `.env:8`: `RUNPOD_API_URL=https://w3826qxum4rug3-8000.proxy.runpod.net/`
   - Direct network probe command:
     ```powershell
     node -e "fetch('https://w3826qxum4rug3-8000.proxy.runpod.net/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'hello' }), signal: AbortSignal.timeout(2000) }).then(r => console.log('status:', r.status)).catch(e => console.log('error:', e.name, e.message))"
     ```
   - Result: `status: 404`. The remote Runpod pod instance has expired / terminated.

2. **Uncaught Error & Blocking in `server/routers/aiChat.ts`**:
   - Lines 207-238:
     ```typescript
     const runpodUrl = process.env.RUNPOD_API_URL;
     if (!runpodUrl) {
       throw new TRPCError({
         code: "INTERNAL_SERVER_ERROR",
         message: "RUNPOD_API_URL is not configured",
       });
     }
     ...
     const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/chat`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(runpodPayload),
     });

     if (!response.ok) {
       throw new TRPCError({
         code: "INTERNAL_SERVER_ERROR",
         message: `Runpod API error: ${response.statusText}`,
       });
     }
     ```
   - Lines 269-272:
     ```typescript
     } catch (error: any) {
       console.error("[AI Chat] Failed to send message:", error);
       return { success: false, response: `Exact Error: ${error.message}` };
     }
     ```
   - When Runpod returns 404 or fails to respond, `fetch` hangs indefinitely or throws, returning `{ success: false, response: "Exact Error: Runpod API error: Not Found" }`. The chat interface displays a broken raw error to students.
   - Procedure `aiChat.getStatus` does **not exist** in `aiChatRouter`, leaving the client without any way to detect service health or toggle offline fallback badges.

3. **Unguarded Network Calls in `server/routers/faqs.ts`**:
   - Lines 134-148:
     ```typescript
     const runpodUrl = process.env.RUNPOD_API_URL;
     if (runpodUrl) {
       try {
         await fetch(`${runpodUrl.replace(/\/$/, '')}/add_faq`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             question: input.question,
             answer: input.answer
           }),
         });
       } catch (e) {
         console.error("[FAQs] Runpod sync failed:", e);
       }
     }
     ```
   - Does not supply an `AbortSignal`. If Runpod hangs or is unroutable, the mutation blocks for up to Node default network timeouts (120+ seconds).

4. **Unguarded Network Calls in `server/routers/documents.ts`**:
   - Line 140 (`upload` procedure): `await fetch(`${runpodUrl.replace(/\/$/, '')}/upload_document`, { method: "POST", body: formData })` — No timeout.
   - Line 353 (`importOfficialResource` procedure): `await fetch(`${runpodUrl.replace(/\/$/, '')}/add_url`, ...)` — No timeout.
   - Line 431 (`addOfficialLink` procedure): `await fetch(`${runpodUrl.replace(/\/$/, '')}/add_url`, ...)` — No timeout.
   - Line 500 (`retryDocumentIndexing` procedure): `await fetch(`${runpodUrl.replace(/\/$/, '')}/add_url`, ...)` — No timeout.

5. **Database State & Schemas**:
   - Verified via `node scripts/validate-db.mjs`: Database MariaDB 10.11 on `localhost:3306/murshid` contains 29 tables; reports `ok: true`.
   - `faqs` table (`drizzle/schema.ts:208`) currently holds only 1 active record.
   - `chatMessages` table (`drizzle/schema.ts:182`) schema:
     `{ id: int, conversationId: int, role: enum("user", "assistant"), content: longtext, tokens: int, feedback: enum("up", "down", "none"), createdAt: timestamp }`.
   - `aiConversations` table (`drizzle/schema.ts:167`):
     `{ id: int, studentId: int, title: varchar, context: text, createdAt: timestamp, updatedAt: timestamp }`.

---

## 2. Logic Chain

1. **Why external decoupling is essential (from Obs. 1 & 2)**:
   Because `RUNPOD_API_URL` returns HTTP 404, any procedure relying solely on an external endpoint fails immediately. Wrapping the external call in `AbortSignal.timeout(1500)` and catching errors enables fast-fail (<= 1500ms) with immediate seamless fallback to local advising.

2. **Why a 3-tier fallback architecture is optimal (from Obs. 2 & 5)**:
   - **Tier 1 (FAQ Matching)**: Because the live database currently has only 1 FAQ (Obs. 5), the fallback engine must combine live database FAQs with a rich built-in academic catalog for Al-Zaytoonah University of Jordan (ZUJ) covering drop/add, probation, credit limits, exam conflicts, attendance rules, and graduation.
   - **Tier 2 (Academic Rules Intent Detector)**: Students frequently ask personal questions ("What is my GPA?", "Am I on probation?", "How many credits left?", "What are my courses?"). Using the student's existing context (`studyPlans`, `studentCourses`, `attendance`, `academicAlerts`), rule-based responses deliver accurate, personalized, zero-latency answers in both Arabic and English.
   - **Tier 3 (Simulated Academic Advisor)**: For open-ended inquiries (study skills, exam preparation, career guidance in Software Engineering / CS), a simulated persona addresses the student warmly by name, contextualizes advice with their major, and recommends actionable next steps.

3. **Why `aiChat.getStatus` must be cached (from Obs. 2)**:
   Querying external health on every UI render or tab change can spam network sockets. Using an in-memory 30-second TTL cache (`cachedStatus`) ensures status checks return in 0ms for warm requests while maintaining responsive state detection.

4. **Why `faqs.ts` and `documents.ts` require timeouts (from Obs. 3 & 4)**:
   Adding `signal: AbortSignal.timeout(1500)` ensures advisor workflows (creating FAQs, uploading documents, importing links) remain fast and responsive even when Runpod is offline, logging non-fatal warnings instead of freezing the UI.

---

## 3. Caveats

1. **Client UI Status Badges**: This blueprint covers backend routers, utils, and contract types. Frontend UI components (`AIChatPage.tsx` and `DashboardLayout.tsx`) need to bind to `trpc.aiChat.getStatus.useQuery()` to render the dynamic badge and fallback banner (assigned to Milestone 1 Explorer 2 / UI builder).
2. **Heavy LLM Model Deferral**: As requested in R3, heavy LLM generation is deferred; the local fallback engine acts as an intelligent, deterministic, high-accuracy mock advisor.
3. **Environment Variable Override**: An optional environment variable `AI_FORCE_LOCAL_FALLBACK=true` can be set in `.env` to skip external probes entirely for 100% offline development.

---

## 4. Conclusion & Concrete Implementation Blueprint

### A. New File: `server/utils/aiFallback.ts`
Implement the 3-tier local fallback engine. A complete, fully tested implementation has been created at `s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_1\proposed_aiFallback.ts`.

#### Key Interfaces & Functions:
```typescript
export interface StudentAcademicContext {
  id?: number;
  name: string;
  major: string;
  gpa: string | number;
  completedCredits: number;
  totalCredits: number;
  attendanceRate: number; // percentage (0-100)
  currentCourses: Array<{
    name: string;
    code: string;
    credits: number;
    status: string;
  }>;
  pendingAssignments: number;
  activeAlerts: Array<{
    title: string;
    severity: string;
  }>;
}

export interface FallbackResponse {
  response: string;
  isOfflineFallback: true;
  source: "faq" | "academic_rules" | "local_advisor";
  matchedTopic?: string;
}

export function detectLanguage(text: string): "ar" | "en";
export function normalizeText(text: string): string;
export function matchFaq(query: string, dbFaqs: FaqItem[], lang: "ar" | "en"): { answer: string; topic: string } | null;
export function matchAcademicRules(query: string, ctx: StudentAcademicContext, lang: "ar" | "en"): { answer: string; intent: string } | null;
export function generateSimulatedAdvisor(query: string, ctx: StudentAcademicContext, lang: "ar" | "en"): { answer: string; topic: string };
export async function generateLocalFallbackResponse(params: {
  query: string;
  studentContext: StudentAcademicContext;
  dbFaqs?: FaqItem[];
  dbDocs?: Array<{ title: string; category: string }>;
}): Promise<FallbackResponse>;
export async function getAiServiceStatus(): Promise<{
  isOnline: boolean;
  mode: "local_mock_fallback" | "external_model";
  model: string;
}>;
```

---

### B. Router Blueprint: `server/routers/aiChat.ts`

#### 1. Import Additions:
```typescript
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { generateLocalFallbackResponse, getAiServiceStatus } from "../utils/aiFallback";
```

#### 2. Procedure `getStatus`:
```typescript
  getStatus: publicProcedure.query(async () => {
    return await getAiServiceStatus();
  }),
```

#### 3. Refactored Procedure `sendMessage`:
Replace lines 207-272 with:
```typescript
        let aiMessage: string | null = null;
        let isOfflineFallback = true;
        let source: "faq" | "academic_rules" | "local_advisor" | "external_llm" = "local_advisor";

        const runpodUrl = process.env.RUNPOD_API_URL;
        if (runpodUrl && process.env.AI_FORCE_LOCAL_FALLBACK !== "true") {
          try {
            const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(runpodPayload),
              signal: AbortSignal.timeout(1500),
            });

            if (response.ok) {
              const runpodData = await response.json();
              if (runpodData?.answer && typeof runpodData.answer === "string") {
                aiMessage = runpodData.answer;
                isOfflineFallback = false;
                source = "external_llm";
              }
            }
          } catch (fetchError: any) {
            console.warn("[AI Chat] Runpod request skipped or timed out (1500ms limit); engaging local fallback engine.", fetchError?.message);
          }
        }

        // If external model is offline or timed out, execute 3-tier local fallback engine
        if (!aiMessage) {
          const fallback = await generateLocalFallbackResponse({
            query: input.message,
            studentContext,
            dbFaqs: activeFaqs.map(f => ({
              question: f.q,
              questionAr: f.q,
              answer: f.a,
              answerAr: f.a,
            })),
            dbDocs: activeDocs,
          });

          aiMessage = fallback.response;
          isOfflineFallback = true;
          source = fallback.source;
        }

        // Save AI response to DB
        try {
          await db.insert(chatMessages).values({
            conversationId: input.conversationId,
            role: "assistant" as const,
            content: aiMessage,
            tokens: 0,
          });

          await db.update(aiConversations)
            .set({ updatedAt: new Date() })
            .where(eq(aiConversations.id, input.conversationId));
        } catch (dbError) {
          console.error("[AI Chat] Failed to save AI message to DB:", dbError);
        }

        return {
          success: true,
          response: aiMessage,
          isOfflineFallback,
          source,
        };
      } catch (error: any) {
        console.error("[AI Chat] Failed to send message:", error);
        return {
          success: false,
          response: "عذراً، حدث خطأ أثناء معالجة المحادثة. يرجى المحاولة مرة أخرى.",
          isOfflineFallback: true,
          source: "local_advisor" as const,
        };
      }
```

---

### C. Router Blueprint: `server/routers/faqs.ts`
Modify lines 136-147 in `create` procedure:
```typescript
        if (input.isActive) {
          const runpodUrl = process.env.RUNPOD_API_URL;
          if (runpodUrl && process.env.AI_FORCE_LOCAL_FALLBACK !== "true") {
            try {
              await fetch(`${runpodUrl.replace(/\/$/, '')}/add_faq`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: input.question,
                  answer: input.answer,
                }),
                signal: AbortSignal.timeout(1500),
              });
            } catch (e: any) {
              console.warn("[FAQs] Runpod sync skipped/timed out:", e?.message);
            }
          }
        }
```

---

### D. Router Blueprint: `server/routers/documents.ts`
Add `signal: AbortSignal.timeout(1500)` to all 4 external fetch points:
1. `upload` (line 140):
   ```typescript
   const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/upload_document`, {
     method: "POST",
     body: formData,
     signal: AbortSignal.timeout(1500),
   });
   ```
2. `importOfficialResource` (line 353):
   ```typescript
   const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/add_url`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ url: resource.url, title: resource.title, source: resource.source }),
     signal: AbortSignal.timeout(1500),
   });
   ```
3. `addOfficialLink` (line 431):
   ```typescript
   const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/add_url`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ url: input.url, title: input.title }),
     signal: AbortSignal.timeout(1500),
   });
   ```
4. `retryDocumentIndexing` (line 500):
   ```typescript
   const response = await fetch(`${runpodUrl.replace(/\/$/, '')}/add_url`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ url: doc[0].fileUrl, title: doc[0].title }),
     signal: AbortSignal.timeout(1500),
   });
   ```

---

## 5. Verification Method

### Concrete Verification Steps
1. **Unit Testing 3-Tier Fallback Engine**:
   Run the verified test command:
   ```powershell
   npx tsx -e "import { generateLocalFallbackResponse, getAiServiceStatus } from './server/utils/aiFallback.ts'; async function test() { const res1 = await generateLocalFallbackResponse({ query: 'متى تبدأ فترة السحب والإضافة؟', studentContext: { name: 'Ahmad', major: 'SE', gpa: '3.1', completedCredits: 50, totalCredits: 132, attendanceRate: 92, currentCourses: [], pendingAssignments: 0, activeAlerts: [] } }); console.log('Tier 1 Test:', res1.source === 'faq' ? 'PASS' : 'FAIL'); const res2 = await generateLocalFallbackResponse({ query: 'كم معدلي؟', studentContext: { name: 'Ahmad', major: 'SE', gpa: '3.1', completedCredits: 50, totalCredits: 132, attendanceRate: 92, currentCourses: [], pendingAssignments: 0, activeAlerts: [] } }); console.log('Tier 2 Test:', res2.source === 'academic_rules' ? 'PASS' : 'FAIL'); const status = await getAiServiceStatus(); console.log('Status Test:', status.mode === 'local_mock_fallback' ? 'PASS' : 'FAIL'); } test();"
   ```

2. **TypeScript Compilation Validation**:
   ```powershell
   npm run check
   ```
   Must complete with 0 errors.

3. **End-to-End Chat Flow Verification**:
   Using `scripts/smoke-test-student.mjs`:
   Add mutation call to `client.aiChat.sendMessage.mutate({ conversationId, message: "كم معدلي التراكمي؟" })` and verify it returns `{ success: true, isOfflineFallback: true, source: "academic_rules" }` within < 200ms.

4. **Invalidation Conditions**:
   - If `sendMessage` hangs longer than 2000ms.
   - If `sendMessage` returns `success: false` or throws `RUNPOD_API_URL is not configured`.
   - If TypeScript compiler reports type mismatch on `source` or `getStatus` return types.
