const res = await fetch("http://localhost:3000/api/trpc/auth.debug");
const text = await res.text();
console.log("Status:", res.status);
console.log("Body:", text);
