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

// Setup: Admin changes test user to advisor
console.log("=== Setup ===");
await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));
await run("admin.updateUser", () => client.admin.updateUser.mutate({ id: 180002, role: "advisor" }));

// ========== ADVISOR ==========
console.log("\n=== ADVISOR WORKFLOW ===");
await run("auth.logout", () => client.auth.logout.mutate());
cookieJar = "";
await run("advisor.login", () => client.auth.login.mutate({ email: "test1781037416495@std-zuj.edu.jo", password: "TestPass123!" }));
await run("advisor.me", () => client.auth.me.query());
await run("advisor.getInsights", () => client.advisor.getInsights.query());
await run("advisor.getAssignedStudents", () => client.advisor.getAssignedStudents.query());
await run("advisor.getAppointments", () => client.advisor.getAppointments.query());
await run("advisor.getAlerts", () => client.advisor.getAlerts.query({}));
await run("advisor.getNotes", () => client.advisor.getNotes.query({}));
await run("advisor.getRecommendations", () => client.advisor.getRecommendations.query({}));
await run("advisor.getReports", () => client.advisor.getReports.query({}));

// Advisor views a student
await run("advisor.student.dashboard", () => client.student.dashboard.query({ studentId: 2 }));
await run("advisor.student.myCourses", () => client.student.myCourses.query({ studentId: 2 }));
await run("advisor.student.overview", () => client.student.overview.query({ studentId: 2 }));

// Cleanup
console.log("\n=== Cleanup ===");
await run("auth.logout", () => client.auth.logout.mutate());
cookieJar = "";
await run("admin.login", () => client.auth.login.mutate({ email: "abood@gmail.com", password: "Abood#2004" }));
await run("admin.restoreUser", () => client.admin.updateUser.mutate({ id: 180002, role: "student" }));

console.log(`\n=== FINAL SUMMARY: ${r.passed} passed, ${r.failed} failed ===`);
