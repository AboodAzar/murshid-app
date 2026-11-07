import mysql from 'mysql2/promise';
import { verifyPassword } from '../../../server/_core/authSecurity.ts';

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/murshid');
  const [rows] = await conn.query('SELECT id, email, name, role, password FROM users WHERE email IN (?, ?, ?, ?)', [
    'hanan@gmail.com',
    'basma.hassan@zuj.edu.jo',
    'a.khalil@zuj.edu.jo',
    'abood@gmail.com'
  ]);
  
  for (const r of rows) {
    const isPass123 = verifyPassword('password123', r.password);
    const isAboodPass = verifyPassword('Abood#2004', r.password);
    console.log(`User ${r.name} (${r.email}): password123=${isPass123}, Abood#2004=${isAboodPass}`);
  }
  await conn.end();
}

main().catch(console.error);
