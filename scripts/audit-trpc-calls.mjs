import fs from "fs";
import path from "path";

// Extract all tRPC calls from client
function findTrpcCalls(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      findTrpcCalls(fullPath, results);
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      const content = fs.readFileSync(fullPath, "utf8");
      const matches = content.matchAll(/trpc\.(\w+)\.(\w+)\.(useQuery|useMutation|useInfiniteQuery)/g);
      for (const m of matches) {
        results.push({ router: m[1], endpoint: m[2], file: fullPath.replace(process.cwd(), "") });
      }
    }
  }
  return results;
}

// Extract all router endpoints from server
function findRouterEndpoints(dir, results = {}) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findRouterEndpoints(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const routerMatch = content.match(/export const (\w+)Router = router\(\{/);
      if (routerMatch) {
        const routerName = routerMatch[1].toLowerCase();
        const endpointMatches = content.matchAll(/^\s+(\w+):\s+(protectedProcedure|publicProcedure|adminProcedure|advisorProcedure)/gm);
        results[routerName] = [];
        for (const m of endpointMatches) {
          results[routerName].push(m[1]);
        }
      }
    }
  }
  return results;
}

const clientCalls = findTrpcCalls("client/src");
const serverEndpoints = findRouterEndpoints("server/routers");

// Add system router endpoints
serverEndpoints["system"] = []; // system router is in server/_core/systemRouter.ts

// Check for mismatches
console.log("=== Frontend tRPC Calls Audit ===\n");
const missing = [];
const seen = new Set();
for (const call of clientCalls) {
  const key = `${call.router}.${call.endpoint}`;
  if (seen.has(key)) continue;
  seen.add(key);
  
  const endpoints = serverEndpoints[call.router];
  if (!endpoints) {
    missing.push({ ...call, reason: "Router not found" });
  } else if (!endpoints.includes(call.endpoint)) {
    missing.push({ ...call, reason: "Endpoint not found" });
  }
}

if (missing.length === 0) {
  console.log("✅ All frontend tRPC calls match backend endpoints");
} else {
  console.log(`❌ ${missing.length} mismatches found:\n`);
  for (const m of missing) {
    console.log(`  ${m.router}.${m.endpoint} - ${m.reason} (${m.file})`);
  }
}

console.log("\n=== Server Routers ===");
for (const [router, endpoints] of Object.entries(serverEndpoints)) {
  console.log(`  ${router}: [${endpoints.join(", ")}]`);
}
