import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute("SELECT id FROM users WHERE email = 'hanan@gmail.com' LIMIT 1");
if (rows.length === 0) {
  await conn.execute(
    `INSERT INTO users (openId, email, name, password, role, isActive, isEmailVerified, language)
     VALUES (?, ?, ?, ?, ?, true, true, 'en')`,
    ['hanan_001', 'hanan@gmail.com', 'Hanan', 'password123', 'student']
  );
  console.log("Restored hanan@gmail.com as student");
} else {
  console.log("hanan@gmail.com already exists");
}
await conn.end();
