# Test Readiness Declaration: Murshid Native iOS Capacitor Transformation

## Overview
The automated opaque-box E2E test suite for the Murshid Native iOS Capacitor Transformation is **implemented, verified, and ready**. The test suite spans Tiers 1 through 4, providing requirement-driven opaque-box verification for all 12 inventoried features defined in `PROJECT.md` and `TEST_INFRA.md` derived from `ORIGINAL_REQUEST.md` (R1–R6).

- **Master Test Runner Command**: `node tests/e2e/ios/run-ios-e2e.mjs`
- **Total Test Cases**: 143 tests across 4 tiers (exceeding minimum target of 138)
- **Current Baseline Execution**: 101 Passed, 42 Failed (pending implementation milestones), **0 Database State Drift** across all 16 monitored tables.

---

## How to Run the Tests

```powershell
# Run the complete iOS E2E test suite (Tiers 1 to 4)
node tests/e2e/ios/run-ios-e2e.mjs

# Run specific tiers individually
node tests/e2e/ios/run-ios-e2e.mjs --tier=1   # Tier 1: Feature Coverage (60 tests)
node tests/e2e/ios/run-ios-e2e.mjs --tier=2   # Tier 2: Boundary & Corner Cases (60 tests)
node tests/e2e/ios/run-ios-e2e.mjs --tier=3   # Tier 3: Cross-Feature Integration (15 tests)
node tests/e2e/ios/run-ios-e2e.mjs --tier=4   # Tier 4: Real-World Application Scenarios (8 tests)
```

---

## Test Architecture & Directory Layout

| Path | Purpose | Test Count |
|------|---------|:----------:|
| `tests/e2e/ios/helpers/test-client.mjs` | Test harness, assertion helpers, dual-mode auth session, QR generator, DB cleanup hooks | Harness |
| `tests/e2e/ios/tier1-feature-coverage.test.mjs` | Tier 1: Comprehensive feature coverage (≥5 tests per feature for 12 features) | 60 |
| `tests/e2e/ios/tier2-boundary-corner.test.mjs` | Tier 2: Boundary value analysis, corner cases, error paths | 60 |
| `tests/e2e/ios/tier3-cross-feature.test.mjs` | Tier 3: Pairwise cross-feature interactions and integration flows | 15 |
| `tests/e2e/ios/tier4-application-scenarios.test.mjs` | Tier 4: Realistic multi-step student user journeys and workflows | 8 |
| `tests/e2e/ios/run-ios-e2e.mjs` | Master test runner with pre/post DB snapshot & zero drift verification | Master Runner |
| **Total** | **Comprehensive Test Suite** | **143 Tests** |

---

## Feature Coverage Matrix & Baseline Results

| # | Feature Name | Source (Req) | Milestone | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Baseline Status |
|---|--------------|-------------|:---------:|:------:|:------:|:------:|:------:|:---------------:|
| 1 | Simulated Chrome Removal | R1 | M2 | 5 tests | 5 tests | ✓ | ✓ | 2 Failures (Fake 9:41, fake island in HTML) |
| 2 | True Safe-Area Layout (iPhone XS/XS Max) | R1 | M2 | 5 tests | 5 tests | ✓ | ✓ | 1 Failure (Double status bar calculation) |
| 3 | iOS 27 Liquid Glass Design System | R5 | M2 | 5 tests | 5 tests | ✓ | ✓ | 100% Passed (Tokens, blur, OLED gradients) |
| 4 | Backend CORS & CSP Support | R4 | M1 | 5 tests | 5 tests | ✓ | — | 8 Failures (Express CORS middleware missing) |
| 5 | Dual-Mode Bearer Token Auth | R4 | M1 | 5 tests | 5 tests | ✓ | — | 10 Failures (Bearer token in login/me missing) |
| 6 | Native Camera QR Scanner & jsQR | R2 | M3 | 5 tests | 5 tests | ✓ | ✓ | 6 Failures (getUserMedia & jsQR DOM missing) |
| 7 | Native Haptic & Web Audio Feedback | R3 | M3 | 5 tests | 5 tests | ✓ | ✓ | 7 Failures (Capacitor haptics & audio missing) |
| 8 | Configurable Server Host & Network Pill | R4 | M4 | 5 tests | 5 tests | ✓ | ✓ | 1 Failure (Modal UI trigger missing) |
| 9 | Live tRPC Client Queries & Mutations | R4 | M4 | 5 tests | 5 tests | ✓ | ✓ | 100% Passed (SuperJSON, schedule, QR verify) |
| 10 | Real Student Sign-In & Persistence | R4 | M4 | 5 tests | 5 tests | ✓ | ✓ | 90% Passed (Auth valid, storage logic pending) |
| 11 | Capacitor Config & Bridge Injection | R6 | M5 | 5 tests | 5 tests | ✓ | — | 3 Failures (capacitor.js script, contentInset) |
| 12 | Updated iOS Build & Asset Sync | R6 | M5 | 5 tests | 5 tests | ✓ | — | 100% Passed (bundle-app, plist, xcodeproj) |

