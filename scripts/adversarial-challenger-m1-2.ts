import "dotenv/config";
import { appRouter } from "../server/routers";
import { getDb } from "../server/db";
import { users, aiConversations, chatMessages, faqs, documents } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import type { TrpcContext } from "../server/_core/context";
import type { User } from "../drizzle/schema";

interface TestResult {
  test: string;
  category: string;
  status: "PASS" | "FAIL";
  durationMs: number;
  details: any;
}

const results: TestResult[] = [];

function recordResult(test: string, category: string, passed: boolean, durationMs: number, details: any) {
  const status = passed ? "PASS" : "FAIL";
  results.push({ test, category, status, durationMs, details });
  console.log(`[${status}] ${category} :: ${test} (${durationMs.toFixed(1)}ms)`);
  if (!passed) {
    console.error("   Details:", JSON.stringify(details, null, 2));
  }
}

function createMockContext(user: User | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "http",
      headers: {},
      cookies: {},
    } as any,
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as any,
  };
}

async function runAdversarialSuite() {
  console.log("================================================================================");
  console.log("   MURSHID ADVERSARIAL CHALLENGER SUITE - MILESTONE 1 EMPIRICAL AUDIT");
  console.log("================================================================================");

  const db = await getDb();
  if (!db) {
    console.error("FATAL: Database connection failed.");
    process.exit(1);
  }

  // Fetch test users from DB
  const [studentGood] = await db.select().from(users).where(eq(users.id, 210029)).limit(1); // Basma Hassan (GPA 3.65)
  const [studentProbation] = await db.select().from(users).where(eq(users.id, 210028)).limit(1); // Lina Omar (GPA 1.50)
  const [advisorUser] = await db.select().from(users).where(eq(users.id, 210024)).limit(1); // Dr. Ahmad Khalil

  if (!studentGood || !studentProbation || !advisorUser) {
    console.error("FATAL: Required test users (210029, 210028, 210024) missing from DB.");
    process.exit(1);
  }

  console.log(`Loaded test users:`);
  console.log(`- Good Standing: ${studentGood.name} (ID: ${studentGood.id})`);
  console.log(`- Academic Probation: ${studentProbation.name} (ID: ${studentProbation.id})`);
  console.log(`- Advisor: ${advisorUser.name} (ID: ${advisorUser.id})`);
  console.log("--------------------------------------------------------------------------------\n");

  // ============================================================================
  // SUITE 1: aiChat.getStatus Health Probe & Latency Audit
  // ============================================================================
  console.log(">>> SUITE 1: aiChat.getStatus Health Probe & Latency Audit");
  {
    const publicCtx = createMockContext(null);
    const caller = appRouter.createCaller(publicCtx);

    // Call 1: Measure initial status check
    const t0 = performance.now();
    const status1 = await caller.aiChat.getStatus();
    const d0 = performance.now() - t0;

    const validContract = 
      typeof status1.isOnline === "boolean" &&
      (status1.mode === "local_mock_fallback" || status1.mode === "external_model") &&
      typeof status1.model === "string";

    recordResult(
      "Contract Conformance { isOnline, mode, model }",
      "aiChat.getStatus",
      validContract,
      d0,
      { status: status1 }
    );

    recordResult(
      "Offline Mode Detection (isOnline: false, mode: local_mock_fallback)",
      "aiChat.getStatus",
      status1.isOnline === false && status1.mode === "local_mock_fallback",
      d0,
      { isOnline: status1.isOnline, mode: status1.mode, model: status1.model }
    );

    // Measure cached performance over 5 consecutive invocations
    const latencies: number[] = [];
    for (let i = 0; i < 5; i++) {
      const tc0 = performance.now();
      const statusCached = await caller.aiChat.getStatus();
      const tc1 = performance.now() - tc0;
      latencies.push(tc1);
    }
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);

    recordResult(
      "Instant Response Latency (<100ms)",
      "aiChat.getStatus",
      avgLatency < 100 && maxLatency < 100,
      avgLatency,
      { avgLatencyMs: avgLatency.toFixed(2), maxLatencyMs: maxLatency.toFixed(2), latencies }
    );
  }

  // ============================================================================
  // SUITE 2: aiChat.sendMessage Profile Tailoring (Good Standing vs Probation)
  // ============================================================================
  console.log("\n>>> SUITE 2: aiChat.sendMessage Profile Tailoring & Intent Engine");

  // Helper to run chat test
  async function testStudentChat(
    user: User,
    profileName: string,
    query: string,
    expectedKeywords: string[],
    unexpectedKeywords: string[],
    expectedSource: "faq" | "academic_rules" | "local_advisor"
  ) {
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    // Create fresh conversation
    const conv = await caller.aiChat.createConversation({ title: `Audit - ${profileName}` });
    const convId = conv.conversationId as number;

    const tStart = performance.now();
    const res = await caller.aiChat.sendMessage({
      conversationId: convId,
      message: query,
    });
    const duration = performance.now() - tStart;

    const hasExpected = expectedKeywords.every(kw => res.response.toLowerCase().includes(kw.toLowerCase()));
    const hasUnexpected = unexpectedKeywords.some(kw => res.response.toLowerCase().includes(kw.toLowerCase()));
    const correctSource = res.source === expectedSource;
    const isOffline = res.isOfflineFallback === true;
    const passed = res.success && hasExpected && !hasUnexpected && correctSource && isOffline && duration < 2500;

    recordResult(
      `[${profileName}] "${query.slice(0, 30)}..."`,
      "aiChat.sendMessage",
      passed,
      duration,
      {
        query,
        source: res.source,
        expectedSource,
        isOfflineFallback: res.isOfflineFallback,
        missingExpected: expectedKeywords.filter(kw => !res.response.toLowerCase().includes(kw.toLowerCase())),
        foundUnexpected: unexpectedKeywords.filter(kw => res.response.toLowerCase().includes(kw.toLowerCase())),
        snippet: res.response.slice(0, 160) + "...",
      }
    );

    // Verify DB persistence of messages
    const msgs = await db.select().from(chatMessages).where(eq(chatMessages.conversationId, convId));
    const userMsgPersisted = msgs.some(m => m.role === "user" && m.content === query);
    const botMsgPersisted = msgs.some(m => m.role === "assistant" && m.content === res.response);

    recordResult(
      `[${profileName}] DB Message Persistence & Schema Conformance`,
      "aiChat.persistence",
      userMsgPersisted && botMsgPersisted && msgs.length >= 2,
      duration,
      { totalPersisted: msgs.length, userMsgPersisted, botMsgPersisted }
    );

    // Cleanup conversation
    await caller.aiChat.deleteConversation(convId);
    return res;
  }

  // 2.1 Test Good Standing Student (GPA 3.65, Attendance 90%)
  console.log("\n--- Testing Good Standing Profile (Basma Hassan, GPA 3.65, Attendance 90%) ---");
  await testStudentChat(
    studentGood,
    "Good Standing - GPA",
    "كم معدلي التراكمي؟",
    ["3.65", "ممتاز"],
    ["تحت الإنذار الأكاديمي"],
    "academic_rules"
  );

  await testStudentChat(
    studentGood,
    "Good Standing - Probation Check",
    "هل أنا تحت الإنذار الأكاديمي؟",
    ["سليم", "خالٍ من الإنذارات"],
    ["توضع تحت الإنذار", "مهلة"],
    "academic_rules"
  );

  await testStudentChat(
    studentGood,
    "Good Standing - Attendance Check",
    "ما هي نسبة حضوري وغيابي؟",
    ["90%", "ممتازة", "الحدود الآمنة"],
    ["تنبيه هام: نسبة غيابك تقترب"],
    "academic_rules"
  );

  await testStudentChat(
    studentGood,
    "Good Standing - Tuition Calculator (Merit Discount)",
    "كم تكلفة 15 ساعة دراسية في الكلية؟",
    ["40%", "1025"], // (15 * 75 * 0.60) + 350 = 1025 JOD
    [],
    "academic_rules"
  );

  // 2.2 Test Probation Student (GPA 1.50, Attendance 40%)
  console.log("\n--- Testing Probation & Deprivation Risk Profile (Lina Omar, GPA 1.50, Attendance 40%) ---");
  await testStudentChat(
    studentProbation,
    "Probation - GPA Alert",
    "كم معدلي التراكمي؟",
    ["1.50", "حرج", "الإنذار الأكاديمي"],
    ["لوحة الشرف"],
    "academic_rules"
  );

  await testStudentChat(
    studentProbation,
    "Probation - Academic Warning Rules",
    "هل أنا تحت الإنذار؟",
    ["الإنذار الأكاديمي", "المادة 18", "فصلين"],
    ["خالٍ من الإنذارات", "Good Academic Standing"],
    "academic_rules"
  );

  await testStudentChat(
    studentProbation,
    "Probation - Attendance Deprivation Alert",
    "ما هو وضعي في الحضور والغياب؟",
    ["40%", "تنبيه هام", "الحرمان"],
    ["ممتازة", "ضمن الحدود الآمنة"],
    "academic_rules"
  );

  await testStudentChat(
    studentProbation,
    "Probation - Tuition (No Discount)",
    "كم تكلفة 15 ساعة دراسية في الكلية؟",
    ["0%", "1475"], // (15 * 75 * 1.0) + 350 = 1475 JOD
    ["40% (يطبق"], // Should not receive the 40% applied discount
    "academic_rules"
  );

  // 2.3 Test Tier 1 FAQ Matching
  console.log("\n--- Testing Tier 1 FAQ Matching (Bilingual ZUJ Regulations) ---");
  await testStudentChat(
    studentGood,
    "Tier 1 FAQ - Add/Drop (Arabic)",
    "متى تبدأ فترة السحب والإضافة؟",
    ["السحب والإضافة", "أسبوع"],
    [],
    "faq"
  );

  await testStudentChat(
    studentGood,
    "Tier 1 FAQ - Exam Conflict",
    "ماذا أفعل في حال تعارض موعد امتحانين نهائيين؟",
    ["الامتحانات", "الأولويات"],
    [],
    "faq"
  );

  await testStudentChat(
    studentGood,
    "Tier 1 FAQ - Add/Drop (English)",
    "When is the drop and add period?",
    ["drop/add period", "one week"],
    [],
    "faq"
  );

  // 2.4 Test Tier 3 Simulated Advisor Guidance
  console.log("\n--- Testing Tier 3 Simulated Advisor Fallback ---");
  await testStudentChat(
    studentGood,
    "Tier 3 Advisor - Study Strategy",
    "أشعر بضغط كبير في الدراسة كيف أنظم وقتي ومذاكرتي؟",
    ["البومودورو", "ساعات الدعم المكتبي"],
    [],
    "local_advisor"
  );

  await testStudentChat(
    studentGood,
    "Tier 3 Advisor - Career Guidance",
    "كيف أجهز نفسي لسوق العمل والوظائف؟",
    ["المشاريع العملية", "التدريب الميداني"],
    [],
    "local_advisor"
  );

  // ============================================================================
  // SUITE 3: Non-Blocking Offline Resilience in faqs.ts & documents.ts
  // ============================================================================
  console.log("\n>>> SUITE 3: Advisor Router Offline Resilience (faqs.ts & documents.ts)");
  {
    const advisorCtx = createMockContext(advisorUser);
    const advisorCaller = appRouter.createCaller(advisorCtx);

    // 3.1 faqs.create resilience test
    console.log("--- Testing faqs.create when Runpod is offline ---");
    const testFaqData = {
      question: "Empirical Adversarial Test Question?",
      questionAr: "سؤال اختبار التحقق التجريبي العكسي؟",
      answer: "Empirical test answer verifying non-blocking Runpod sync.",
      answerAr: "إجابة اختبار التحقق التجريبي من عدم التوقف عند انقطاع خادم النماذج.",
      category: "Adversarial Testing",
      categoryAr: "اختبارات عكسية",
      isActive: true, // triggers Runpod /add_faq attempt
    };

    const tFaq0 = performance.now();
    const faqResult = await advisorCaller.faqs.create(testFaqData);
    const dFaq = performance.now() - tFaq0;

    const faqCreatedInDb = await db
      .select()
      .from(faqs)
      .where(eq(faqs.question, testFaqData.question));

    recordResult(
      "faqs.create Non-blocking Execution (<2000ms)",
      "faqs.offline_resilience",
      faqResult.success === true && dFaq < 2000 && faqCreatedInDb.length > 0,
      dFaq,
      { success: faqResult.success, durationMs: dFaq.toFixed(2), dbRecordFound: faqCreatedInDb.length > 0 }
    );

    // Cleanup test FAQ
    if (faqCreatedInDb[0]?.id) {
      await advisorCaller.faqs.delete(faqCreatedInDb[0].id);
    }

    // 3.2 documents.importOfficialResource resilience test
    console.log("--- Testing documents.importOfficialResource when Runpod is offline ---");
    const tDoc0 = performance.now();
    const docImportResult = await advisorCaller.documents.importOfficialResource({
      resourceId: "zuj-academic-regulations",
      indexForAI: true, // triggers Runpod /add_url attempt with 1500ms timeout
    });
    const dDoc = performance.now() - tDoc0;

    recordResult(
      "documents.importOfficialResource Non-blocking (<2000ms)",
      "documents.offline_resilience",
      docImportResult.success === true && dDoc < 2000,
      dDoc,
      { success: docImportResult.success, durationMs: dDoc.toFixed(2), docId: docImportResult.docId }
    );

    // Cleanup imported doc if created
    if (docImportResult.docId) {
      await db.delete(documents).where(eq(documents.id, docImportResult.docId));
    }

    // 3.3 documents.addOfficialLink resilience test
    console.log("--- Testing documents.addOfficialLink when Runpod is offline ---");
    const tLink0 = performance.now();
    const linkResult = await advisorCaller.documents.addOfficialLink({
      title: "ZUJ FSIT Regulations Portal",
      category: "Official Regulations",
      url: "https://www.zuj.edu.jo/faculty-of-science-and-information-technology/",
      indexForAI: true, // triggers Runpod /add_url attempt
    });
    const dLink = performance.now() - tLink0;

    recordResult(
      "documents.addOfficialLink Non-blocking (<2000ms)",
      "documents.offline_resilience",
      linkResult.success === true && dLink < 2000,
      dLink,
      { success: linkResult.success, durationMs: dLink.toFixed(2), docId: linkResult.docId }
    );

    if (linkResult.docId) {
      await db.delete(documents).where(eq(documents.id, linkResult.docId));
    }

    // 3.4 documents.upload offline resilience test
    console.log("--- Testing documents.upload when Runpod is offline ---");
    // Verify how documents.upload behaves: storagePut fails fast without hanging on Runpod
    let uploadThrewFast = false;
    const tUp0 = performance.now();
    try {
      await advisorCaller.documents.upload({
        title: "Test PDF Upload",
        fileContent: Buffer.from("test pdf file").toString("base64"),
        fileType: "pdf",
        category: "Test",
      });
    } catch (err: any) {
      uploadThrewFast = true;
    }
    const dUp = performance.now() - tUp0;

    recordResult(
      "documents.upload Fast Error Drop (<100ms)",
      "documents.upload_resilience",
      uploadThrewFast && dUp < 100,
      dUp,
      { uploadThrewFast, durationMs: dUp.toFixed(2) }
    );

    // 3.5 documents.retryDocumentIndexing resilience test
    console.log("--- Testing documents.retryDocumentIndexing when Runpod is offline ---");
    // Insert a dummy link document to retry indexing on
    const [insertedDummy] = await db.insert(documents).values({
      title: "Retry Test Doc",
      fileUrl: "https://www.zuj.edu.jo/faculties/science-it/guide",
      fileKey: "official://test-retry",
      fileType: "link",
      category: "Regulations",
      uploadedBy: advisorUser.id,
      isProcessed: false,
    });
    const dummyId = insertedDummy?.insertId as number;

    const tRetry0 = performance.now();
    const retryResult = await advisorCaller.documents.retryDocumentIndexing(dummyId);
    const dRetry = performance.now() - tRetry0;

    recordResult(
      "documents.retryDocumentIndexing Non-blocking (<2000ms)",
      "documents.retry_resilience",
      dRetry < 2000,
      dRetry,
      { success: retryResult.success, durationMs: dRetry.toFixed(2), message: retryResult.message }
    );

    // Cleanup dummy
    await db.delete(documents).where(eq(documents.id, dummyId));

    // 3.6 AbortSignal.timeout(1500) Guard Coverage Audit
    console.log("--- Checking AbortSignal.timeout(1500) Guard Coverage Across Routers ---");
    const fs = await import("fs");
    const docSrc = fs.readFileSync("server/routers/documents.ts", "utf8");
    const faqSrc = fs.readFileSync("server/routers/faqs.ts", "utf8");
    const aiChatSrc = fs.readFileSync("server/routers/aiChat.ts", "utf8");

    const docTimeouts = (docSrc.match(/AbortSignal\.timeout\(1500\)/g) || []).length;
    const faqTimeouts = (faqSrc.match(/AbortSignal\.timeout\(1500\)/g) || []).length;
    const aiChatTimeouts = (aiChatSrc.match(/AbortSignal\.timeout\(1500\)/g) || []).length;

    recordResult(
      "documents.ts Timeout Guards (4 sites)",
      "guards.documents",
      docTimeouts >= 4,
      0,
      { count: docTimeouts, required: 4 }
    );

    recordResult(
      "faqs.ts Timeout Guard (1 site)",
      "guards.faqs",
      faqTimeouts >= 1,
      0,
      { count: faqTimeouts, required: 1 }
    );

    recordResult(
      "aiChat.ts Timeout Guard (1 site)",
      "guards.aiChat",
      aiChatTimeouts >= 1,
      0,
      { count: aiChatTimeouts, required: 1 }
    );
  }

  // ============================================================================
  // SUMMARY & VERDICT CALCULATION
  // ============================================================================
  console.log("\n================================================================================");
  console.log("   AUDIT SUMMARY & METRICS");
  console.log("================================================================================");

  const total = results.length;
  const passedCount = results.filter(r => r.status === "PASS").length;
  const failedCount = results.filter(r => r.status === "FAIL").length;
  const passRate = ((passedCount / total) * 100).toFixed(1);

  console.log(`Total Assertions Run: ${total}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Pass Rate: ${passRate}%`);

  const verdict = failedCount === 0 ? "APPROVE" : "REQUEST_CHANGES";
  console.log(`\nFINAL CHALLENGER VERDICT: >>> ${verdict} <<<`);
  console.log("================================================================================");

  process.exit(failedCount === 0 ? 0 : 1);
}

runAdversarialSuite().catch(err => {
  console.error("Adversarial runner failed:", err);
  process.exit(1);
});
