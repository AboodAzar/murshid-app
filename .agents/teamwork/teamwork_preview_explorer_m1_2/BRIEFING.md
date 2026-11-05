# BRIEFING — 2026-10-27T11:26:00Z

## Mission
Design frontend client changes for AIChatPage.tsx (dynamic status indicator, offline banner, smooth fallback handling, and message source indicators) with full RTL/LTR responsiveness.

## 🔒 My Identity
- Archetype: explorer
- Roles: explorer, synthesizer
- Working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_2\
- Original parent: bd241cda-c8ae-4f16-b4be-daab58196b4d
- Milestone: Milestone 1 (Frontend AI Chat UI & Offline Banner)

## 🔒 Key Constraints
- Read-only investigation — do NOT directly edit project source files (deliver blueprints and handoff in working directory)
- Dynamic AI status indicator via trpc.aiChat.getStatus
- Informative "Local Fallback / Mock Mode" banner
- Smooth offline sending/receiving and message source indication
- Responsive styling & Arabic RTL / English LTR compatibility
- Deliver 5-component handoff report to handoff.md
- Report completion to caller bd241cda-c8ae-4f16-b4be-daab58196b4d via send_message

## Current Parent
- Conversation ID: bd241cda-c8ae-4f16-b4be-daab58196b4d
- Updated: 2026-10-27T11:26:00Z

## Investigation State
- **Explored paths**: .agents/teamwork/ORIGINAL_REQUEST.md, PROJECT.md, DISPATCH.md, client/src/pages/AIChatPage.tsx, server/routers/aiChat.ts, drizzle/schema.ts, client/src/locales/en/common.json, client/src/locales/ar/common.json, client/src/contexts/I18nContext.tsx
- **Key findings**:
  1. Static "AI Online" badge is located at AIChatPage.tsx:201-204 and can be replaced with dynamic status via `trpc.aiChat.getStatus.useQuery()`.
  2. Local Fallback Mode banner should be placed at the top of the chat panel inside `<TabsContent value="chat">`, dismissible and styled with amber/violet glassmorphic gradient.
  3. Messages state needs expansion to store `isOfflineFallback` and `source` ("faq" | "academic_rules" | "local_advisor" | "external_llm").
  4. Subtle `MessageSourceBadge` provides clear transparency for university regulations, degree rules, advisor tips, or live model answers.
  5. RTL/LTR compatibility is maintained using Tailwind logical properties (`rounded-ee-sm`, `rounded-es-sm`, `me-`, `ms-`, `text-start`, `text-end`).
- **Unexplored areas**: None for M1 frontend scope. Ready to finalize handoff report.

## Key Decisions Made
- Designed comprehensive UI blueprint for AIChatPage.tsx with zero external library regressions.
- Default to `isLocalFallbackMode: true` if server query fails or is unconfigured to prevent false online indicators.
- Provide full bilingual Arabic/English strings with graceful fallback defaults.

## Artifact Index
- DISPATCH.md — Task dispatch instructions
- BRIEFING.md — Persistent working memory
- progress.md — Liveness heartbeat
- handoff.md — Final structured report and code blueprint
