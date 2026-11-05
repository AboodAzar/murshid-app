# Empirical Challenge Report & Handoff: Milestone 5 Tier 5 Adversarial Coverage Hardening

## 1. Observation

### A. Empirical Execution of Tier 5 Adversarial Test Suite
- Command: `node tests/e2e/tier5-adversarial.mjs`
- Test Runner Output:
```
============================================================
  RUNNING TIER 5: ADVERSARIAL COVERAGE HARDENING (29 TESTS)
============================================================

--- Category 1: TRPCError Code Preservation & Bug Verification ---
  [FAIL] T5.1.1: aiChat.getMessages with non-existent conversation returns NOT_FOUND (not INTERNAL_SERVER_ERROR) (18ms) -> Expected tRPC error code "NOT_FOUND", but received "INTERNAL_SERVER_ERROR" (HTTP 500, message: "INTERNAL_SERVER_ERROR")
  [FAIL] T5.1.2: aiChat.rateMessage with non-existent message returns NOT_FOUND (not INTERNAL_SERVER_ERROR) (16ms) -> Expected tRPC error code "NOT_FOUND", but received "INTERNAL_SERVER_ERROR" (HTTP 500, message: "INTERNAL_SERVER_ERROR")
  [FAIL] T5.1.3: aiChat.deleteConversation with non-existent conversation returns NOT_FOUND (not INTERNAL_SERVER_ERROR) (17ms) -> Expected tRPC error code "NOT_FOUND", but received "INTERNAL_SERVER_ERROR" (HTTP 500, message: "INTERNAL_SERVER_ERROR")
  [FAIL] T5.1.4: aiChat.sendMessage with non-existent conversation must reject with NOT_FOUND (not swallow error) (15ms) -> Expected rejection with error code "NOT_FOUND", but call SUCCEEDED with result: {"success":false,"response":"عذراً، حدث خطأ أثناء معالجة المحادثة. يرجى المحاولة مرة أخرى.","isOfflineFallback":true,"source":"local_advisor"}
  [FAIL] T5.1.5: aiChat.rateMessage IDOR check: student cannot rate messages in another student's conversation (232ms) -> Expected rejection with error code "NOT_FOUND", but call SUCCEEDED with result: {"success":true}
  [FAIL] T5.1.6: documents.delete with non-existent ID throws NOT_FOUND or FORBIDDEN (not INTERNAL_SERVER_ERROR) (16ms) -> Expected tRPC error code "NOT_FOUND", but received "INTERNAL_SERVER_ERROR" (HTTP 500, message: "INTERNAL_SERVER_ERROR")
  [FAIL] T5.1.7: documents.retryDocumentIndexing with non-existent ID throws NOT_FOUND (not INTERNAL_SERVER_ERROR) (15ms) -> Expected tRPC error code "NOT_FOUND", but received "INTERNAL_SERVER_ERROR" (HTTP 500, message: "INTERNAL_SERVER_ERROR")

--- Category 2: Boundary Value Analysis & Schema Guards ---
  [PASS] T5.2.1: courses.list with page: 0 rejected by Zod with BAD_REQUEST (14ms)
  [PASS] T5.2.2: courses.list with page: -1 rejected by Zod with BAD_REQUEST (16ms)
  [PASS] T5.2.3: courses.list with limit: 0 rejected by Zod with BAD_REQUEST (16ms)
  [PASS] T5.2.4: courses.list with limit: 500 (> 100 max) rejected by Zod with BAD_REQUEST (14ms)
  [PASS] T5.2.5: faqs.list with page: 0 rejected by Zod with BAD_REQUEST (16ms)
  [PASS] T5.2.6: announcements.create with 50KB payload handled safely (65ms)
  [PASS] T5.2.7: advisor.scheduleAppointment with durationMinutes: 1 (< 5 min) rejected (12ms)
  [PASS] T5.2.8: advisor.scheduleAppointment with durationMinutes: 500 (> 240 max) rejected (15ms)

--- Category 3: Course Enrollment Prerequisite & Concurrency Boundaries ---
  [PASS] T5.3.1: courses.enrollCourse with missing intermediate prerequisite rejected (18ms)
  [PASS] T5.3.2: courses.enrollCourse for already completed course rejected with BAD_REQUEST (14ms)
  [PASS] T5.3.3: courses.enrollCourse for already in-progress course rejected with BAD_REQUEST (17ms)
  [PASS] T5.3.4: courses.enrollCourse for non-existent course ID (999999) rejected with NOT_FOUND (14ms)
  [PASS] T5.3.5: courses.enrollCourse sequential double-enrollment idempotency (34ms)

--- Category 4: RBAC & Tenant Scoping Boundaries ---
  [PASS] T5.4.1: Student accessing advisor route (advisor.getAssignedStudents) rejected with FORBIDDEN (2ms)
  [PASS] T5.4.2: Student accessing admin route (admin.dashboard) rejected with FORBIDDEN (10ms)
  [PASS] T5.4.3: Advisor accessing admin route (admin.assignAdvisor) rejected with FORBIDDEN (16ms)
  [PASS] T5.4.4: Advisor 1 cannot create academic alert for Advisor 2's student (Lina 210028) (16ms)
  [PASS] T5.4.5: Advisor 1 cannot add note for Advisor 2's student (Lina 210028) (16ms)
  [PASS] T5.4.6: Advisor 1 cannot schedule appointment for Advisor 2's student (Lina 210028) (17ms)
  [PASS] T5.4.7: Advisor resolving non-existent alert ID rejected with NOT_FOUND (14ms)
  [PASS] T5.4.8: Admin self-deletion rejected with BAD_REQUEST (17ms)
  [PASS] T5.4.9: Admin assigning non-existent advisor ID rejected with NOT_FOUND (15ms)

--- Category 5: Authentication Token Security & Concurrency Burst ---
  [PASS] T5.5.1: Session cookie with tampered JWT signature rejected with UNAUTHORIZED (12ms)
  [PASS] T5.5.2: Session cookie with invalid payload type rejected with UNAUTHORIZED (16ms)
  [PASS] T5.5.3: Session cookie with non-existent userId: 999999 rejected with UNAUTHORIZED (16ms)
  [PASS] T5.5.4: SQL injection payload in login email rejected cleanly with UNAUTHORIZED (14ms)
  [PASS] T5.5.5: High concurrency burst (30 simultaneous requests across 5 endpoints) (317ms)

============================================================
  TIER 5 EXECUTION SUMMARY
============================================================
  * Total Tests Run : 34
  * Passed Tests   : 27
  * Failed Tests   : 7
  * DB State Drift : 0 (ZERO DRIFT)
============================================================
```

