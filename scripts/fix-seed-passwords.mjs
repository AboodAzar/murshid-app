import "dotenv/config";
import mysql from "mysql2/promise";
import crypto from "crypto";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 210_000, 64, "sha512")
    .toString("hex");
  return `pbkdf2:sha512:210000:${salt}:${hash}`;
}

const hashed = hashPassword("password123");

const [result] = await conn.execute(
  `UPDATE users SET password = ? WHERE role IN ('student', 'advisor') AND (password IS NULL OR password NOT LIKE 'pbkdf2:%')`,
  [hashed]
);
console.log(`Updated ${result.affectedRows} user passwords.`);

// Also update hanan@gmail.com if it exists with plain text
await conn.execute(
  `UPDATE users SET password = ? WHERE email = 'hanan@gmail.com'`,
  [hashed]
);
console.log("Ensured hanan@gmail.com has hashed password.");

await conn.end();
