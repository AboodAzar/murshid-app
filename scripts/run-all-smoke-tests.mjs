import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const testSuites = [
  { name: "Database Schema Validation", script: "scripts/validate-db.mjs" },
  { name: "Full API Coverage Smoke Test", script: "scripts/smoke-test-all-apis.mjs" },
  { name: "Multi-Role Workflow Smoke Test (v1)", script: "scripts/final-smoke-test.mjs" },
  { name: "Multi-Role Workflow Smoke Test (v2)", script: "scripts/final-smoke-test-v2.mjs" },
  { name: "End-to-End Workflow Smoke Test", script: "scripts/smoke-test-full.mjs" },
  { name: "Student Portal Workflow Smoke Test", script: "scripts/smoke-test-student.mjs" },
  { name: "Cookie Persistence Smoke Test", script: "scripts/smoke-test-cookies.mjs" },
  { name: "Advisor Workflow & Boundary Check", script: "scripts/test-advisor-workflow.mjs" },
  { name: "E2E Advisor Assignment & Roster", script: "scripts/e2e-advisor-assignment.mjs" },
  { name: "Role Authentication Verification", script: "scripts/test-roles.mjs" },
  { name: "Raw Cookie Flow Verification", script: "scripts/test-cookie-flow.mjs" },
];

function runScript(suite) {
  return new Promise((resolve) => {
    const fullPath = path.resolve(rootDir, suite.script);
    const start = Date.now();
    console.log(`\n========================================================`);
    console.log(`▶ RUNNING: ${suite.name} (${suite.script})`);
    console.log(`========================================================`);

    const proc = spawn(process.execPath, [fullPath], {
      cwd: rootDir,
      env: { ...process.env },
      stdio: ["inherit", "pipe", "pipe"],
    });

    let output = "";
    proc.stdout.on("data", (data) => {
      process.stdout.write(data);
      output += data.toString();
    });

    proc.stderr.on("data", (data) => {
      process.stderr.write(data);
      output += data.toString();
    });

    proc.on("close", (code) => {
      const durationMs = Date.now() - start;
      const passed = code === 0;
      if (passed) {
        console.log(`\n✔ PASSED: ${suite.name} (${durationMs}ms)`);
      } else {
        console.log(`\n✖ FAILED: ${suite.name} (exit code ${code}, ${durationMs}ms)`);
      }
      resolve({
        name: suite.name,
        script: suite.script,
        passed,
        code,
        durationMs,
      });
    });

    proc.on("error", (err) => {
      const durationMs = Date.now() - start;
      console.error(`\n✖ ERROR starting ${suite.name}:`, err.message);
      resolve({
        name: suite.name,
        script: suite.script,
        passed: false,
        code: 1,
        durationMs,
      });
    });
  });
}

async function main() {
  console.log("========================================================");
  console.log("  MURSHID ACADEMIC GUIDANCE PLATFORM");
  console.log("  MASTER SMOKE TEST RUNNER (MILESTONE 3)");
  console.log("========================================================");

  const startTime = Date.now();
  const results = [];

  for (const suite of testSuites) {
    const result = await runScript(suite);
    results.push(result);
  }

  const totalTime = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n========================================================");
  console.log("  SMOKE TEST EXECUTION SUMMARY");
  console.log("========================================================");
  for (const r of results) {
    const icon = r.passed ? "✔ PASS" : "✖ FAIL";
    console.log(`  [${icon}]  ${r.name.padEnd(40)} (${r.durationMs}ms)`);
  }
  console.log("--------------------------------------------------------");
  console.log(`Total Suites : ${results.length}`);
  console.log(`Passed       : ${passedCount}`);
  console.log(`Failed       : ${failedCount}`);
  console.log(`Total Time   : ${(totalTime / 1000).toFixed(2)}s`);
  console.log("========================================================");

  if (failedCount > 0) {
    console.log("❌ ONE OR MORE SMOKE TEST SUITES FAILED.");
    process.exitCode = 1;
  } else {
    console.log("✅ ALL SMOKE TEST SUITES PASSED CLEANLY.");
    process.exitCode = 0;
  }
}

main().catch((err) => {
  console.error("Fatal error in test runner:", err);
  process.exitCode = 1;
});