---

## Baseline Execution Summary

```
================================================================================
  MASTER TEST EXECUTION SUMMARY (MURSHID NATIVE IOS CAPACITOR)
================================================================================
  * Tier 1: Feature Coverage (Features 1 to 12)           : 34/60 Passed [FAILED]
  * Tier 2: Boundary & Corner Cases (Features 1 to 12)    : 45/60 Passed [FAILED]
  * Tier 3: Pairwise Cross-Feature Integration (15 tests) : 14/15 Passed [FAILED]
  * Tier 4: Real-World Application Scenarios (8 tests)    :  8/8  Passed [PASSED]
--------------------------------------------------------------------------------
  GRAND TOTAL: 101 Passed, 42 Failed out of 143 total tests (71451ms)
================================================================================

================================================================================
  DATABASE STATE DRIFT AUDIT (Zero Drift Verification)
================================================================================
  [SUCCESS] 0 Database State Drift verified across all 16 monitored tables!
================================================================================
```

---

## Discovered Implementation Gaps & Escalation

The 42 baseline test failures are verified **true implementation gaps** currently pending execution in Milestones M1 through M5. The test suite serves as the objective verification gate for each milestone:

1. **Milestone 1 Gaps (Backend CORS & Dual-Mode Bearer Auth)**:
   - `server/_core/index.ts`: Missing `app.use(cors({ origin: ['capacitor://localhost', 'http://172.20.10.*'], credentials: true }))` and OPTIONS preflight handling.
   - `server/_core/sdk.ts`: `extractSessionCookie` only inspects `req.headers.cookie`; must also inspect `req.headers.authorization` for `Bearer <token>`.
   - `server/routers/auth.ts`: `login` mutation generates `token` but omits it from return payload; `auth.me` must validate Bearer tokens.
2. **Milestone 2 Gaps (Simulated Chrome Removal & Safe Areas)**:
   - `client/public/phone.html` / `ios-app/www/index.html`: Contains static `9:41`, `#dynamic-island`, and fake battery.
   - `ios-app/scripts/bundle-app.mjs`: Safe area override calculates `#status-bar` as `calc(44px + env(safe-area-inset-top))`, creating double status bar (88px) on iPhone XS.
3. **Milestone 3 Gaps (Native Camera QR, Haptics & Audio)**:
   - `ios-app/www/index.html`: Scanner modal is a static placeholder with emoji `📷`; needs `<video>` viewfinder and `jsQR` decoder.
   - Zero references to `Capacitor.Plugins.Haptics` or Web Audio `AudioContext` for alerts.
4. **Milestone 4 Gaps (Server Host Modal Trigger & Full API Integration)**:
   - `#ios-server-modal` exists in HTML, but lacks an accessible trigger button/pill in the UI header.
5. **Milestone 5 Gaps (Capacitor Config & Bridge Script)**:
   - `index.html` lacks `<script src="capacitor.js"></script>`.
   - `capacitor.config.json` has `ios.contentInset: "always"` (must be `"never"`).
   - `capacitor.config.json` has `ios.scheme: "Oliver ZUJ"` with spaces (must be RFC compliant, e.g. `"oliverzuj"` or `"capacitor"`).
