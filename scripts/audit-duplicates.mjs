import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log("=== Duplicate Enrollment Audit ===\n");

// 1. Check for duplicate student-course pairs in studentCourses
const [dupEnroll] = await conn.execute(`
  SELECT studentId, courseId, COUNT(*) as cnt
  FROM studentCourses
  GROUP BY studentId, courseId
  HAVING cnt > 1
  ORDER BY cnt DESC
  LIMIT 10
`);
console.log(`Duplicate enrollments (studentId+courseId): ${dupEnroll.length}`);
for (const r of dupEnroll) {
  console.log(`  studentId=${r.studentId} courseId=${r.courseId} count=${r.cnt}`);
}

// 2. Total enrollments vs unique enrollments
const [[total]] = await conn.execute(`SELECT COUNT(*) as total FROM studentCourses`);
const [[unique]] = await conn.execute(`SELECT COUNT(*) as uniqueCount FROM (SELECT DISTINCT studentId, courseId FROM studentCourses) t`);
console.log(`\nTotal enrollments: ${total.total}`);
console.log(`Unique enrollments: ${unique.uniqueCount}`);
console.log(`Difference: ${total.total - unique.uniqueCount}`);

// 3. Check studentCourses per student
const [perStudent] = await conn.execute(`
  SELECT studentId, COUNT(*) as cnt
  FROM studentCourses
  GROUP BY studentId
  ORDER BY cnt DESC
  LIMIT 5
`);
console.log("\nTop 5 students by enrollment count:");
for (const r of perStudent) {
  console.log(`  studentId=${r.studentId}: ${r.cnt} enrollments`);
}

// 4. Check duplicate grades (same student, same assignment)
const [dupGrades] = await conn.execute(`
  SELECT studentId, assignmentId, COUNT(*) as cnt
  FROM studentAssignments
  GROUP BY studentId, assignmentId
  HAVING cnt > 1
  LIMIT 5
`);
console.log(`\nDuplicate studentAssignments: ${dupGrades.length}`);
for (const r of dupGrades) {
  console.log(`  studentId=${r.studentId} assignmentId=${r.assignmentId} count=${r.cnt}`);
}

// 5. Check for duplicate attendance
const [dupAtt] = await conn.execute(`
  SELECT studentId, courseId, scheduleId, DATE(date) as d, COUNT(*) as cnt
  FROM attendance
  GROUP BY studentId, courseId, scheduleId, DATE(date)
  HAVING cnt > 1
  LIMIT 5
`);
console.log(`\nDuplicate attendance records: ${dupAtt.length}`);

// 6. Check courseSchedules per course
const [schedPerCourse] = await conn.execute(`
  SELECT courseId, COUNT(*) as cnt
  FROM courseSchedules
  GROUP BY courseId
  HAVING cnt > 1
  LIMIT 5
`);
console.log(`\nCourses with multiple schedules: ${schedPerCourse.length}`);
for (const r of schedPerCourse) {
  console.log(`  courseId=${r.courseId}: ${r.cnt} schedules`);
}

await conn.end();
console.log("\nAudit complete.");
