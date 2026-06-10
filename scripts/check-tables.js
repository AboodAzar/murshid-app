require('dotenv/config');
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.query('SHOW TABLES');
  console.log('Tables:', rows.map(r => Object.values(r)[0]));
  await conn.end();
})();
