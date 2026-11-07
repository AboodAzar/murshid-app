## 2026-11-07T17:37:00Z
You are E2E Test Writer (E2E Test Architect) leading the E2E Testing Track.
Your working directory is: s:\murshid (1)\.agents\teamwork\teamwork_test_writer_e2e_1
Read ORIGINAL_REQUEST.md at s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read PROJECT.md at s:\murshid (1)\PROJECT.md and TEST_INFRA.md at s:\murshid (1)\TEST_INFRA.md.

Objective:
Design and implement the complete opaque-box automated E2E test suite for the Murshid Native iOS Capacitor transformation across Tiers 1-4 per TEST_INFRA.md:
1. Tier 1 - Feature Coverage (>=5 test cases per feature for 12 features, total >= 60 tests):
   - Simulated chrome removal verification
   - Native safe area layout & iPhone XS/XS Max notch/home indicator handling
   - iOS 27 Liquid Glass design tokens, blurs, and glassmorphic elements
   - Backend CORS & CSP support
   - Dual-mode Bearer token authentication
   - Native camera QR scanner access & jsQR decoding
   - Native haptic feedback and Web Audio synthesized alert tones
   - In-app configurable server host modal & live latency status badge
   - Live tRPC API client queries/mutations
   - Real student sign-in with session persistence
   - Capacitor bridge script injection and config settings
   - iOS build script and asset sync pipeline
2. Tier 2 - Boundary & Corner Cases (>=5 per feature, total >= 60 tests):
   - Empty/malformed QR codes, expired tokens, network timeouts, invalid passwords, extreme viewport dimensions, dark/light mode contrasts.
3. Tier 3 - Cross-Feature Combinations (>= 12 tests):
   - Server host reconfiguration + Bearer auth + live attendance QR scanning
   - Liquid Glass UI + real AI advisor chat streaming + latency status pill
   - Native safe-area notch navigation + modal drawers + haptic feedback
4. Tier 4 - Real-World Application Scenarios (>= 6 tests):
   - Complete student morning routine: Sign-in -> Check degree roadmap -> Scan QR attendance in Hall 41 -> Trigger haptic/audio feedback -> Query AI Advisor -> Review updated dashboard.
5. Create master test runner `tests/e2e/ios/run-ios-e2e.mjs` that executes all tiers, prints clear test results, and exits with code 0 on all pass.
6. Once the test suite is implemented and verified, publish `s:\murshid (1)\TEST_READY.md` containing the runner command, tier breakdown, and test counts.

Output:
Write test suite files into `tests/e2e/ios/`.
Publish `s:\murshid (1)\TEST_READY.md`.
Write your full report to `s:\murshid (1)\.agents\teamwork\teamwork_test_writer_e2e_1\report.md` and `handoff.md`.
Notify orchestrator via `send_message`.
