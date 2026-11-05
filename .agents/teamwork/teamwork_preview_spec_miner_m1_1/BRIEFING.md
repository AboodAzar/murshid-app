# BRIEFING — 2026-10-27T11:21:30Z

## Mission
Mine all authoritative university regulations, FAQs, and academic rules from Runpod/data/ and database faqs, documenting intents, exact responses, and bilingual keyword mapping for the local fallback engine.

## 🔒 My Identity
- Archetype: spec-miner
- Roles: Specification Miner
- Working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_spec_miner_m1_1\
- Original parent: bd241cda-c8ae-4f16-b4be-daab58196b4d
- Milestone: M1 (AI Chat Graceful Mock & Local Fallback Engine)

## 🔒 Key Constraints
- Do NOT implement anything — read-only investigation and specification mining.
- Do NOT skip any feature or rule, no matter how obscure.
- Prioritize authoritative sources over LLM prior knowledge.
- Capture exact responses and bilingual keyword matching for both Arabic and English.
- Write report to `s:\murshid (1)\.agents\teamwork\teamwork_preview_spec_miner_m1_1\handoff.md`.
- Report when done via `send_message` to parent `bd241cda-c8ae-4f16-b4be-daab58196b4d`.

## Current Parent
- Conversation ID: bd241cda-c8ae-4f16-b4be-daab58196b4d
- Updated: not yet

## Loaded Skills
- None provided

## Task Summary
- **What to build**: Authoritative academic regulations and FAQ knowledge mining document with structured intents, responses, and bilingual keyword mapping for `server/utils/aiFallback.ts`.
- **Success criteria**: Comprehensive catalog of academic rules (probation, attendance, graduation, add/drop, prerequisites, offices), database FAQ entries, and exact Arabic/English keyword mappings.
- **Interface contracts**: `PROJECT.md` § Interface Contracts (AI Chat Service ↔ Client)
- **Code layout**: `PROJECT.md` § Code Layout (`server/utils/aiFallback.ts`, `server/routers/aiChat.ts`, `server/routers/faqs.ts`)

## Key Decisions Made
- Extracted and codified authoritative rules from `Rules_and_Regulations.pdf` (Articles 10, 11, 12, 15, 17, 18, 20, 21, 27, 28, 29).
- Extracted faculty contacts (`Faculty_Guide.pdf`), facilities & level exams (`University_Guide.pdf`), and fee schedules (`Facility_Fees.csv`, `Unversity_Fees.csv`).
- Codified 3-tier fallback engine specification with bilingual Arabic/English keyword dictionary and exact response templates in `handoff.md`.

## Artifact Index
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_spec_miner_m1_1\progress.md` — Liveness and execution heartbeat
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_spec_miner_m1_1\handoff.md` — Final spec mining report
- `s:\murshid (1)\.agents\teamwork\teamwork_preview_spec_miner_m1_1\DISPATCH.md` — Task assignment and instructions

