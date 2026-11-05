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

async function test(name, fn) {
  try {
    const result = await fn();
    if (result && typeof result === "object" && "error" in result && result.error) {
      console.log(`❌ ${name}:`, result.error?.message?.slice(0, 120));
      return false;
    }
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}:`, err.message?.slice(0, 120) || String(err));
    return false;
  }
}

const r = { passed: 0, failed: 0 };
async function run(name, fn) {
  if (await test(name, fn)) r.passed++;
  else r.failed++;
}

async function main() {
  // ========== ADMIN SETUP ==========
  console.log("=== Setup: Admin Verification ===");
  await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));
  const adminDash = await client.admin.dashboard.query();
  await run("admin.dashboard", async () => adminDash);

  // ========== ADVISOR WORKFLOW ==========
  console.log("\n=== ADVISOR WORKFLOW ===");
  await run("auth.logout", () => client.auth.logout.mutate());
  cookieJar = "";
  await run("advisor.login", () => client.auth.login.mutate({ email: "a.khalil@zuj.edu.jo", password: "password123" }));
  await run("advisor.me", () => client.auth.me.query());
  await run("advisor.getInsights", () => client.advisor.getInsights.query());
  const assigned = await client.advisor.getAssignedStudents.query();
  await run("advisor.getAssignedStudents", async () => assigned);
  const adviseeId = assigned[0]?.id ?? 210027;

  await run("advisor.getAppointments", () => client.advisor.getAppointments.query());
  await run("advisor.getAlerts", () => client.advisor.getAlerts.query({}));
  await run("advisor.getNotes", () => client.advisor.getNotes.query({}));
  await run("advisor.getRecommendations", () => client.advisor.getRecommendations.query({ studentId: adviseeId }));
  await run("advisor.getReports", () => client.advisor.getReports.query({ studentId: adviseeId }));

  // Advisor views assigned student details
  await run("advisor.student.dashboard", () => client.student.dashboard.query({ studentId: adviseeId }));
  await run("advisor.student.myCourses", () => client.student.myCourses.query({ studentId: adviseeId }));
  await run("advisor.student.overview", () => client.student.overview.query({ studentId: adviseeId }));

  // ========== STUDENT WORKFLOW ==========
  console.log("\n=== STUDENT WORKFLOW ===");
  await run("auth.logout", () => client.auth.logout.mutate());
  cookieJar = "";
  await run("student.login", () => client.auth.login.mutate({ email: "khaled.haddad@zuj.edu.jo", password: "password123" }));
  await run("student.me", () => client.auth.me.query());
  await run("student.dashboard", () => client.student.dashboard.query());
  await run("student.myCourses", () => client.student.myCourses.query());
  await run("student.todaySchedule", () => client.student.todaySchedule.query());
  await run("student.academicAlerts", () => client.student.academicAlerts.query());

  // Cleanup
  console.log("\n=== Cleanup ===");
  await run("auth.logout", () => client.auth.logout.mutate());
  cookieJar = "";
  await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));
  await run("admin.verifySession", () => client.auth.me.query());
  try {
    await client.auth.logout.mutate();
  } catch {}

  console.log(`\n=== FINAL SUMMARY: ${r.passed} passed, ${r.failed} failed ===`);
  process.exit(r.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in final-smoke-test-v2:", err);
  process.exit(1);
});
