# DISPATCH: Milestone 1 Explorer 2 (Frontend AI Chat UI & Offline Banner)

You are Explorer 2 for Milestone 1 (AI Chat Graceful Mock & Local Fallback Engine).
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_2\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md

Please read `ORIGINAL_REQUEST.md` and `PROJECT.md` carefully.

Objective:
Design the frontend client changes for `client/src/pages/AIChatPage.tsx` and related components:
1. Replace the static hardcoded `<span className="text-xs text-emerald-400 font-medium">AI Online</span>` badge:
   - Use `trpc.aiChat.getStatus.useQuery()` to detect status dynamically.
   - If in local fallback mode, render an informative badge (e.g., Amber/Violet "Local Knowledge Base / Mock Mode").
2. Implement an informative "Local Fallback Mode" banner:
   - Display a dismissible or persistent banner at the top of the chat area explaining: "Operating in Local Fallback Mode: Responses are generated using local university FAQs and academic regulations while the external model server is offline."
3. Inspect message rendering and feedback:
   - If a message has `isOfflineFallback: true`, optionally display a small subtle source indicator (e.g., "From ZUJ Regulations FAQ").
   - Ensure the chat interface handles sending/receiving smoothly without spinning indefinitely or crashing on network edge cases.
4. Verify responsive design and bilingual RTL/LTR layout compatibility.

Deliverable:
Write your structured UI design and code blueprint into:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_2\handoff.md`
Report when done via `send_message`.


## 2026-10-27T11:20:42Z
[Message] timestamp=2026-10-27T11:20:42Z sender=bd241cda-c8ae-4f16-b4be-daab58196b4d priority=MESSAGE_PRIORITY_HIGH content=You are Explorer 2 for Milestone 1 (Frontend AI Chat UI & Offline Banner).
Your working directory: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_2\
Original request path: s:\murshid (1)\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: s:\murshid (1)\PROJECT.md
Your dispatch instructions: s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_2\DISPATCH.md

Read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md first.
Design the frontend client changes for `client/src/pages/AIChatPage.tsx`:
1. Dynamic AI status indicator via `trpc.aiChat.getStatus`.
2. Clear, informative "Local Fallback / Mock Mode" banner.
3. Smooth offline sending/receiving and message source indication.
Ensure responsive styling and Arabic RTL / English LTR compatibility.
Write your report to:
`s:\murshid (1)\.agents\teamwork\teamwork_preview_explorer_m1_2\handoff.md`
Report when done via send_message.
