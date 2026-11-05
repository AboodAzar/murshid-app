# Handoff Report: Milestone 1 Explorer 2 (Frontend AI Chat UI & Offline Banner)

## 1. Observation
1. **Static AI Online Indicator**:
   - In `client/src/pages/AIChatPage.tsx` lines 198–204:
     ```tsx
     <div className="flex items-center gap-3">
       <Logo size={40} className="rounded-xl shadow-[0_0_30px_rgba(59,130,246,.35)]" />
       <div className="flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
         <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">AI Online</span>
       </div>
     </div>
     ```
     This hardcoded status badge permanently asserts "AI Online" even when the external Runpod model server is offline or unreachable.

2. **Absence of Offline/Fallback Mode Notification**:
   - Inside `<TabsContent value="chat">` (`client/src/pages/AIChatPage.tsx` lines 503–609), there is currently no banner or status notification explaining to the student that responses are being served from local regulations/FAQs rather than an active LLM.

3. **Message Type and State Handling**:
   - In `client/src/pages/AIChatPage.tsx` line 88:
     ```tsx
     interface Message { id?: number; role: "user" | "assistant"; content: string; createdAt?: Date; feedback?: "up" | "down" | "none" | null; }
     ```
   - In `handleSendMessage` (`client/src/pages/AIChatPage.tsx` lines 155–166):
     ```tsx
     const handleSendMessage = async () => {
       if (!input.trim() || !selectedConversation || isLoading) return;
       const userMsg: Message = { role: "user", content: input };
       setMessages(prev => [...prev, userMsg]); setInput(""); setIsLoading(true);
       try {
         const res = await sendMsg.mutateAsync({ conversationId: selectedConversation, message: input });
         if (res.response) setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
         utils.aiChat.getMessages.invalidate(selectedConversation);
       } catch (e) {
         setMessages(prev => [...prev, { role: "assistant", content: t("chat.sendError") }]);
       } finally { setIsLoading(false); }
     };
     ```
     The message model does not capture metadata returned by the local fallback engine (`isOfflineFallback`, `source`).

4. **Interface Contract in `PROJECT.md` lines 40–46**:
   - Query: `aiChat.getStatus`
     - Output: `{ isOnline: boolean, mode: "local_mock_fallback" | "external_model", model: string }`
   - Mutation: `aiChat.sendMessage`
     - Input: `{ conversationId: number, message: string }`
     - Output: `{ success: boolean, response: string, isOfflineFallback: boolean, source: "faq" | "academic_rules" | "local_advisor" | "external_llm" }`

5. **Internationalization & Layout**:
   - `client/src/contexts/I18nContext.tsx` provides `{ language: "en" | "ar", setLanguage, t, dir: "ltr" | "rtl" }`.
   - Locales are defined in `client/src/locales/en/common.json` and `client/src/locales/ar/common.json`.
   - Message bubbles use directional hardcoded classes `rounded-br-sm` and `rounded-bl-sm` at line 556, which should be updated to Tailwind logical corner properties (`rounded-ee-sm` and `rounded-es-sm`) for correct RTL rendering in Arabic.

6. **Current Build & Typecheck Baseline**:
   - Tool execution: `npm run check` completed with code 0 (0 TypeScript errors).
   - Tool execution: `node scripts/validate-db.mjs` completed with code 0 (`ok: true`, MariaDB 10.11, 29 tables).

---

## 2. Logic Chain
1. *From Observation 1 & 4*:
   Because `PROJECT.md` specifies that the backend exposes `aiChat.getStatus` returning `{ isOnline: boolean, mode: "local_mock_fallback" | "external_model", model: string }`, the client should query `trpc.aiChat.getStatus.useQuery()` with a 30-second refetch interval.
2. *From Observation 1 & 6*:
   When the query is loading, the UI displays a neutral pulsing indicator ("Checking Status..."). If `mode === "local_mock_fallback"` or `!isOnline`, the badge updates to an amber indicator ("Local Knowledge Base" / "قاعدة المعرفة المحلية"). If `mode === "external_model"` and `isOnline === true`, it displays the emerald "AI Online" badge.
3. *From Observation 2*:
   To provide immediate clarity to students without obstructing chat flow, a dismissible glassmorphic banner should be mounted above the conversation feed inside the Chat tab when in local fallback mode. It will explicitly inform the student:
   "Operating in Local Fallback Mode: Responses are generated using local university FAQs and academic regulations while the external model server is offline." (with full Arabic translation in RTL mode).