### B. Baseline Tiers 1-4 Regression Verification
- Command: `npm run test:e2e`
- Result: 87/87 tests passed across all 4 tiers in 5435ms with 0 database state drift.

### C. White-Box Source Code Audit Findings

#### 1. `server/routers/aiChat.ts`
- **Line 97-109 (`getMessages`)**:
```typescript
97:         if (conv.length === 0) {
98:           throw new TRPCError({ code: "NOT_FOUND" });
99:         }
...
106:       } catch (error) {
107:         console.error("[AI Chat] Failed to get messages:", error);
108:         throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
109:       }
```
*Issue*: Lacks `if (error instanceof TRPCError) throw error;`. Thrown `NOT_FOUND` (404) is caught and overwritten with `INTERNAL_SERVER_ERROR` (500).

- **Line 143-145 and Line 291-299 (`sendMessage`)**:
```typescript
143:         if (conv.length === 0) {
144:           throw new TRPCError({ code: "NOT_FOUND" });
145:         }
...
291:       } catch (error: any) {
292:         console.error("[AI Chat] Failed to send message:", error);
293:         return {
294:           success: false,
295:           response: "عذراً، حدث خطأ أثناء معالجة المحادثة. يرجى المحاولة مرة أخرى.",
296:           isOfflineFallback: true,
297:           source: "local_advisor" as const,
298:         };
299:       }
```
*Issue*: When a non-existent `conversationId` or foreign student's conversation is targeted, line 144 throws `NOT_FOUND`, but the outer catch block catches all errors and returns HTTP 200 with `{ success: false }`, completely swallowing the error.

- **Line 318-332 and Line 375-378 (`rateMessage`)**:
```typescript
318:         // Verify the message exists and belongs to the user's conversation
319:         const [msg] = await db
320:           .select()
321:           .from(chatMessages)
322:           .where(eq(chatMessages.id, input.messageId))
323:           .limit(1);
324: 
325:         if (!msg) throw new TRPCError({ code: "NOT_FOUND" });
...
375:       } catch (error) {
376:         console.error("[AI Chat] Failed to rate message:", error);
377:         throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
378:       }
```
*Issue 1 (IDOR)*: Query does NOT verify that the message belongs to `ctx.user.id`'s conversation. Any student can rate messages belonging to other students.
*Issue 2 (Error rewrapping)*: If `!msg`, throws `NOT_FOUND`, which line 375 catches and rethrows as `INTERNAL_SERVER_ERROR` (500).

