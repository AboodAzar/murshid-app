import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/murshid');
  const [rows] = await conn.query('SELECT id, email, name, role FROM users');
  console.log(`Total users: ${rows.length}`);
  for (const r of rows) {
    console.log(`- ID ${r.id}: ${r.name} (${r.email}) [${r.role}]`);
  }
  await conn.end();
}

main().catch(console.error);
