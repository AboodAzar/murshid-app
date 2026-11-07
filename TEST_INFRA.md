# E2E Test Infra: Murshid Native iOS Capacitor App

## Test Philosophy
- Opaque-box, requirement-driven derived from `ORIGINAL_REQUEST.md` (R1-R6).
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.
- Progressive testability: Tier 1 gives pass/fail signals early; Tier 2 validates edge/boundary conditions; Tier 3 tests feature interactions; Tier 4 runs complete realistic student workflows; Tier 5 hardens coverage adversarially.

## Feature Inventory & Test Mapping
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Simulated Chrome Removal | R1 (Status bar, battery, wifi, island) | 5 | 5 | ✓ |
| 2 | True Safe-Area Layout | R1 (Top/bottom safe insets, notch, home bar) | 5 | 5 | ✓ |
| 3 | iOS 27 Liquid Glass Design System | R5 (Glassmorphic cards, blurs, borders) | 5 | 5 | ✓ |
| 4 | Backend CORS & CSP Support | R4 (CORS headers, OPTIONS preflight) | 5 | 5 | ✓ |
| 5 | Dual Bearer Token Auth | R4 (JWT in login, Bearer in sdk/auth.me) | 5 | 5 | ✓ |
| 6 | Native Camera Access & QR Scanner | R2 (getUserMedia, jsQR decoding, reticle) | 5 | 5 | ✓ |
| 7 | Native Haptic & Audio Feedback | R3 (Taptic Engine, Web Audio synthesizer) | 5 | 5 | ✓ |
| 8 | Configurable Server Host & Network Pill | R4 (Modal, localStorage, status pill) | 5 | 5 | ✓ |
| 9 | Live tRPC API Client | R4 (Queries, mutations, SuperJSON wire) | 5 | 5 | ✓ |
| 10 | Real User Sign-In & Sessions | R4 (MariaDB auth, session credentials) | 5 | 5 | ✓ |
| 11 | Capacitor Config & Script Bridge | R6 (capacitor.js script, config settings) | 5 | 5 | ✓ |
| 12 | Updated iOS Build & Asset Sync | R6 (Bundle script, sync to public dir) | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Automated Node.js test harness `tests/e2e/ios/run-ios-e2e.mjs`.
- Invocable via: `node tests/e2e/ios/run-ios-e2e.mjs` (exits 0 on all tests passing, >0 on failure).
- Directory layout:
  - `tests/e2e/ios/tier1-feature-coverage.test.mjs`
  - `tests/e2e/ios/tier2-boundary-corner.test.mjs`
  - `tests/e2e/ios/tier3-cross-feature.test.mjs`
  - `tests/e2e/ios/tier4-application-scenarios.test.mjs`
  - `tests/e2e/ios/tier5-adversarial-hardening.test.mjs`
  - `tests/e2e/ios/helpers/test-client.mjs`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Student Morning Check-in & Live QR Attendance | Server Host Config + Live Sign-In + Camera QR Scanner + Haptics/Audio + Attendance Mutation | High |
| 2 | Live Academic Advisor Inquiry on iOS | Liquid Glass UI + Bearer Auth + Live tRPC + aiChat.sendMessage + Latency Status Pill | High |
| 3 | Degree Roadmap & Assignments Review | True Safe-Area Layout + Real MariaDB Queries + Liquid Glass Cards + Bearer Auth | Medium |
| 4 | Offline / Hotspot IP Reconfiguration | In-app Server Config Modal + Health Ping to aiChat.getStatus + LocalStorage Sync + Reconnection | High |
| 5 | Edge-to-Edge iPhone XS Notch & Home Bar Navigation | Simulated Chrome Elimination + Dynamic Safe Area Padding + Tab Bar Nav + Modal Drawer | Medium |

## Coverage Thresholds
- N = 12 inventoried features.
- Tier 1: ≥ 60 test cases (5 × 12 features).
- Tier 2: ≥ 60 test cases (5 × 12 boundary/corner cases).
- Tier 3: ≥ 12 test cases (cross-feature pairwise combinations).
- Tier 4: ≥ 6 realistic end-to-end application scenarios.
- Tier 5: Adversarial edge cases and stress tests.
- Total minimum: ≥ 138 test cases.