- **Line 407-425 (`deleteConversation`)**:
```typescript
407:         if (conv.length === 0) {
408:           throw new TRPCError({ code: "NOT_FOUND" });
409:         }
...
422:       } catch (error) {
423:         console.error("[AI Chat] Failed to delete conversation:", error);
424:         throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
425:       }
```
*Issue*: Lacks `if (error instanceof TRPCError) throw error;`. Thrown `NOT_FOUND` is converted to `INTERNAL_SERVER_ERROR` (500).

#### 2. `server/routers/documents.ts`
- **Line 202-212 (`delete`)**:
```typescript
202:         if (!doc[0] || (!isAdmin && doc[0].uploadedBy !== ctx.user.id)) {
203:           throw new TRPCError({ code: "FORBIDDEN" });
204:         }
...
209:       } catch (error) {
210:         console.error("[Documents] Failed to delete document:", error);
211:         throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
212:       }
```
*Issue*: Missing `if (error instanceof TRPCError) throw error;`. Throws `INTERNAL_SERVER_ERROR` (500) instead of `NOT_FOUND` / `FORBIDDEN`.

- **Line 485-535 (`retryDocumentIndexing`)**:
```typescript
485:         if (!doc[0]) throw new TRPCError({ code: "NOT_FOUND" });
...
532:       } catch (error) {
533:         console.error("[Documents] Failed to retry indexing:", error);
534:         throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
535:       }
```
*Issue*: Missing `if (error instanceof TRPCError) throw error;`. Converts `NOT_FOUND` to `INTERNAL_SERVER_ERROR` (500).

#### 3. `server/routers/preferences.ts`
- **Line 27-44 (`getNotificationPreferences`)**:
```typescript
27:       if (!user[0]) {
28:         throw new TRPCError({ code: "NOT_FOUND" });
29:       }
...
39:     } catch (error) {
40:       console.error("[Preferences] Failed to get notification preferences:", error);
41:       throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
42:     }
```
*Issue*: Missing `if (error instanceof TRPCError) throw error;`. Converts `NOT_FOUND` to `INTERNAL_SERVER_ERROR` (500).

#### 4. `server/routers/courses.ts`
- **Line 249-313 (`enrollCourse`)**:
In `drizzle/schema.ts`, `studentCourses` does not have a unique constraint on `(studentId, courseId)`. While `courses.enrollCourse` performs an in-memory check against `studentCourses`, two parallel concurrent requests can pass the check concurrently (TOCTOU).

---

## 2. Logic Chain

