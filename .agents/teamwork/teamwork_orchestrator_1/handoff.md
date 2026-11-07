# Orchestrator Soft Handoff: Murshid Native iOS Capacitor Transformation

**Sender:** Project Orchestrator (Generation 1, `989118c4-ff40-4848-b0e9-e8e037ab7df2`)  
**Recipient:** Successor Orchestrator (Generation 2)  
**Parent Conversation ID:** `1f99cca0-06fa-4743-a301-078f16a4f40a` (Sentinel)  
**Working Directory:** `s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1`  
**Handoff Type:** Soft (Succession threshold 16/16 reached; all subagents complete)  

---

## 1. Milestone State

| # | Milestone Name | Status | Summary & Next Step |
|---|----------------|--------|---------------------|
| M0 | Survey & Planning | **DONE** | 3 Survey Explorers completed. Master `PROJECT.md` and `TEST_INFRA.md` published. 13 features mapped across 6 milestones. |
| E2E | E2E Testing Track | **DONE** | `teamwork_test_writer` authored 143 tests across Tiers 1–4 with 0 DB drift. `TEST_READY.md` published and active runner `node tests/e2e/ios/run-ios-e2e.mjs`. |
| M1 | Backend Network & Dual-Auth Readiness | **IN_REMEDIATION** (Round 2) | Worker M1 implemented CORS & Bearer auth (75 tests passed). Reviewer 1 requested changes on 2 concrete defects (`auth.me` invalid Bearer rejection and CORS strict origin matching). Round 2 Explorers produced complete drop-in fixes. Successor will dispatch Worker M1-2. |
| M2 | Native Layout, Chrome Removal & Liquid Glass | **PLANNED** | Survey E1 documented fake chrome elements (`client/public/phone.html`, `ios-app/scripts/bundle-app.mjs`), safe-area padding (`env(safe-area-inset-*)`), and iOS 27 Liquid Glass design tokens. |
| M3 | Native Hardware: Camera QR, Haptics & Audio | **PLANNED** | Survey E2 documented `getUserMedia` + `jsQR` live scanner in WKWebView, `@capacitor/haptics` Taptic Engine integration, and Web Audio API synthesized alert chimes. |
| M4 | Live API Client, Server Host Config & Features | **PLANNED** | Vanilla tRPC ApiClient with SuperJSON wire protocol, server host config modal with live latency ping to `aiChat.getStatus`, real sign-in and live endpoints integration. |
| M5 | Capacitor Sync & iOS Build Pipeline | **PLANNED** | Asset bundling (`bundle-app.mjs`), `npx cap sync ios`, Xcode permissions & ATS check in `Info.plist`. |
| M6 | Final Milestone: E2E Pass & Adversarial Hardening | **PLANNED** | Pass 100% of E2E test suite (`node tests/e2e/ios/run-ios-e2e.mjs`) across Tiers 1–4, followed by Tier 5 adversarial hardening. |

---

## 2. Active Subagents
- **None running**: All 16 subagents spawned in Generation 1 have fully completed and delivered their handoffs.

---

## 3. Pending Decisions & Technical Details

### Milestone 1 Remediation Fixes (Immediate Next Step for Successor):
Worker M1-2 must be dispatched with write ownership of:
- `server/routers/auth.ts`
- `server/routers/auth.test.ts`
- `server/_core/cors.ts`
- `server/_core/cors.test.ts`

**Fix 1 — `server/routers/auth.ts` (`auth.me`)**:
When an explicit `Authorization: Bearer <token>` header is present (non-empty):
If `verifyLocalAuthToken(token)` returns `null` or fails:
```typescript
throw new TRPCError({
  code: "UNAUTHORIZED",
  message: "Unauthorized: Invalid or expired authorization token",
});
```
*(Crucial: message MUST include "unauthorized" to satisfy `assertThrows(..., "unauthorized")` in `T1.5.5`, `T2.5.1`, `T2.5.2`, `T2.5.4`)*.
When no authorization header or cookie is passed (or bare `Bearer `), return `null` (satisfying `T2.5.3` and `T2.5.5` guest checks).

**Fix 2 — `server/routers/auth.test.ts`**:
Update lines 63–71 to assert:
```typescript
await expect(caller.me()).rejects.toThrow();
```

**Fix 3 — `server/_core/cors.ts`**:
Remove lines 24–27 (`if (process.env.NODE_ENV !== "production") return true;`).
Strict whitelist: `capacitor://localhost`, `ionic://localhost`, `localhost`, `127.0.0.1`, RFC 1918 subnets (`172.16-31.*`, `192.168.*`, `10.*`). This immediately satisfies `T2.4.1` by blocking `http://evil-attacker-site.com`.

**Fix 4 — `server/_core/cors.test.ts`**:
Update lines 55–58 to assert that `isAllowedOrigin("http://evil-attacker-site.com")` returns `false`.

---

## 4. Remaining Work & Concrete Next Steps for Successor

1. **Step 1**: Dispatch Worker M1-2 (`teamwork_worker`) to apply the drop-in snippets from `teamwork_explorer_m1_r2_1` and `teamwork_explorer_m1_r2_2`.
2. **Step 2**: Worker M1-2 executes:
   - `npx vitest run server/_core/cors.test.ts server/_core/sdk.test.ts server/routers/auth.test.ts` (All unit tests pass)
   - `node tests/e2e/ios/run-ios-e2e.mjs --tier=1` (All Feature 4 and Feature 5 tests pass)
   - `node tests/e2e/ios/run-ios-e2e.mjs --tier=2` (All Feature 4 and Feature 5 boundary tests pass)
3. **Step 3**: Dispatch Reviewers, Challengers, and Forensic Auditor for M1 Gate 2. Verify Gate PASS.
4. **Step 4**: Mark Milestone 1 DONE in `PROJECT.md` and `progress.md`.
5. **Step 5**: Proceed to Milestone 2 (Native Layout, Chrome Removal & iOS 27 Liquid Glass UI) and subsequent milestones per `PROJECT.md`.

---

## 5. Key Artifacts
- `s:\murshid (1)\PROJECT.md` — Master Architecture, Feature Inventory, Milestones, Code Layout
- `s:\murshid (1)\TEST_INFRA.md` — E2E Test Suite Specification
- `s:\murshid (1)\TEST_READY.md` — Active Test Suite Runner and Coverage Declaration
- `s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md` — Verbatim User Requirements
- `s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1\BRIEFING.md` — Persistent Briefing
- `s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1\progress.md` — Progress Heartbeat
- `s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1\GATE_STATUS.md` — Gate Verdict Log
- `s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_r2_1\handoff.md` — Auth Rejection Fix Specification
- `s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_r2_2\handoff.md` — CORS Strictness Fix Specification
- `s:\murshid (1)\.agents\teamwork\teamwork_explorer_m1_r2_3\handoff.md` — E2E Regression Guard Analysis
