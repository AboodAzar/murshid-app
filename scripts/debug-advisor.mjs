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

await client.auth.login.mutate({ email: "nesreen@gmail.com", password: "password123" });
try {
  const students = await client.advisor.getAssignedStudents.query();
  console.log("Success:", students.length, "students");
} catch (err) {
  console.log("Error:", err.message);
  console.log("Full:", err);
}
