// @ts-check
import { createTestSession, SEEDED_ACCOUNTS } from "../tests/e2e/test-client.mjs";

const EVALUATION_CASES = [
  {
    id: "TC-01-STUDENT-ID",
    title: "Student ID Structure & Verification",
    query: "Explain my student ID 202212359. What do the digits mean according to ZUJ rules?",
    mustInclude: ["2022", "12359", "year"],
    context: "Student ID format is 9 digits (YYYYNNNNN): first 4 digits represent year of joining, remaining 5 represent student sequential number."
  },
  {
    id: "TC-02-TIMETABLE-MODALITIES",
    title: "4-Day Timetable & 3 Delivery Modalities",
    query: "What days of the week do we attend classes at ZUJ, and what does 'integrated' (مدمج) course mean?",
    mustInclude: ["Wednesday", "integrated", "activity"],
    context: "4-day timetable (Sunday to Wednesday only). 3 course modalities: Integrated (مدمج - 1 day lecture + 1 day e-activity), Face-to-Face (وجاهي كامل - 2 days physical), and Teams (عن بُعد - 2 days online live)."
  },
  {
    id: "TC-03-GRADING-SCALE",
    title: "Continuous 100% Grading Scale & 4.0 Secondary",
    query: "What grading scale is followed at ZUJ? If a student has an 83.3% cumulative average, what is their rating and 4.0 GPA equivalent?",
    mustInclude: ["100", "83.3", "Very Good"],
    context: "Continuous 100% scale primary. 83.3% is 'Very Good' (جيد جداً), corresponding to ~3.54 / 4.00 on the secondary 4.0 scale."
  },
  {
    id: "TC-04-MERIT-DISCOUNT",
    title: "Article 28 Tuition Merit Discount",
    query: "My cumulative average is 83.3% at ZUJ. What tuition discount do I get under Article 28, and how can I get a 40% discount?",
    mustInclude: ["30%", "40%", "84"],
    context: "Article 28: 76%-83.9% (Very Good) gets 30% tuition discount. Reaching 84.0% (Excellent) gets 40% tuition discount."
  },
  {
    id: "TC-05-ABSENCE-LIMIT",
    title: "Article 14 Absence Deprivation Limits (15% Rule)",
    query: "How many lectures can I miss in a 3-credit course at ZUJ before being deprived (محروم)?",
    mustInclude: ["15%", "4", "depriv"],
    context: "Article 14: Absences must not exceed 15% of total contact hours (maximum 4 lectures for a 3-credit course). 5th unexcused absence leads to academic deprivation with grade F."
  },
  {
    id: "TC-06-CAMPUS-LOCATION",
    title: "Campus Wayfinding: Room 9303 Location",
    query: "I have a lecture in room 9303. Which building and floor is it in, and how do I reach it?",
    mustInclude: ["9", "IT", "3"],
    context: "Room 9303 is in Building 9 (Faculty of Science and Information Technology), 3rd floor, approx 190m from Gate 1."
  },
  {
    id: "TC-07-DEGREE-TIERS",
    title: "133-Credit Degree Plan & 7 Requirement Tiers",
    query: "How many total credit hours are required for Software Engineering at ZUJ, and what are the 7 requirement categories?",
    mustInclude: ["133", "Mandatory", "Elective"],
    context: "133 credits across 7 tiers: Univ Compulsory 12, Univ Elective 12, Faculty Compulsory 21, Major Compulsory 67, Major Elective 15, Free 3, Remedial 3."
  }
];