4. *From Observation 3 & 4*:
   `interface Message` must be augmented with optional fields `isOfflineFallback?: boolean` and `source?: "faq" | "academic_rules" | "local_advisor" | "external_llm"`.
   In `handleSendMessage`, the response from `sendMsg.mutateAsync` will populate these fields.
   When rendering assistant messages, a subtle `MessageSourceBadge` will indicate the exact origin (e.g. "ZUJ Regulations FAQ", "Academic Rules", "Advisor Guidance", or "Live Model"), giving the student complete transparency.
5. *From Observation 5*:
   Replacing `rounded-br-sm` and `rounded-bl-sm` with `rounded-ee-sm` and `rounded-es-sm` ensures that user bubbles align and round correctly in both LTR (English) and RTL (Arabic). Adding translation keys to `common.json` ensures full bilingual consistency.

---

## 3. Caveats
- **Backend Coupling**: `trpc.aiChat.getStatus` is being implemented in parallel by Explorer 1 / Backend Implementer. Until the procedure is committed to `server/routers/aiChat.ts`, `(trpc.aiChat as any).getStatus` should be safely guarded so TypeScript compilation (`npm run check`) never fails if applied in either order.
- **Persistent Dismissal**: The local fallback banner dismissal state is currently stored in React component state (`showFallbackBanner`). If page refreshes, it reappears, which is desirable so students returning in new sessions remain aware of the local mode.
- **Historical Messages**: Historical messages loaded from `aiChat.getMessages` may not have historical source tags stored in the current database schema. For these, the badge gracefully falls back or omits the source pill without errors.

---

## 4. Conclusion & Concrete Blueprint

### 4.1 Component Blueprint: `MessageSourceBadge`
Create or embed this helper component in `AIChatPage.tsx`:

```tsx
function MessageSourceBadge({
  source,
  isOffline,
  language,
}: {
  source?: "faq" | "academic_rules" | "local_advisor" | "external_llm" | string;
  isOffline?: boolean;
  language: "en" | "ar";
}) {
  if (source === "faq") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
        <BookOpen className="w-2.5 h-2.5" />
        {language === "ar" ? "لوائح وأسئلة الزيتونة" : "ZUJ Regulations FAQ"}
      </span>
    );
  }
  if (source === "academic_rules") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
        <GraduationCap className="w-2.5 h-2.5" />
        {language === "ar" ? "الخطة الدراسية والقواعد" : "Academic Rules"}
      </span>
    );
  }
  if (source === "local_advisor") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
        <Sparkles className="w-2.5 h-2.5" />
        {language === "ar" ? "إرشادات المرشد المحلي" : "Advisor Guidance"}
      </span>
    );
  }
  if (source === "external_llm") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
        <Zap className="w-2.5 h-2.5" />
        {language === "ar" ? "نموذج سحابي حي" : "Live Model"}
      </span>
    );
  }
  if (isOffline) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-slate-500/20 border border-slate-500/30 text-slate-300">
        <BrainCircuit className="w-2.5 h-2.5" />
        {language === "ar" ? "استجابة محلية" : "Local Fallback"}
      </span>
    );
  }
  return null;
}
```

---

### 4.2 Hero Dynamic Status Pill (Line 200–204)
**Before**:
```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">AI Online</span>
</div>
```

**After**:
```tsx
<div className="flex items-center gap-2">
  {statusLoading ? (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400">
      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
      <span className="text-[11px] font-medium uppercase tracking-wider">
        {language === "ar" ? "جاري الفحص..." : "Checking Status..."}
      </span>
    </div>
  ) : isLocalFallbackMode ? (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-sm"
      title={aiStatus?.model ? `Active: ${aiStatus.model}` : "Local ZUJ FAQ & Rules Fallback"}
    >
      <div className="w-2 h-2 rounded-full bg-amber-400" />
      <span className="text-[11px] font-semibold uppercase tracking-wider">
        {language === "ar" ? "قاعدة المعرفة المحلية" : "Local Knowledge Base"}
      </span>
      <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-400/40 text-amber-300 hidden sm:inline-flex">
        {language === "ar" ? "دون إنترنت" : "Offline Mode"}
      </Badge>
    </div>
  ) : (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-sm"
      title={aiStatus?.model ? `Model: ${aiStatus.model}` : "Live External Model"}
    >
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[11px] font-semibold uppercase tracking-wider">
        {language === "ar" ? "الذكاء الاصطناعي متصل" : "AI Online"}
      </span>
    </div>
  )}
</div>
```

