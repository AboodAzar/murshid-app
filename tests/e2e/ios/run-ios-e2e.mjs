import { runTier1FeatureCoverageSuite } from "./tier1-feature-coverage.test.mjs";
import { runTier2BoundaryCornerSuite } from "./tier2-boundary-corner.test.mjs";
import { runTier3CrossFeatureSuite } from "./tier3-cross-feature.test.mjs";
import { runTier4ApplicationScenariosSuite } from "./tier4-application-scenarios.test.mjs";
import { withDbConnection, cleanupTestRecords } from "./helpers/test-client.mjs";

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
  if (!before || !after) return [];
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

export async function runAllIosE2ETests() {
  const suiteStartTime = Date.now();
  console.log("================================================================================");
  console.log("  MURSHID NATIVE IOS CAPACITOR - MASTER E2E TEST RUNNER");
  console.log("  Executing Tiers 1-4 Verification Suite (Features 1 to 12)");
  console.log("================================================================================\n");

  const args = process.argv.slice(2);
  const tierFilter = args.find((a) => a.startsWith("--tier="))?.split("=")[1];

  // Pre-test DB cleanup
  await cleanupTestRecords();
  const snapshotBefore = await captureDatabaseSnapshot();
  if (snapshotBefore) {
    console.log("[DB Pre-Check] Database snapshot captured for 16 tables.\n");
  }

  const tierSummaries = [];

  try {
    if (!tierFilter || tierFilter === "1") {
      const t1 = await runTier1FeatureCoverageSuite();
      tierSummaries.push(t1);
    }

    if (!tierFilter || tierFilter === "2") {
      const t2 = await runTier2BoundaryCornerSuite();
      tierSummaries.push(t2);
    }

    if (!tierFilter || tierFilter === "3") {
      const t3 = await runTier3CrossFeatureSuite();
      tierSummaries.push(t3);
    }

    if (!tierFilter || tierFilter === "4") {
      const t4 = await runTier4ApplicationScenariosSuite();
      tierSummaries.push(t4);
    }
  } finally {
    // Post-test DB cleanup
    await cleanupTestRecords();
  }

  const snapshotAfter = await captureDatabaseSnapshot();
  const dbDiffs = diffSnapshots(snapshotBefore, snapshotAfter);

  const totalDuration = Date.now() - suiteStartTime;

  console.log("\n================================================================================");
  console.log("  MASTER TEST EXECUTION SUMMARY (MURSHID NATIVE IOS CAPACITOR)");
  console.log("================================================================================");

  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;

  for (const summary of tierSummaries) {
    totalPassed += summary.passed;
    totalFailed += summary.failed;
    totalTests += summary.total;
    const statusTag = summary.failed === 0 ? "[PASSED]" : "[FAILED]";
    console.log(
      `  * ${summary.name.padEnd(54)}: ${String(summary.passed).padStart(2)}/${String(summary.total).padEnd(2)} Passed ${statusTag}`
    );
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(
    `  GRAND TOTAL: ${totalPassed} Passed, ${totalFailed} Failed out of ${totalTests} total tests (${totalDuration}ms)`
  );
  console.log("================================================================================\n");

  if (snapshotAfter) {
    console.log("================================================================================");
    console.log("  DATABASE STATE DRIFT AUDIT (Zero Drift Verification)");
    console.log("================================================================================");
    if (dbDiffs.length === 0) {
      console.log("  [SUCCESS] 0 Database State Drift verified across all 16 monitored tables!");
    } else {
      console.log("  [FAIL] Database State Drift detected in following tables:");
      for (const d of dbDiffs) {
        console.log(`    - Table ${d.table}: Before=${d.before}, After=${d.after}, Delta=${d.delta > 0 ? "+" : ""}${d.delta}`);
      }
    }
    console.log("================================================================================\n");
  }

  const allPassed = totalFailed === 0 && dbDiffs.length === 0;

  if (allPassed) {
    console.log("🎉 ALL IOS E2E TESTS PASSED (100% Pass Rate). Exit code 0.\n");
    return { success: true, totalPassed, totalFailed, totalTests, dbDiffs };
  } else {
    console.log(`⚠️ IOS E2E TEST SUITE: ${totalPassed} passed, ${totalFailed} failed out of ${totalTests} tests.\n`);
    return { success: false, totalPassed, totalFailed, totalTests, dbDiffs };
  }
}

// Self-invoking execution when run directly
if (process.argv[1] && process.argv[1].endsWith("run-ios-e2e.mjs")) {
  runAllIosE2ETests()
    .then((res) => {
      process.exit(res.success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Fatal Master Test Runner Error:", err);
      process.exit(1);
    });
}
