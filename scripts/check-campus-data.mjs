import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [buildings] = await conn.query("SELECT * FROM buildings LIMIT 20");
console.log("=== BUILDINGS ===");
console.log(JSON.stringify(buildings, null, 2));

const [rooms] = await conn.query("SELECT * FROM rooms LIMIT 30");
console.log("\n=== ROOMS ===");
console.log(JSON.stringify(rooms, null, 2));

await conn.end();
