import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";
import crypto from "crypto";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Compute hashes for all existing migrations
function computeHash(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

const migrations = [
  { tag: "0000_bizarre_proteus", file: "drizzle/0000_bizarre_proteus.sql" },
  { tag: "0001_bitter_falcon", file: "drizzle/0001_bitter_falcon.sql" },
  { tag: "0002_careless_hardball", file: "drizzle/0002_careless_hardball.sql" },
  { tag: "0003_thick_nomad", file: "drizzle/0003_thick_nomad.sql" },
  { tag: "0004_lumpy_cassandra_nova", file: "drizzle/0004_lumpy_cassandra_nova.sql" },
];

// Check current applied migrations
const [existing] = await conn.query('SELECT hash FROM __drizzle_migrations');
const existingHashes = new Set(existing.map(r => r.hash));
console.log('Existing migrations:', existingHashes.size);

for (const m of migrations) {
  const hash = computeHash(m.file);
  if (existingHashes.has(hash)) {
    console.log(`Already applied: ${m.tag}`);
    continue;
  }

  console.log(`Marking applied: ${m.tag} (${hash})`);
  await conn.query('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)', [hash, Date.now()]);
}

// Also apply the ALTER TABLE statements manually if they haven't been applied yet
const [cols] = await conn.query('SHOW COLUMNS FROM users LIKE "advisorId"');
if (cols.length === 0) {
  console.log('Adding advisorId to users...');
  await conn.query('ALTER TABLE users ADD advisorId int');
}

const [courseCols] = await conn.query('SHOW COLUMNS FROM courses LIKE "instructorId"');
if (courseCols.length === 0) {
  console.log('Adding instructorId to courses...');
  await conn.query('ALTER TABLE courses ADD instructorId int');
}

console.log('Migration fix complete.');
await conn.end();