1. *Observation*: Calling `aiChat.getMessages(999999)`, `aiChat.rateMessage({ messageId: 999999 })`, or `aiChat.deleteConversation(999999)` returns HTTP 500 `INTERNAL_SERVER_ERROR`.
2. *Inference*: The procedures explicitly instantiate `new TRPCError({ code: "NOT_FOUND" })`, but the enclosing `try/catch` block unconditionally catches all errors and rethrows `new TRPCError({ code: "INTERNAL_SERVER_ERROR" })` because `if (error instanceof TRPCError) throw error;` is missing.
3. *Observation*: Calling `aiChat.sendMessage({ conversationId: 999999, message: "test" })` returns HTTP 200 `{ success: false, response: "عذراً...", isOfflineFallback: true }`.
4. *Inference*: Line 144 throws `NOT_FOUND` when the conversation is not found, but outer catch block at line 291 catches `error: any` and returns a fallback JSON response instead of re-throwing `TRPCError`.
5. *Observation*: Student Khaled (id: 210027) successfully rates message 1 (which belongs to user 1's conversation) without error (`{"success": true}`).
6. *Inference*: `aiChat.rateMessage` selects `chatMessages` by ID without joining `aiConversations` to check `studentId === ctx.user.id`, violating authorization boundaries (IDOR).
7. *Observation*: `documents.delete(999999)` and `documents.retryDocumentIndexing(999999)` return HTTP 500 instead of 404/403.
8. *Inference*: Identical TRPCError re-wrapping pattern present in `documents.ts`.
9. *Observation*: 27 out of 34 adversarial tests in `tests/e2e/tier5-adversarial.mjs` pass cleanly (pagination bounds, prerequisite enforcements, RBAC isolation, auth signature tamper checks, SQL injection resistance, and 30-request burst load).
10. *Inference*: The core application logic, authentication security, role separation, and prerequisite validations are solid, but error status code propagation and IDOR checking in `aiChat.ts` and `documents.ts` require source-level fixes.

---

## 3. Caveats
- External Runpod LLM server is offline as per project requirements; all tests verify deterministic local fallback operation.
- In accordance with Challenger role constraints ("Review-only — do NOT modify implementation code"), no production source files in `server/` were altered during this turn.
- The 7 failing tests in `tests/e2e/tier5-adversarial.mjs` are intentional bug-discovery assertions designed to guide the Worker agent's implementation fixes.

---

## 4. Conclusion & Actionable Fixes for Worker Agent

**Overall Risk Assessment**: HIGH (IDOR flaw in `rateMessage` and error masking across AI chat and documents routers).

### Prescribed Source Fixes for Worker Agent:

#### Fix 1: `server/routers/aiChat.ts`
1. **Line 106 (`getMessages`)**: Add rethrow guard:
   ```typescript
   } catch (error) {
     if (error instanceof TRPCError) throw error;
     console.error("[AI Chat] Failed to get messages:", error);
     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
   }
   ```
2. **Line 291 (`sendMessage`)**: Add rethrow guard:
   ```typescript
   } catch (error: any) {
     if (error instanceof TRPCError) throw error;
     console.error("[AI Chat] Failed to send message:", error);
     return {
       success: false,
       response: "عذراً، حدث خطأ أثناء معالجة المحادثة. يرجى المحاولة مرة أخرى.",
       isOfflineFallback: true,
       source: "local_advisor" as const,
     };
   }
   ```
3. **Line 318-332 (`rateMessage`)**: Fix IDOR ownership verification:
   ```typescript
   // Verify the message exists and belongs to the user's conversation
   const [msg] = await db
     .select({
       id: chatMessages.id,
       conversationId: chatMessages.conversationId,
       role: chatMessages.role,
       content: chatMessages.content,
       studentId: aiConversations.studentId,
     })
     .from(chatMessages)
     .innerJoin(aiConversations, eq(chatMessages.conversationId, aiConversations.id))
     .where(
       and(
         eq(chatMessages.id, input.messageId),
         eq(aiConversations.studentId, ctx.user.id)
       )
     )
     .limit(1);

   if (!msg) throw new TRPCError({ code: "NOT_FOUND" });
   ```
4. **Line 375 (`rateMessage`)**: Add rethrow guard:
   ```typescript
   } catch (error) {
     if (error instanceof TRPCError) throw error;
     console.error("[AI Chat] Failed to rate message:", error);
     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
   }
   ```
5. **Line 422 (`deleteConversation`)**: Add rethrow guard:
   ```typescript
   } catch (error) {
     if (error instanceof TRPCError) throw error;
     console.error("[AI Chat] Failed to delete conversation:", error);
     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
   }
   ```

#### Fix 2: `server/routers/documents.ts`
1. **Line 209 (`delete`)**:
   ```typescript
   } catch (error) {
     if (error instanceof TRPCError) throw error;
     console.error("[Documents] Failed to delete document:", error);
     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
   }
   ```
2. **Line 532 (`retryDocumentIndexing`)**:
   ```typescript
   } catch (error) {
     if (error instanceof TRPCError) throw error;
     console.error("[Documents] Failed to retry indexing:", error);
     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
   }
   ```

#### Fix 3: `server/routers/preferences.ts`
1. **Line 39 (`getNotificationPreferences`)**:
   ```typescript
   } catch (error) {
     if (error instanceof TRPCError) throw error;
     console.error("[Preferences] Failed to get notification preferences:", error);
     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
   }
   ```

#### Fix 4: `tests/e2e/tier2-boundaries.mjs`
Update `T2.7.2`, `T2.7.3`, `T2.7.6` to assert exact error code `"NOT_FOUND"` instead of empty string `""`.

---

## 5. Verification Method

To verify after Worker applies source fixes:
```bash
# 1. Run Tier 5 adversarial test suite (must pass 34/34 with exit code 0)
node tests/e2e/tier5-adversarial.mjs

# 2. Run master 4-tier E2E suite (must pass 87/87 with exit code 0)
npm run test:e2e
```

Invalidation conditions:
- Any test failure in `tests/e2e/tier5-adversarial.mjs`.
- Any `INTERNAL_SERVER_ERROR` returned when querying non-existent resources.
- Successful rating of another student's conversation message.
- Any row count drift in MariaDB tables after test execution.
