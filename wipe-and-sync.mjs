import mysqldump from 'mysqldump';
import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log("1. Connecting to TiDB and extracting a fresh copy of Noor's data...");
  try {
    await mysqldump({
      connection: {
        host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
        user: '24CMHMZreT8383H.root',
        password: 'LkyvVs9VlVfYpY66',
        database: 'test',
        port: 4000,
        ssl: { rejectUnauthorized: true }
      },
      dumpToFile: 'tidb_data.sql',
    });
    console.log('Successfully extracted TiDB data!');
  } catch (err) {
    console.error('Failed to dump TiDB:', err);
    return;
  }

  console.log('2. Wiping Google Cloud SQL database clean...');
  let dbUrl = process.env.DATABASE_URL;
  if (dbUrl.includes('?')) {
    dbUrl = dbUrl.replace('?', '?multipleStatements=true&');
  } else {
    dbUrl += '?multipleStatements=true';
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbUrl);
    // Drop the database and recreate it to completely wipe all tables and data
    await conn.query('DROP DATABASE IF EXISTS murshid');
    await conn.query('CREATE DATABASE murshid');
    await conn.query('USE murshid');
    console.log('Successfully wiped Google Cloud SQL database!');
  } catch (e) {
    console.error('Failed to wipe database:', e);
    return;
  }

  console.log("3. Importing Noor's fresh data into the empty Google Cloud SQL database...");
  try {
    let sql = fs.readFileSync('tidb_data.sql', 'utf8');
    if (sql.charCodeAt(0) === 0xFEFF) sql = sql.slice(1);
    await conn.query(sql);
    console.log("Successfully imported all of Noor's data perfectly!");
  } catch(e) {
    console.error('Import failed:', e);
  } finally {
    await conn.end();
  }
}

run();
