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
  // ========== ADMIN ==========
  console.log("=== ADMIN WORKFLOW ===");
  await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));
  await run("admin.me", () => client.auth.me.query());
  await run("admin.dashboard", () => client.admin.dashboard.query());
  await run("admin.student.dashboard", () => client.student.dashboard.query());
  await run("admin.student.myCourses", () => client.student.myCourses.query());
  await run("admin.advisor.getInsights", () => client.advisor.getInsights.query());
  await run("admin.advisor.getAssignedStudents", () => client.advisor.getAssignedStudents.query());
  await run("admin.announcements.list", () => client.announcements.list.query());
  await run("admin.courses.list", () => client.courses.list.query());
  await run("admin.navigation.campus", () => client.navigation.campus.query());

  // ========== STUDENT ==========
  console.log("\n=== STUDENT WORKFLOW ===");
  await run("auth.logout", () => client.auth.logout.mutate());
  cookieJar = "";
  await run("student.login", () => client.auth.login.mutate({ email: "khaled.haddad@zuj.edu.jo", password: "password123" }));
  await run("student.me", () => client.auth.me.query());
  await run("student.dashboard", () => client.student.dashboard.query());
  await run("student.myCourses", () => client.student.myCourses.query());
  await run("student.todaySchedule", () => client.student.todaySchedule.query());
  await run("student.academicAlerts", () => client.student.academicAlerts.query());
  await run("student.overview", () => client.student.overview.query());
  await run("student.fullSchedule", () => client.student.fullSchedule.query());
  await run("student.assignments", () => client.student.assignments.query());
  await run("student.attendance", () => client.student.attendance.query());
  await run("student.studentAnnouncements", () => client.student.studentAnnouncements.query());
  await run("student.announcements.list", () => client.announcements.list.query());
  await run("student.courses.list", () => client.courses.list.query());
  await run("student.navigation.campus", () => client.navigation.campus.query());
  await run("student.notifications.list", () => client.notifications.list.query({}));
  await run("student.faqs.list", () => client.faqs.list.query());
  await run("student.aiChat.getConversations", () => client.aiChat.getConversations.query());
  await run("student.aiChat.createConversation", () => client.aiChat.createConversation.mutate({}));
  await run("student.preferences.getNotificationPreferences", () => client.preferences.getNotificationPreferences.query());

  // ========== ADVISOR ==========
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

  // Advisor views an assigned student
  await run("advisor.student.dashboard", () => client.student.dashboard.query({ studentId: adviseeId }));
  await run("advisor.student.myCourses", () => client.student.myCourses.query({ studentId: adviseeId }));
  await run("advisor.student.overview", () => client.student.overview.query({ studentId: adviseeId }));

  try {
    await client.auth.logout.mutate();
  } catch {}

  console.log(`\n=== FINAL SUMMARY: ${r.passed} passed, ${r.failed} failed ===`);
  process.exit(r.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in final-smoke-test:", err);
  process.exit(1);
});
