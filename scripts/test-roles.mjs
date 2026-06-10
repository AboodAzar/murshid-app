import "dotenv/config";
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

async function testLogin(email, password, expectedRole) {
  console.log(`\n=== Testing ${expectedRole} login: ${email} ===`);
  try {
    const result = await client.auth.login.mutate({ email, password });
    console.log("Result:", result);
    if (result.success) {
      console.log(`✅ ${expectedRole} login works! Role:`, result.user?.role);
    } else {
      console.log(`❌ ${expectedRole} login failed`);
    }
  } catch (err) {
    console.error(`❌ ${expectedRole} login error:`, err.message);
  }
}

// Test all roles
await testLogin("abood@gmail.com", "Abood#2004", "admin");
await testLogin("nesreen@gmail.com", "somepassword", "advisor");
await testLogin("noorhussein@gmail.com", "somepassword", "student");

console.log("\n=== Role tests complete ===");
