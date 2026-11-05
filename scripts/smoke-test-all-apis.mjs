import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

let cookieJar = "";

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            ...(init?.headers ?? {}),
            ...(cookieJar ? { Cookie: cookieJar } : {}),
          },
        }).then((res) => {
          const setCookie = res.headers.get("set-cookie");
          if (setCookie) {
            const match = setCookie.match(/([^=]+=[^;]+)/);
            if (match) cookieJar = match[1];
          }
          return res;
        });
      },
    }),
  ],
});

async function testEndpoint(name, fn) {
  try {
    const result = await fn();
    if (result && typeof result === "object" && "error" in result && result.error) {
      console.log(`❌ ${name}:`, result.error?.message || JSON.stringify(result.error).slice(0, 100));
      return false;
    }
    console.log(`✅ ${name}: OK`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}:`, err.message?.slice(0, 150) || String(err));
    return false;
  }
}

const results = { passed: 0, failed: 0 };

async function runTest(name, fn) {
  const ok = await testEndpoint(name, fn);
  if (ok) results.passed++;
  else results.failed++;
}

async function main() {
  console.log("=== Authenticating as Admin ===");
  cookieJar = "";
  const adminLogin = await client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" });
  console.log("Admin login:", adminLogin.success ? "✅" : "❌");
  if (!adminLogin.success) {
    console.log("Cannot proceed without admin login");
    process.exit(1);
  }

  console.log("\n=== Testing Auth & Admin Endpoints ===");
  await runTest("auth.me (admin)", () => client.auth.me.query());
  await runTest("auth.debug", () => client.auth.debug.query());
  await runTest("admin.dashboard", () => client.admin.dashboard.query());
  await runTest("documents.list", () => client.documents.list.query({}));
  await runTest("announcements.list", () => client.announcements.list.query());

  console.log("\n=== Authenticating as Student ===");
  await client.auth.logout.mutate();
  cookieJar = "";
  const studentLogin = await client.auth.login.mutate({ email: "khaled.haddad@zuj.edu.jo", password: "password123" });
  console.log("Student login:", studentLogin.success ? "✅" : "❌");
  if (!studentLogin.success) {
    console.log("Cannot proceed without student login");
    process.exit(1);
  }

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
  await runTest("notifications.list", () => client.notifications.list.query({}));
  await runTest("navigation.campus", () => client.navigation.campus.query());

  console.log("\n=== Authenticating as Advisor ===");
  await client.auth.logout.mutate();
  cookieJar = "";
  const advisorLogin = await client.auth.login.mutate({ email: "a.khalil@zuj.edu.jo", password: "password123" });
  console.log("Advisor login:", advisorLogin.success ? "✅" : "❌");
  if (!advisorLogin.success) {
    console.log("Cannot proceed without advisor login");
    process.exit(1);
  }

  console.log("\n=== Testing Advisor Endpoints ===");
  await runTest("advisor.getInsights", () => client.advisor.getInsights.query());
  const assigned = await client.advisor.getAssignedStudents.query();
  await runTest("advisor.getAssignedStudents", async () => assigned);
  const assignedStudentId = assigned[0]?.id;
  await runTest("advisor.getAppointments", () => client.advisor.getAppointments.query());
  await runTest("advisor.getAlerts", () => client.advisor.getAlerts.query({}));
  await runTest("advisor.getNotes", () => client.advisor.getNotes.query({}));
  await runTest("advisor.getRecommendations", () => client.advisor.getRecommendations.query(assignedStudentId ? { studentId: assignedStudentId } : {}));
  await runTest("advisor.getReports", () => client.advisor.getReports.query(assignedStudentId ? { studentId: assignedStudentId } : {}));

  console.log("\n=== Testing Public Endpoints ===");
  await runTest("courses.list", () => client.courses.list.query());
  await runTest("faqs.list", () => client.faqs.list.query());

  try {
    await client.auth.logout.mutate();
  } catch {}

  console.log("\n=== Summary ===");
  console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in smoke-test-all-apis:", err);
  process.exit(1);
});
