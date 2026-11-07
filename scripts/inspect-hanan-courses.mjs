import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute("SELECT sc.courseId, sc.status, sc.grade, c.code, c.name, c.nameAr, c.credits FROM `studentCourses` sc LEFT JOIN courses c ON sc.courseId = c.id WHERE sc.studentId = 240002");
  console.log("Hanan Courses:", rows);
  await conn.end();
}
main().catch(err => { console.error(err); process.exit(1); });