---

### 4.3 Chat Tab Local Fallback Mode Banner
Positioned right inside the chat area container (before the message history feed):

```tsx
{/* ─── Local Fallback Mode Banner ─── */}
{isLocalFallbackMode && showFallbackBanner && (
  <div className="mx-3 sm:mx-4 mt-3 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-200 backdrop-blur-md flex items-start justify-between gap-3 shrink-0">
    <div className="flex items-start gap-2.5 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs sm:text-sm font-semibold text-amber-300 leading-tight">
            {language === "ar"
              ? "وضع المعرفة المحلية نشط (استجابة فورية)"
              : "Operating in Local Fallback Mode"}
          </h4>
          <Badge variant="outline" className="text-[10px] bg-amber-500/20 border-amber-500/40 text-amber-300 px-1.5 py-0">
            {language === "ar" ? "لوائح جامعة الزيتونة" : "ZUJ FAQs & Regulations"}
          </Badge>
        </div>
        <p className="text-[11px] sm:text-xs text-amber-200/90 leading-relaxed">
          {language === "ar"
            ? "يتم توليد الإجابات باستخدام لوائح جامعة الزيتونة، متطلبات التخرج، والأسئلة الشائعة محلياً أثناء عدم توفر خادم النماذج الخارجي."
            : "Operating in Local Fallback Mode: Responses are generated using local university FAQs and academic regulations while the external model server is offline."}
        </p>
      </div>
    </div>
    <button
      onClick={() => setShowFallbackBanner(false)}
      className="p-1 rounded-md text-amber-400 hover:text-amber-100 hover:bg-amber-500/20 transition-colors shrink-0"
      aria-label={language === "ar" ? "إغلاق الإشعار" : "Dismiss notice"}
    >
      <X className="w-4 h-4" />
    </button>
  </div>
)}
```

---

### 4.4 Message Sending & Bubble Rendering with Source Pill

**Enhanced Message State**:
```tsx
interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  feedback?: "up" | "down" | "none" | null;
  isOfflineFallback?: boolean;
  source?: "faq" | "academic_rules" | "local_advisor" | "external_llm";
}
```

**Robust `handleSendMessage`**:
```tsx
const handleSendMessage = async () => {
  if (!input.trim() || !selectedConversation || isLoading) return;
  const userText = input.trim();
  const userMsg: Message = { role: "user", content: userText, createdAt: new Date() };
  setMessages(prev => [...prev, userMsg]);
  setInput("");
  setIsLoading(true);

  try {
    const res = await sendMsg.mutateAsync({
      conversationId: selectedConversation,
      message: userText,
    });
    if (res?.response) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: res.response,
          isOfflineFallback: res.isOfflineFallback ?? true,
          source: res.source ?? "faq",
          createdAt: new Date(),
        },
      ]);
    }
    utils.aiChat.getMessages.invalidate(selectedConversation);
  } catch (err: any) {
    console.error("[AIChatPage] Message delivery error:", err);
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: language === "ar"
          ? "تعذر إرسال الرسالة إلى الخادم حالياً. يرجى مراجعة المرشد الأكاديمي أو المحاولة مجدداً."
          : t("chat.sendError") || "Sorry, I encountered an error. Please try again.",
        isOfflineFallback: true,
        source: "faq",
        createdAt: new Date(),
      },
    ]);
  } finally {
    setIsLoading(false);
    setTimeout(scrollToBottom, 50);
  }
};
```

