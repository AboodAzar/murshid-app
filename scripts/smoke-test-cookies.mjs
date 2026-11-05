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
    if (result && typeof result === 'object' && 'error' in result) {
      console.log(`❌ ${name}:`, result.error?.message || JSON.stringify(result.error).slice(0, 120));
      return false;
    }
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}:`, err.message?.slice(0, 120) || String(err).slice(0, 120));
    return false;
  }
}

const r = { passed: 0, failed: 0 };
async function run(name, fn) { if (await test(name, fn)) r.passed++; else r.failed++; }

async function main() {
  console.log("=== Login ===");
  await run("auth.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));

  console.log("\n=== Auth ===");
  await run("auth.me", () => client.auth.me.query());
  await run("auth.debug", () => client.auth.debug.query());

  console.log("\n=== Admin ===");
  await run("admin.dashboard", () => client.admin.dashboard.query());

  console.log("\n=== Student ===");
  await run("student.dashboard", () => client.student.dashboard.query());
  await run("student.myCourses", () => client.student.myCourses.query());
  await run("student.todaySchedule", () => client.student.todaySchedule.query());
  await run("student.academicAlerts", () => client.student.academicAlerts.query());
  await run("student.overview", () => client.student.overview.query());
  await run("student.fullSchedule", () => client.student.fullSchedule.query());
  await run("student.assignments", () => client.student.assignments.query());
  await run("student.attendance", () => client.student.attendance.query());
  await run("student.studentAnnouncements", () => client.student.studentAnnouncements.query());
  await run("student.courseDetails", () => client.student.courseDetails.query({ courseId: 1 }));

  console.log("\n=== Advisor ===");
  await run("advisor.getInsights", () => client.advisor.getInsights.query());
  await run("advisor.getAssignedStudents", () => client.advisor.getAssignedStudents.query());
  await run("advisor.getAppointments", () => client.advisor.getAppointments.query());
  await run("advisor.getAlerts", () => client.advisor.getAlerts.query({}));
  await run("advisor.getNotes", () => client.advisor.getNotes.query({}));
  await run("advisor.getRecommendations", () => client.advisor.getRecommendations.query({}));
  await run("advisor.getReports", () => client.advisor.getReports.query({}));

  console.log("\n=== Other ===");
  await run("courses.list", () => client.courses.list.query());
  await run("announcements.list", () => client.announcements.list.query());
  await run("navigation.campus", () => client.navigation.campus.query());
  await run("faqs.list", () => client.faqs.list.query());
  await run("documents.list", () => client.documents.list.query({}));
  await run("notifications.list", () => client.notifications.list.query({}));
  await run("preferences.getNotificationPreferences", () => client.preferences.getNotificationPreferences.query());

  try {
    await client.auth.logout.mutate();
  } catch {}

  console.log(`\n=== Summary: ${r.passed} passed, ${r.failed} failed ===`);
  process.exit(r.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in smoke-test-cookies:", err);
  process.exit(1);
});


