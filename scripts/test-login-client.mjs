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

async function testLogin(email, password) {
  try {
    const result = await client.auth.login.mutate({ email, password });
    console.log("Login result:", JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.error("Login error:", err.message);
    console.error("Full error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

await testLogin("abood@gmail.com", "Abood#2004");
