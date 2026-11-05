import { runTier1Suite } from "./tier1-features.mjs";
import { runTier2Suite } from "./tier2-boundaries.mjs";
import { runTier3Suite } from "./tier3-cross-feature.mjs";
import { runTier4Suite } from "./tier4-scenarios.mjs";
import { runTier5Tests } from "./tier5-adversarial.mjs";
import { withDbConnection, cleanupTestRecords } from "./test-client.mjs";

const MONITORED_TABLES = [
  "users",
  "departments",
  "courses",
  "coursePrerequisites",
  "studyPlans",
  "studentCourses",
  "aiConversations",
  "chatMessages",
  "faqs",
  "documents",
  "buildings",
  "rooms",
  "announcements",
  "academicAlerts",
  "advisorNotes",
  "appointments",
];

async function captureDatabaseSnapshot() {
  return await withDbConnection(async (conn) => {
    const counts = {};
    for (const table of MONITORED_TABLES) {
      try {
        const [rows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
        counts[table] = rows[0]?.cnt ?? 0;
      } catch (err) {
        counts[table] = -1;
      }
    }
    return counts;
  });
}

function diffSnapshots(before, after) {
  const diffs = [];
  for (const table of MONITORED_TABLES) {
    const b = before[table] ?? 0;
    const a = after[table] ?? 0;
    if (b !== a) {
      diffs.push({ table, before: b, after: a, delta: a - b });
    }
  }
  return diffs;
}

export async function runAllE2ETests() {
  const suiteStartTime = Date.now();
  console.log("================================================================================");
  console.log("  MURSHID ACADEMIC GUIDANCE PLATFORM - COMPREHENSIVE E2E TEST SUITE");
  console.log("  Running 5-Tier Automated Verification against http://localhost:3000/api/trpc");
  console.log("================================================================================\n");

  // Initial cleanup of any leftover test records
  await cleanupTestRecords();

  const snapshotBefore = await captureDatabaseSnapshot();
  console.log("[DB Snapshot Before Run]: Captured row counts for 16 tables.\n");

  const tierSummaries = [];

  try {
    // Tier 1: Feature Coverage
    const t1 = await runTier1Suite();
    tierSummaries.push(t1);

    // Tier 2: Boundary & Corner Cases
    const t2 = await runTier2Suite();
    tierSummaries.push(t2);

    // Tier 3: Pairwise Cross-Feature Integration
    const t3 = await runTier3Suite();
    tierSummaries.push(t3);

    // Tier 4: Real-World Application Workflows
    const t4 = await runTier4Suite();
    tierSummaries.push(t4);

    // Tier 5: Adversarial Coverage Hardening
    const { summary: t5 } = await runTier5Tests();
    tierSummaries.push(t5);
  } finally {
    // Teardown / cleanup
    await cleanupTestRecords();
  }

  const snapshotAfter = await captureDatabaseSnapshot();
  const dbDiffs = diffSnapshots(snapshotBefore, snapshotAfter);

  const totalDuration = Date.now() - suiteStartTime;

  console.log("\n================================================================================");
  console.log("  MASTER TEST EXECUTION SUMMARY");
  console.log("================================================================================");

  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;

  for (const tier of tierSummaries) {
    totalPassed += tier.passed;
    totalFailed += tier.failed;
    totalTests += tier.total;
    const statusMark = tier.failed === 0 ? "PASSED" : "FAILED";
    console.log(
      `  * ${tier.name.padEnd(52)}: ${String(tier.passed).padStart(2)}/${String(tier.total).padEnd(2)} Passed [${statusMark}]`
    );
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(
    `  GRAND TOTAL: ${totalPassed} Passed, ${totalFailed} Failed out of ${totalTests} total tests (${totalDuration}ms)`
  );
  console.log("================================================================================");

  // Database State Drift Audit
  console.log("\n================================================================================");
  console.log("  DATABASE STATE DRIFT AUDIT (Zero Drift Verification)");
  console.log("================================================================================");

  if (dbDiffs.length === 0) {
    console.log("  [SUCCESS] 0 Database State Drift verified across all 16 monitored tables!");
    for (const [table, count] of Object.entries(snapshotAfter)) {
      console.log(`    - Table ${table.padEnd(22)}: ${count} rows (Delta: 0)`);
    }
  } else {
    console.log("  [FAIL] Database State Drift detected in following tables:");
    for (const d of dbDiffs) {
      console.log(
        `    - Table ${d.table}: Before=${d.before}, After=${d.after}, Delta=${d.delta > 0 ? "+" : ""}${d.delta}`
      );
    }
  }
  console.log("================================================================================\n");

  const allPassed = totalFailed === 0 && dbDiffs.length === 0;

  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED (100% Pass Rate, 0 DB Drift). Exit code 0.\n");
    return { success: true, totalPassed, totalFailed, totalTests, dbDiffs };
  } else {
    console.error(`❌ TEST SUITE FAILED: ${totalFailed} test failures, ${dbDiffs.length} table drift issues.\n`);
    return { success: false, totalPassed, totalFailed, totalTests, dbDiffs };
  }
}

runAllE2ETests()
  .then((res) => {
    process.exit(res.success ? 0 : 1);
  })
  .catch((err) => {
    console.error("Fatal Master Test Runner Error:", err);
    process.exit(1);
  });
