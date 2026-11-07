import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, "../../../..");

export const BASE_URL = process.env.TEST_API_URL || "http://localhost:3000/api/trpc";
export const BACKEND_HOST = process.env.TEST_SERVER_HOST || "http://localhost:3000";

export const SEEDED_ACCOUNTS = {
  hanan: {
    id: 240002,
    email: "hanan@gmail.com",
    password: "password123",
    name: "Hanan",
    role: "student",
  },
  khaled: {
    id: 210027,
    email: "khaled.haddad@zuj.edu.jo",
    password: "password123",
    name: "Khaled Haddad",
    role: "student",
  },
  basma: {
    id: 210029,
    email: "basma.hassan@zuj.edu.jo",
    password: "password123",
    name: "Basma Hassan",
    role: "student",
  },
  advisor: {
    id: 210024,
    email: "a.khalil@zuj.edu.jo",
    password: "password123",
    name: "Dr. Ahmad Khalil",
    role: "advisor",
  },
  admin: {
    id: 1,
    email: "abood@gmail.com",
    password: "password123",
    name: "Abood",
    role: "admin",
  },
};

/**
 * Standard Assertion Helpers
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

export function assertNotEqual(actual, unexpected, message) {
  if (actual === unexpected) {
    throw new Error(
      message || `Expected actual NOT to equal ${JSON.stringify(unexpected)}`
    );
  }
}

export function assertContains(haystack, needle, message) {
  if (typeof haystack === "string") {
    if (!haystack.includes(needle)) {
      throw new Error(
        message || `Expected string to contain "${needle}" but was not found.`
      );
    }
  } else if (Array.isArray(haystack)) {
    if (!haystack.includes(needle)) {
      throw new Error(
        message || `Expected array to contain item ${JSON.stringify(needle)}.`
      );
    }
  } else {
    throw new Error(message || `Target is neither string nor array.`);
  }
}

export function assertNotContains(haystack, forbidden, message) {
  if (typeof haystack === "string") {
    if (haystack.includes(forbidden)) {
      throw new Error(
        message || `Forbidden substring "${forbidden}" found in text.`
      );
    }
  } else if (Array.isArray(haystack)) {
    if (haystack.includes(forbidden)) {
      throw new Error(
        message || `Forbidden item ${JSON.stringify(forbidden)} found in array.`
      );
    }
  }
}

export function assertMatches(str, regex, message) {
  if (!regex.test(str)) {
    throw new Error(
      message || `Expected text to match pattern ${regex.toString()}`
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
 * Lightweight structured TestSuite class
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
 * iOS Test Session supporting Cookie and Bearer Token Authentication
 */
export function createIosTestSession(url = BASE_URL) {
  let cookieJar = "";
  let bearerToken = "";
  let origin = "capacitor://localhost";

  const client = createTRPCClient({
    links: [
      httpBatchLink({
        url,
        transformer: superjson,
        fetch(input, init) {
          const headers = {
            ...(init?.headers ?? {}),
            Origin: origin,
            ...(cookieJar ? { Cookie: cookieJar } : {}),
            ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
          };

          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers,
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
    getBearerToken: () => bearerToken,
    setBearerToken: (token) => {
      bearerToken = token;
    },
    clearBearerToken: () => {
      bearerToken = "";
    },
    getOrigin: () => origin,
    setOrigin: (newOrigin) => {
      origin = newOrigin;
    },
    clear: () => {
      cookieJar = "";
      bearerToken = "";
    },
    async login(email, password) {
      this.clear();
      const res = await client.auth.login.mutate({ email, password });
      if (res && res.token) {
        bearerToken = res.token;
      }
      return res;
    },
    async logout() {
      try {
        await client.auth.logout.mutate();
      } catch {
        // ignore logout errors
      } finally {
        this.clear();
      }
    },
    async rawFetch(endpointPath, options = {}) {
      const targetUrl = endpointPath.startsWith("http")
        ? endpointPath
        : `${BACKEND_HOST}${endpointPath}`;

      const headers = {
        Origin: origin,
        ...(cookieJar ? { Cookie: cookieJar } : {}),
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        ...(options.headers || {}),
      };

      return await globalThis.fetch(targetUrl, {
        ...options,
        headers,
      });
    },
  };
}

/**
 * File Inspection Helpers
 */
export function loadBundleHtml() {
  const p = path.join(PROJECT_ROOT, "ios-app/www/index.html");
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

export function loadSourceHtml() {
  const p = path.join(PROJECT_ROOT, "client/public/phone.html");
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

export function loadCapacitorConfig() {
  const p = path.join(PROJECT_ROOT, "ios-app/capacitor.config.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function loadInfoPlist() {
  const p = path.join(PROJECT_ROOT, "ios-app/ios/App/App/Info.plist");
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

export function loadBundleScript() {
  const p = path.join(PROJECT_ROOT, "ios-app/scripts/bundle-app.mjs");
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

/**
 * Generate a valid attendance QR payload (base64 JSON) accepted by student.recordAttendanceViaQr
 */
export function generateValidAttendanceQr(courseId, tsOffsetMs = 0) {
  const token = {
    courseId,
    ts: Date.now() + tsOffsetMs,
    window: Math.floor((Date.now() + tsOffsetMs) / 8000),
  };
  return Buffer.from(JSON.stringify(token)).toString("base64");
}

/**
 * Generate an expired attendance QR payload (> 30s old)
 */
export function generateExpiredAttendanceQr(courseId) {
  const token = {
    courseId,
    ts: Date.now() - 45000,
    window: Math.floor((Date.now() - 45000) / 8000),
  };
  return Buffer.from(JSON.stringify(token)).toString("base64");
}

/**
 * Managed MariaDB connection
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
 * Teardown any test records
 */
export async function cleanupTestRecords() {
  if (!process.env.DATABASE_URL) return;
  await withDbConnection(async (conn) => {
    await conn.query("DELETE FROM appointments WHERE title LIKE 'E2E-%'");
    await conn.query("DELETE FROM academicAlerts WHERE title LIKE 'E2E-%'");
    await conn.query("DELETE FROM advisorNotes WHERE title LIKE 'E2E-%'");
    await conn.query("DELETE FROM announcements WHERE title LIKE 'E2E-%'");
    await conn.query("DELETE m FROM chatMessages m JOIN aiConversations c ON m.conversationId = c.id WHERE c.title LIKE 'E2E-%'");
    await conn.query("DELETE FROM chatMessages WHERE content LIKE '%E2E-%'");
    await conn.query("DELETE FROM aiConversations WHERE title LIKE 'E2E-%'");
  });
}
