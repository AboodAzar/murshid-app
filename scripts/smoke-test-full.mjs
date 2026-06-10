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
      console.log(`❌ ${name}:`, result.error?.message?.slice(0, 120));
      return false;
    }
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.log(`❌ ${name}:`, err.message?.slice(0, 120));
    return false;
  }
}

const r = { passed: 0, failed: 0 };
async function run(name, fn) { if (await test(name, fn)) r.passed++; else r.failed++; }

console.log("=== Admin Workflow Test ===");
await run("auth.login (admin)", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));

// Admin views student dashboard
await run("Admin -> student.dashboard", () => client.student.dashboard.query());
await run("Admin -> student.myCourses", () => client.student.myCourses.query());
await run("Admin -> student.overview", () => client.student.overview.query());

// Admin uses admin endpoints
await run("Admin -> admin.dashboard", () => client.admin.dashboard.query());
await run("Admin -> admin.updateUser", () => client.admin.updateUser.mutate({ id: 2, name: "Test Update" }));

// Admin views advisor data
await run("Admin -> advisor.getInsights", () => client.advisor.getInsights.query());
await run("Admin -> advisor.getAssignedStudents", () => client.advisor.getAssignedStudents.query());

console.log("\n=== Student Workflow Test ===");
// Student login
await run("auth.logout", () => client.auth.logout.mutate());
cookieJar = "";
await run("auth.login (student)", () => client.auth.login.mutate({ email: "noorhussein@gmail.com", password: "password123" }));

await run("Student -> student.dashboard", () => client.student.dashboard.query());
await run("Student -> student.myCourses", () => client.student.myCourses.query());
await run("Student -> student.todaySchedule", () => client.student.todaySchedule.query());
await run("Student -> student.academicAlerts", () => client.student.academicAlerts.query());
await run("Student -> student.overview", () => client.student.overview.query());
await run("Student -> courses.list", () => client.courses.list.query());

console.log("\n=== Advisor Workflow Test ===");
await run("auth.logout", () => client.auth.logout.mutate());
cookieJar = "";
await run("auth.login (advisor)", () => client.auth.login.mutate({ email: "nesreen@gmail.com", password: "password123" }));

await run("Advisor -> advisor.getInsights", () => client.advisor.getInsights.query());
await run("Advisor -> advisor.getAssignedStudents", () => client.advisor.getAssignedStudents.query());
await run("Advisor -> advisor.getAppointments", () => client.advisor.getAppointments.query());
await run("Advisor -> advisor.getAlerts", () => client.advisor.getAlerts.query({}));
await run("Advisor -> advisor.getNotes", () => client.advisor.getNotes.query({}));

// Advisor views student data
await run("Advisor -> student.dashboard (own student)", () => client.student.dashboard.query({ studentId: 2 }));
await run("Advisor -> student.myCourses (own student)", () => client.student.myCourses.query({ studentId: 2 }));

console.log(`\n=== Summary: ${r.passed} passed, ${r.failed} failed ===`);
