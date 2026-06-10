import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.query('DESCRIBE __drizzle_migrations');
console.log(rows);
await conn.end();
