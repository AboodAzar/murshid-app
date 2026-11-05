import "dotenv/config";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import mysql from "mysql2/promise";

export const BASE_URL = process.env.TEST_API_URL || "http://localhost:3000/api/trpc";

export const SEEDED_ACCOUNTS = {
  admin: {
    email: "abood@gmail.com",
    password: "Abood#2004",
    name: "System Admin",
    role: "admin",
  },
  advisor: {
    email: "a.khalil@zuj.edu.jo",
    password: "password123",
    name: "Dr. Ahmad Khalil",
    role: "advisor",
  },
  student: {
    email: "khaled.haddad@zuj.edu.jo",
    password: "password123",
    name: "Khaled Haddad",
    role: "student",
  },
  studentLina: {
    email: "lina.omar@zuj.edu.jo",
    password: "password123",
    name: "Lina Omar",
    role: "student",
  },
};

/**
 * Creates an isolated HTTP session with its own cookie jar and tRPC client.
 */
export function createTestSession(url = BASE_URL) {
  let cookieJar = "";

  const client = createTRPCClient({
    links: [
      httpBatchLink({
        url,
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
              if (match) {
                cookieJar = match[1];
              }
            }
            return res;
          });
        },
      }),
    ],
  });

  return {
    client,
    getCookie: () => cookieJar,
    setCookie: (cookie) => {
      cookieJar = cookie;
    },
    clearCookie: () => {
      cookieJar = "";
    },
    async login(email, password) {
      this.clearCookie();
      const res = await client.auth.login.mutate({ email, password });
      return res;
    },
    async logout() {
      try {
        await client.auth.logout.mutate();
      } catch {
        // Ignore logout network errors
      } finally {
        this.clearCookie();
      }
    },
  };
}

/**
 * Assertion utilities for opaque-box E2E testing
 */
export function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
    );
  }
}

export async function assertThrows(fn, expectedSubstr = "") {
  try {
    await fn();
  } catch (err) {
    const msg = err.message || String(err);
    if (expectedSubstr && !msg.toLowerCase().includes(expectedSubstr.toLowerCase())) {
      throw new Error(
        `Expected rejection containing "${expectedSubstr}", but got: "${msg}"`
      );
    }
    return err;
  }
  throw new Error(`Expected async function to throw/reject, but it succeeded.`);
}

/**
 * Lightweight test suite runner
 */
export class TestSuite {
  constructor(name) {
    this.name = name;
    this.results = [];
  }

  async test(testName, fn) {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      console.log(`  [PASS] ${testName} (${duration}ms)`);
      this.results.push({ name: testName, status: "PASS", duration });
      return true;
    } catch (err) {
      const duration = Date.now() - start;
      const errorMsg = err.message || String(err);
      console.log(`  [FAIL] ${testName} (${duration}ms) -> ${errorMsg}`);
      this.results.push({ name: testName, status: "FAIL", duration, error: errorMsg });
      return false;
    }
  }

  summary() {
    const passed = this.results.filter((r) => r.status === "PASS").length;
    const failed = this.results.filter((r) => r.status === "FAIL").length;
    const total = this.results.length;
    return { name: this.name, passed, failed, total, results: this.results };
  }
}

/**
 * Execute callback with a managed MariaDB connection
 */
export async function withDbConnection(fn) {
  if (!process.env.DATABASE_URL) return null;
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    return await fn(conn);
  } finally {
    await conn.end();
  }
}

/**
 * Teardown any dangling E2E test rows to ensure 0 state drift
 */
export async function cleanupTestRecords() {
  if (!process.env.DATABASE_URL) return;
  await withDbConnection(async (conn) => {
    await conn.query("DELETE FROM appointments WHERE title LIKE 'E2E-%'");
    await conn.query("DELETE FROM academicAlerts WHERE title LIKE 'E2E-%'");
    await conn.query("DELETE FROM advisorNotes WHERE title LIKE 'E2E-%'");
    await conn.query("DELETE FROM announcements WHERE title LIKE 'E2E-%'");
    await conn.query("DELETE FROM chatMessages WHERE content LIKE '%E2E-%'");
    await conn.query("DELETE FROM aiConversations WHERE title LIKE '%E2E-%'");
  });
}

