import mysql from "mysql2/promise";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });

  const sql = fs.readFileSync("drizzle/0003_thick_nomad.sql", "utf-8");
  const statements = sql.split("--> statement-breakpoint").map(s => s.trim()).filter(s => s);

  for (const statement of statements) {
    console.log("Executing:", statement);
    try {
      await connection.query(statement);
      console.log("Success!");
    } catch (e) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_FIELDNAME') {
        console.log("Already exists, skipping...");
      } else {
        console.error("Error:", e.message);
      }
    }
  }

  await connection.end();
  console.log("Done");
}

run();
