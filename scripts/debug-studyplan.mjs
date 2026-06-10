import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [rows] = await conn.execute(
    "SELECT `id`, `studentId`, `advisorId`, `totalCredits`, `completedCredits`, `currentGPA`, `status`, `createdAt`, `updatedAt` FROM `studyPlans` WHERE `studyPlans`.`studentId` = ? LIMIT ?",
    [30006, 1]
  );
  console.log("Query success:", rows.length, "rows");
} catch (e) {
  console.log("Query error:", e.message);
}

await conn.end();
