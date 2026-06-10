import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.query('SELECT * FROM __drizzle_migrations');
console.log('Applied migrations:', rows);
await conn.end();