**Message Bubble with RTL Logical Corners & Source Indicator**:
```tsx
<motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
  <div className={`${msg.role === "user" ? "max-w-[85%]" : "max-w-[90%]"} sm:max-w-[80%] md:max-w-md lg:max-w-lg px-3 py-2.5 md:px-4 md:py-3 rounded-2xl break-words ${msg.role === "user" ? "bg-blue-600 text-white rounded-ee-sm" : "bg-white/[0.06] border border-border text-slate-100 rounded-es-sm"}`}>
    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
      {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5" />}
      <span className="text-[10px] opacity-70">{msg.role === "assistant" ? "Murshid AI" : "You"}</span>
      {msg.role === "assistant" && (
        <MessageSourceBadge source={msg.source} isOffline={msg.isOfflineFallback} language={language} />
      )}
    </div>
    {msg.role === "assistant" ? <Streamdown className="break-words">{msg.content}</Streamdown> : <p className="text-sm break-words">{msg.content}</p>}
    {msg.role === "assistant" && msg.id && (
      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-end gap-2">
        <button onClick={() => handleRateMessage(msg.id!, "up")} disabled={msg.feedback === "up" || rateMsg.isPending} className={`p-1.5 rounded-md transition-colors ${msg.feedback === "up" ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-white/10 text-muted-foreground hover:text-emerald-400"}`} title="Good response">
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => handleRateMessage(msg.id!, "down")} disabled={msg.feedback === "down" || rateMsg.isPending} className={`p-1.5 rounded-md transition-colors ${msg.feedback === "down" ? "bg-red-500/20 text-red-400" : "hover:bg-white/10 text-muted-foreground hover:text-red-400"}`} title="Bad response">
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>
    )}
  </div>
</motion.div>
```

---

### 4.5 Localization Keys Additions
In `client/src/locales/en/common.json` under `"chat"`:
```json
"statusOnline": "AI Online",
"statusLocal": "Local Knowledge Base",
"statusChecking": "Checking Status...",
"statusOffline": "Offline Mode",
"bannerTitle": "Operating in Local Fallback Mode",
"bannerDescription": "Responses are generated using local university FAQs and academic regulations while the external model server is offline.",
"badgeFaq": "ZUJ Regulations FAQ",
"badgeAcademicRules": "Academic Rules",
"badgeLocalAdvisor": "Advisor Guidance",
"badgeLocalFallback": "Local Fallback",
"badgeLiveModel": "Live Model"
```

In `client/src/locales/ar/common.json` under `"chat"`:
```json
"statusOnline": "الذكاء الاصطناعي متصل",
"statusLocal": "قاعدة المعرفة المحلية",
"statusChecking": "جاري الفحص...",
"statusOffline": "دون إنترنت",
"bannerTitle": "وضع المعرفة المحلية نشط",
"bannerDescription": "يتم توليد الإجابات باستخدام لوائح جامعة الزيتونة والأسئلة الشائعة محلياً أثناء عدم توفر خادم النماذج الخارجي.",
"badgeFaq": "لوائح وأسئلة الزيتونة",
"badgeAcademicRules": "الخطة الدراسية والقواعد",
"badgeLocalAdvisor": "إرشادات المرشد المحلي",
"badgeLocalFallback": "استجابة محلية",
"badgeLiveModel": "نموذج سحابي حي"
```

---

## 5. Verification Method

1. **Static Typecheck**:
   ```bash
   npm run check
   ```
   *Expected Result*: Exits with code 0. Zero TypeScript diagnostic errors.

2. **Production Bundle Verification**:
   ```bash
   npm run build
   ```
   *Expected Result*: Vite builds client bundle and esbuild packages the server without syntax or module errors.

3. **Runtime UI & Layout Verification**:
   - Start the development server (`npm run dev`) or production server (`node dist/index.js`).
   - Navigate to `/chat` (`http://localhost:3000/chat`).
   - **Hero Check**: Verify the badge at the top shows amber "Local Knowledge Base" with "Offline Mode" pill instead of the previous static green "AI Online".
   - **Banner Check**: Verify the amber "Operating in Local Fallback Mode" banner is visible at the top of the chat area, with the dismiss (`X`) button functioning smoothly.
   - **Message Sending Check**: Send a question (e.g. "What are the prerequisites for Software Engineering?"). Verify that:
     1. Message is immediately appended to the chat.
     2. Assistant replies with local FAQ or academic rules response without spinning or hanging.
     3. Assistant message header displays the source badge (e.g. `ZUJ Regulations FAQ` or `Academic Rules`).
   - **Bilingual & RTL Check**: Switch language to Arabic using the language toggle. Verify:
     1. Page direction dynamically switches to RTL (`dir="rtl"`).
     2. Hero badge text switches to "قاعدة المعرفة المحلية".
     3. Banner text switches to Arabic.
     4. Message bubbles have correct logical corners (`rounded-ee-sm` and `rounded-es-sm`) without bubble distortion.
     5. Source badges display corresponding Arabic labels.

4. **Invalidation Conditions**:
   - If `npm run check` fails due to `aiChat.getStatus` type mismatch before the backend router is merged, verify that fallback type guarding `(trpc.aiChat as any).getStatus` is used until both backend and frontend branches are unified.
