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

async function main() {
  // Reset advisor password
  try {
    await client.auth.createTestUser.mutate({
      email: "nesreen@gmail.com",
      password: "password123",
      name: "Nesreen",
      role: "advisor",
    });
    console.log("✅ Advisor password reset");
  } catch (e) {
    console.log("❌ Failed:", e.message);
  }
}

main();
