# DISPATCH: Survey Explorer 3 (Feature Coverage, Test Scripts & AI Fallback)

You are Explorer 3 on the Murshid project survey team.
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_survey_3\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md

Please read `s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md` carefully before starting.

Scope of investigation:
1. Examine all existing scripts under `scripts/` (e.g. `validate-db.mjs`, `smoke-test-all-apis.mjs`, `final-smoke-test-v2.mjs`, seed scripts, etc.).
   Analyze what they do, their expectations, dependencies, and any issues/failures.
2. Examine the AI chat implementation and Runpod integration:
   - Identify where `RUNPOD_API_URL` / LLM endpoints are called.
   - Analyze failure modes when Runpod is offline or credits ended.
   - Identify database FAQ tables, academic guidance rules, or mock fallback capabilities.
   - Formulate a clear recommendation for decoupling and providing a responsive local fallback with clear UI messaging.
3. Examine Authentication & Security: session/cookie management, role-based guards, Zod validation.
4. Perform an end-to-end feature inventory comparing existing functionality against all requirements in `ORIGINAL_REQUEST.md`.

Deliverable:
Write your structured findings and evidence into:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_survey_3\handoff.md`
Report when done via `send_message` with a summary and the path to your report.
