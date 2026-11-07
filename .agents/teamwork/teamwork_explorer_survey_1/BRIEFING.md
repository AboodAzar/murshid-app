# BRIEFING — 2026-11-07T17:31:00Z

## Mission
Survey Explorer 1 (UI and Chrome Specialist): Survey `ios-app` frontend codebase for simulated chrome removal, native safe area layout, iOS 27 Liquid Glass UI system, and app navigation/screens.

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: UI and Chrome Specialist, Survey Explorer
- Working directory: s:\murshid (1)\.agents\teamwork\teamwork_explorer_survey_1
- Original parent: 989118c4-ff40-4848-b0e9-e8e037ab7df2
- Milestone: M1 - Comprehensive Codebase Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement / modify source code directly
- Focus on UI, simulated chrome removal, native safe areas, and iOS 27 Liquid Glass aesthetic
- Report output to report.md and handoff.md in working directory
- Communicate via send_message to parent (989118c4-ff40-4848-b0e9-e8e037ab7df2)

## Current Parent
- Conversation ID: 989118c4-ff40-4848-b0e9-e8e037ab7df2
- Updated: 2026-11-07T17:31:00Z

## Investigation State
- **Explored paths**: `ios-app/`, `client/public/phone.html`, `ios-app/scripts/bundle-app.mjs`, `ios-app/www/index.html`, `ios-app/capacitor.config.json`, `ios-app/ios/App/App/Info.plist`, `.github/workflows/build-ios.yml`.
- **Key findings**:
  1. Fake status bar (9:41, fake battery, fake Wi-Fi, fake dynamic island overlay) is isolated in `client/public/phone.html` lines 177-190 and `index.html` lines 246-259.
  2. On iPhone XS/XS Max, `env(safe-area-inset-top)` is 44px; current CSS doubles the status bar height to 88px and renders a fake Dynamic Island pill under a physical notch.
  3. Bottom nav height is hardcoded to `h-16` (64px), squishing buttons to 30px when `safe-area-inset-bottom` (34px) is applied. Modals collide with the Home Indicator.
  4. Capacitor bridge `<script src="capacitor.js"></script>` is missing from the bundle HTML.
  5. Fully cataloged all 8 primary screens and 12 modals.
  6. Designed the complete "iOS 27 Liquid Glass" design tokens and component specification.
- **Unexplored areas**: Native camera QR scanning and audio/haptics implementation (delegated to Explorer 2).

## Key Decisions Made
- Recommending removal of `#status-bar` and replacing with `#native-app-header` respecting `env(safe-area-inset-top)`.
- Recommending setting `contentInset: "never"` in `capacitor.config.json` and adjusting tab bar height to `calc(58px + env(safe-area-inset-bottom))`.
- Detailed full design system in `report.md` and 5-component handoff in `handoff.md`.

## Artifact Index
- DISPATCH.md — Incoming messages
- BRIEFING.md — Persistent memory index
- progress.md — Liveness heartbeat
- report.md — Full survey report (detailed findings and code snippets)
- handoff.md — 5-component handoff report for parent orchestrator
