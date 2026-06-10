import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.query('SHOW TABLES');
const tables = rows.map(r => Object.values(r)[0]).sort();
console.log('Tables in DB:', tables);
console.log('\nTotal tables:', tables.length);

// Check users columns
const [userCols] = await conn.query('SHOW COLUMNS FROM users');
console.log('\nUsers columns:', userCols.map(c => c.Field));

// Check courses columns
const [courseCols] = await conn.query('SHOW COLUMNS FROM courses');
console.log('\nCourses columns:', courseCols.map(c => c.Field));

// Check which 0004 tables exist
const expected0004Tables = [
  'academicAlerts', 'achievements', 'advisorNotes', 'advisorReports', 
  'appointments', 'assignments', 'attendance', 'courseSchedules',
  'recommendations', 'studentAchievements', 'studentAssignments'
];
console.log('\n--- 0004 Migration Tables Check ---');
for (const t of expected0004Tables) {
  const exists = tables.includes(t);
  console.log(`${t}: ${exists ? 'EXISTS' : 'MISSING'}`);
}

await conn.end();
