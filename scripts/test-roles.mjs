import "dotenv/config";
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

let failed = 0;

async function testLogin(email, password, expectedRole) {
  console.log(`\n=== Testing ${expectedRole} login: ${email} ===`);
  try {
    const result = await client.auth.login.mutate({ email, password });
    if (result.success && result.user?.role === expectedRole) {
      console.log(`✅ ${expectedRole} login works! Role:`, result.user?.role);
    } else {
      console.log(`❌ ${expectedRole} login failed. Result:`, result);
      failed++;
    }
  } catch (err) {
    console.error(`❌ ${expectedRole} login error:`, err.message);
    failed++;
  }
}

async function main() {
  // Test all roles
  await testLogin("abood@gmail.com", "Abood#2004", "admin");
  await testLogin("a.khalil@zuj.edu.jo", "password123", "advisor");
  await testLogin("khaled.haddad@zuj.edu.jo", "password123", "student");

  console.log(`\n=== Role tests complete: ${failed === 0 ? "ALL PASSED" : `${failed} FAILED`} ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in test-roles:", err);
  process.exit(1);
});
