# Dispatch Log — Generation 2 Successor

## 2026-11-07T18:14:05Z

You are the Generation 2 Project Successor leading the Murshid Native iOS Capacitor Transformation.
Your working directory is: s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1_gen2
Read handoff.md at s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1\handoff.md, BRIEFING.md at s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1\BRIEFING.md, ORIGINAL_REQUEST.md at s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md, DISPATCH.md at s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1\DISPATCH.md, and progress.md at s:\murshid (1)\.agents\teamwork\teamwork_orchestrator_1\progress.md for complete state.
Your parent is 1f99cca0-06fa-4743-a301-078f16a4f40a (Sentinel) — use this ID for all escalation and status reporting (send_message).

Core Mission & Next Steps:
1. Apply the drop-in remediations for Milestone 1:
   - `server/routers/auth.ts`: in `auth.me`, when `Authorization: Bearer <token>` is present and invalid/expired/tampered, throw `new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized: Invalid or expired authorization token" })`. When absent/guest, return null.
   - `server/routers/auth.test.ts`: update lines 63-71 to expect `rejects.toThrow("Unauthorized")`.
   - `server/_core/cors.ts`: remove lines 24-27 (`if (process.env.NODE_ENV !== "production") return true;`).
   - `server/_core/cors.test.ts`: update lines 55-58 to assert rejection of untrusted domains.
2. Run tests to verify M1 PASS:
   - `npx vitest run server/_core/cors.test.ts server/_core/sdk.test.ts server/routers/auth.test.ts`
   - `npm run check`
   - `node tests/e2e/ios/run-ios-e2e.mjs --tier=1` (Features 4 & 5 pass 10/10)
   - `node tests/e2e/ios/run-ios-e2e.mjs --tier=2` (Features 4 & 5 pass 10/10)
3. Execute Milestone 2 (Native Layout, Chrome Removal & Liquid Glass):
   - Remove fake status bar (9:41, fake battery, fake wifi) and fake dynamic island from `client/public/phone.html`, `ios-app/scripts/bundle-app.mjs`, and `ios-app/www/index.html`.
   - Implement native safe-area layout (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) for iPhone XS / XS Max.
   - Implement "iOS 27 Liquid Glass" design tokens, multi-layer backdrop blurs, specular refractive edges, and floating translucent cards.
4. Execute Milestone 3 (Native Hardware: Camera QR, Haptics & Audio):
   - Add `<script src="capacitor.js"></script>` to bundle.
   - Implement live camera feed + `jsQR` canvas decoder in `#phone-scanner-modal`.
   - Implement unified `NativeFeedback` engine calling `@capacitor/haptics` and Web Audio API synthesized alert chimes.
5. Execute Milestone 4 (Live API Client & Server Host Config):
   - Implement vanilla tRPC `ApiClient` supporting SuperJSON wire protocol and Bearer token auth.
   - Implement server host config modal with persistent header status pill and live latency ping to `aiChat.getStatus`.
   - Wire live student dashboard, courses, schedule, assignments, AI advisor chat, and attendance mutations.
6. Execute Milestone 5 (Capacitor Sync & Xcode Project Verification):
   - Run `node ios-app/scripts/bundle-app.mjs` and `npx cap sync ios`.
   - Verify `ios/App/App/public` web assets and Xcode project configuration.
7. Execute Milestone 6 (Final Milestone: E2E Suite Pass & Adversarial Hardening):
   - Run `node tests/e2e/ios/run-ios-e2e.mjs` and verify 100% pass rate across Tiers 1-4.
   - Run adversarial hardening checks.
8. Deliver final completion report to parent Sentinel (1f99cca0-06fa-4743-a301-078f16a4f40a) via send_message.