async function runEvaluation() {
  console.log("=".repeat(80));
  console.log("  OLIVER AI MODEL EVALUATION & BENCHMARK SUITE");
  console.log("  Testing live local model inference against ZUJ institutional knowledge");
  console.log("=".repeat(80));

  const session = createTestSession();
  
  // 1. Authenticate as student
  console.log("\n[1/4] Authenticating as student...");
  await session.login(SEEDED_ACCOUNTS.student.email, SEEDED_ACCOUNTS.student.password);
  console.log(`  ✓ Logged in as ${SEEDED_ACCOUNTS.student.name} (${SEEDED_ACCOUNTS.student.email})`);

  // Clean up any old benchmark conversations first to keep DB pristine
  const oldConvs = await session.client.aiChat.getConversations.query();
  for (const c of oldConvs) {
    if (c.title && c.title.includes("Benchmark")) {
      try {
        await session.client.aiChat.deleteConversation.mutate(c.id);
      } catch (_) {}
    }
  }

  // 2. Check AI Engine Status
  console.log("\n[2/4] Checking AI Engine Status...");
  const status = await session.client.aiChat.getStatus.query();
  console.log(`  ✓ Mode: ${status.mode}`);
  console.log(`  ✓ Model: ${status.model || "default"}`);
  console.log(`  ✓ Provider: ${status.provider || "ollama"}`);
  console.log(`  ✓ Service Online: ${status.isOnline}`);

  // 3. Create evaluation conversation
  console.log("\n[3/4] Creating evaluation conversation session...");
  const conv = await session.client.aiChat.createConversation.mutate({
    title: "Oliver AI Benchmark Evaluation Session"
  });
  const conversationId = conv.conversationId;
  console.log(`  ✓ Created conversation ID: ${conversationId}`);

  // 4. Run test cases
  console.log("\n[4/4] Executing 7 Domain Benchmark Test Cases...");
  console.log("-".repeat(80));

  let totalScore = 0;
  const results = [];

  for (let i = 0; i < EVALUATION_CASES.length; i++) {
    const tc = EVALUATION_CASES[i];
    console.log(`\n[${i + 1}/${EVALUATION_CASES.length}] ${tc.id}: ${tc.title}`);
    console.log(`  Query: "${tc.query}"`);

    const start = Date.now();
    try {
      const response = await session.client.aiChat.sendMessage.mutate({
        conversationId,
        message: tc.query
      });
      const durationMs = Date.now() - start;
      const answer = response.response || "";

      // Evaluation criteria
      let matchedCriteria = 0;
      const missingTerms = [];

      for (const term of tc.mustInclude) {
        if (answer.toLowerCase().includes(term.toLowerCase())) {
          matchedCriteria++;
        } else {
          missingTerms.push(term);
        }
      }

      const scorePercent = Math.round((matchedCriteria / tc.mustInclude.length) * 100);
      totalScore += scorePercent;

      const isPass = scorePercent >= 66;
      console.log(`  Latency: ${durationMs}ms`);
      console.log(`  Match Score: ${scorePercent}% (${matchedCriteria}/${tc.mustInclude.length} key criteria)`);
      if (missingTerms.length > 0) {
        console.log(`  Missing Criteria: ${missingTerms.join(", ")}`);
      }
      console.log(`  Sample Response: ${answer.substring(0, 160).replace(/\n/g, " ")}...`);
      console.log(`  Result: ${isPass ? "✓ PASSED" : "✗ NEEDS IMPROVEMENT"}`);

      results.push({
        id: tc.id,
        title: tc.title,
        durationMs,
        scorePercent,
        isPass,
        answer
      });
    } catch (err) {
      console.error(`  ✗ Error querying model:`, err.message);
      results.push({
        id: tc.id,
        title: tc.title,
        durationMs: Date.now() - start,
        scorePercent: 0,
        isPass: false,
        error: err.message
      });
    }
  }

  // 5. Cleanup conversation (zero DB drift)
  console.log("\n[Cleanup] Deleting evaluation conversation for zero DB drift...");
  await session.client.aiChat.deleteConversation.mutate(conversationId);
  console.log(`  ✓ Conversation ${conversationId} deleted.`);

  // 6. Summary Report
  const avgScore = Math.round(totalScore / EVALUATION_CASES.length);
  const passedCount = results.filter(r => r.isPass).length;

  console.log("\n" + "=".repeat(80));
  console.log("  EVALUATION SUMMARY REPORT");
  console.log("=".repeat(80));
  console.log(`  Total Cases   : ${EVALUATION_CASES.length}`);
  console.log(`  Passed Cases  : ${passedCount} / ${EVALUATION_CASES.length} (${Math.round((passedCount / EVALUATION_CASES.length) * 100)}%)`);
  console.log(`  Average Score : ${avgScore}%`);
  console.log(`  Average Latency: ${Math.round(results.reduce((a, b) => a + b.durationMs, 0) / results.length)}ms`);
  console.log("=".repeat(80));

  return { avgScore, passedCount, results };
}

runEvaluation()
  .then((res) => {
    process.exit(res.passedCount >= 5 ? 0 : 1);
  })
  .catch((err) => {
    console.error("Evaluation suite fatal error:", err);
    process.exit(1);
  });
