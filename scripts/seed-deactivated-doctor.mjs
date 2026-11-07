import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute(`
    INSERT INTO users (id, openId, email, name, role, departmentId, isActive, bio, createdAt, updatedAt)
    VALUES (999, 'advisor_s.alnajjar@zuj.edu.jo', 's.alnajjar@zuj.edu.jo', 'Dr. Samir Al-Najjar', 'advisor', 1, 0, 'Former Assistant Professor of Computer Science (Moved / Deactivated)', NOW(), NOW())
    ON DUPLICATE KEY UPDATE isActive = 0, name = 'Dr. Samir Al-Najjar'
  `);
  const [rows] = await conn.execute('SELECT id, name, email, role, isActive FROM users WHERE id = 999');
  console.log('Seeded User 999:', rows);
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
