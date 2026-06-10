import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [tables] = await conn.query('SHOW TABLES');
const tableNames = tables.map(r => Object.values(r)[0]).sort();

for (const table of tableNames) {
  if (table === '__drizzle_migrations') continue;
  const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
  console.log(`\n${table}: [${cols.map(c => c.Field).join(', ')}]`);
}

await conn.end();
