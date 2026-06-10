import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Read the 0004 migration SQL and execute each statement
const sql = fs.readFileSync("drizzle/0004_lumpy_cassandra_nova.sql", "utf8");

// Split by statement-breakpoint
const statements = sql.split("--> statement-breakpoint").map(s => s.trim()).filter(Boolean);

console.log(`Executing ${statements.length} statements from migration 0004...\n`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  console.log(`[${i + 1}/${statements.length}] ${stmt.substring(0, 80)}...`);
  try {
    await conn.query(stmt);
    console.log(`  ✅ OK`);
  } catch (err) {
    // Ignore "already exists" errors
    if (err.message.includes("already exists") || err.message.includes("Duplicate column")) {
      console.log(`  ⚠️ SKIPPED (${err.message.slice(0, 100)})`);
    } else {
      console.log(`  ❌ FAILED: ${err.message}`);
    }
  }
}

console.log("\nMigration 0004 application complete.");
await conn.end();
