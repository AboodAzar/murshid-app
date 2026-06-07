import mysql from 'mysql2/promise';

async function test() {
  const passwordsToTest = [
    'LkyvVsYV1VTYpYbB', // s instead of z
    'LkyvVzYV1VTYpYbB', // original
    'IkyvVzYV1VTYpYbB', // I instead of L
    'lkyvVzYV1VTYpYbB', // l instead of L
    'LkyvVzYVIVTYpYbB', // I instead of 1
    'LkyvVzYVlVTYpYbB', // l instead of 1
    'LkyvVsYVlVTYpYbB',
  ];

  for (const p of passwordsToTest) {
    try {
      console.log("Testing:", p);
      const connection = await mysql.createConnection({
        host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
        port: 4000,
        user: '24CMHMZrcT8J8Ji.root',
        password: p,
        database: 'sys',
        ssl: { rejectUnauthorized: true }
      });
      console.log("Success with password:", p);
      await connection.end();
      return;
    } catch (e) {
      console.log("Failed:", e.message);
    }
  }
}

test();
