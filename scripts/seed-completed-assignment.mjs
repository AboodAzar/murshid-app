import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute(`
    INSERT INTO \`studentAssignments\` (id, studentId, assignmentId, status, score, createdAt, updatedAt)
    VALUES (31099, 240002, 161, 'graded', 100, NOW(), NOW())
    ON DUPLICATE KEY UPDATE status = 'graded', score = 100
  `);
  console.log('Seeded completed assignment 31099 for Hanan on CS101.');
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
