import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/murshid');
  for (const studentId of [240002, 210029]) {
    console.log(`\n================ Student ID: ${studentId} ================`);
    const [courses] = await conn.query('SELECT sc.id, sc.courseId, sc.status, sc.grade, c.code, c.name FROM studentCourses sc JOIN courses c ON sc.courseId = c.id WHERE sc.studentId = ?', [studentId]);
    console.log(`Enrolled Courses (${courses.length}):`, courses.map(c => `${c.code} (${c.status}, grade: ${c.grade})`));

    const [plans] = await conn.query('SELECT totalCredits, completedCredits, currentGPA, status FROM studyPlans WHERE studentId = ?', [studentId]);
    console.log('Study Plan:', plans[0] || 'None');

    const [asgns] = await conn.query('SELECT sa.id, sa.status, sa.grade, a.title, c.code FROM studentAssignments sa JOIN assignments a ON sa.assignmentId = a.id JOIN courses c ON a.courseId = c.id WHERE sa.studentId = ?', [studentId]);
    console.log(`Assignments (${asgns.length}):`, asgns.map(a => `${a.code}: ${a.title} [${a.status}, grade: ${a.grade}]`));

    const [att] = await conn.query('SELECT count(*) as cnt FROM attendance WHERE studentId = ?', [studentId]);
    console.log(`Attendance records count:`, att[0]?.cnt);

    const [alerts] = await conn.query('SELECT title, severity, status FROM academicAlerts WHERE studentId = ?', [studentId]);
    console.log(`Academic Alerts (${alerts.length}):`, alerts);
  }
  await conn.end();
}

main().catch(console.error);
