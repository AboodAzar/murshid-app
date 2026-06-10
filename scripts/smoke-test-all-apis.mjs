import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: superjson,
    }),
  ],
});

async function testEndpoint(name, fn) {
  try {
    const result = await fn();
    if (result && typeof result === 'object' && 'error' in result && result.error) {
      console.log(`❌ ${name}:`, result.error?.message || JSON.stringify(result.error).slice(0, 100));
      return false;
    }
    console.log(`✅ ${name}: OK`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}:`, err.message.slice(0, 150));
    return false;
  }
}

// Login as admin first
console.log("=== Authenticating as admin ===");
const login = await client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" });
console.log("Admin login:", login.success ? "✅" : "❌");

if (!login.success) {
  console.log("Cannot proceed without admin login");
  process.exit(1);
}

const results = { passed: 0, failed: 0 };

async function runTest(name, fn) {
  const ok = await testEndpoint(name, fn);
  if (ok) results.passed++; else results.failed++;
}

console.log("\n=== Testing Auth Endpoints ===");
await runTest("auth.me", () => client.auth.me.query());
await runTest("auth.debug", () => client.auth.debug.query());

console.log("\n=== Testing Admin Endpoints ===");
await runTest("admin.dashboard", () => client.admin.dashboard.query());

console.log("\n=== Testing Student Endpoints ===");
await runTest("student.dashboard", () => client.student.dashboard.query());
await runTest("student.myCourses", () => client.student.myCourses.query());
await runTest("student.todaySchedule", () => client.student.todaySchedule.query());
await runTest("student.academicAlerts", () => client.student.academicAlerts.query());
await runTest("student.overview", () => client.student.overview.query());
await runTest("student.fullSchedule", () => client.student.fullSchedule.query());
await runTest("student.assignments", () => client.student.assignments.query());
await runTest("student.attendance", () => client.student.attendance.query());
await runTest("student.studentAnnouncements", () => client.student.studentAnnouncements.query());

console.log("\n=== Testing Advisor Endpoints ===");
await runTest("advisor.dashboard", () => client.advisor.dashboard.query());

console.log("\n=== Testing Other Endpoints ===");
await runTest("courses.list", () => client.courses.list.query());
await runTest("announcements.list", () => client.announcements.list.query());
await runTest("navigation.campus", () => client.navigation.campus.query());
await runTest("faqs.list", () => client.faqs.list.query());
await runTest("documents.list", () => client.documents.list.query());
await runTest("notifications.list", () => client.notifications.list.query());

console.log("\n=== Summary ===");
console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);
