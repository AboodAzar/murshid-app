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

console.log("=== Student Workflow Test ===");
await run("student.login", () => client.auth.login.mutate({ email: "test1781037416495@std-zuj.edu.jo", password: "TestPass123!" }));

await run("student.dashboard", () => client.student.dashboard.query());
await run("student.myCourses", () => client.student.myCourses.query());
await run("student.todaySchedule", () => client.student.todaySchedule.query());
await run("student.academicAlerts", () => client.student.academicAlerts.query());
await run("student.overview", () => client.student.overview.query());
await run("student.fullSchedule", () => client.student.fullSchedule.query());
await run("student.assignments", () => client.student.assignments.query());
await run("student.attendance", () => client.student.attendance.query());
await run("student.studentAnnouncements", () => client.student.studentAnnouncements.query());

await run("courses.list", () => client.courses.list.query());
await run("announcements.list", () => client.announcements.list.query());
await run("navigation.campus", () => client.navigation.campus.query());
await run("faqs.list", () => client.faqs.list.query());
await run("documents.list", () => client.documents.list.query());
await run("notifications.list", () => client.notifications.list.query());

// Test AI Chat
await run("aiChat.getConversations", () => client.aiChat.getConversations.query());
await run("aiChat.createConversation", () => client.aiChat.createConversation.mutate());

// Test preferences
await run("preferences.getNotificationPreferences", () => client.preferences.getNotificationPreferences.query());
await run("preferences.setLanguage", () => client.preferences.setLanguage.mutate("ar"));

console.log(`\n=== Summary: ${r.passed} passed, ${r.failed} failed ===`);
