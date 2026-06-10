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

async function tryLogin(email, password) {
  try {
    await client.auth.login.mutate({ email, password });
    const me = await client.auth.me.query();
    console.log(`✅ ${email} logged in as ${me.role}`);
    cookieJar = "";
    return true;
  } catch (e) {
    console.log(`❌ ${email}: ${e.message?.slice(0, 80)}`);
    cookieJar = "";
    return false;
  }
}

await tryLogin("abood@gmail.com", "Abood#2004");
await tryLogin("nesreen@gmail.com", "password123");
await tryLogin("test1781037416495@std-zuj.edu.jo", "TestPass123!");
