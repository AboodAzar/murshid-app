import mysql from 'mysql2/promise';

async function test() {
  try {
    const conn = await mysql.createConnection('mysql://24CMHMZreT8383H.root:LkyvVs9VlVfYpY66@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?ssl={"rejectUnauthorized":true}');
    const [rows] = await conn.query('SHOW DATABASES');
    console.log('Successfully connected to Noor DB! Databases:', rows);
    await conn.end();
  } catch (err) {
    console.error('Failed to connect to Noor DB:', err);
  }
}
test();
