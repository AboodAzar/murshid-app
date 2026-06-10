import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log("=== Deduplicating studentCourses ===");

// 1. Find all students with duplicate course enrollments
const [dupStudents] = await conn.execute(`
  SELECT studentId, courseId, COUNT(*) as cnt,
    GROUP_CONCAT(id ORDER BY id) as ids,
    GROUP_CONCAT(status ORDER BY id) as statuses,
    GROUP_CONCAT(grade ORDER BY id) as grades,
    GROUP_CONCAT(gradePoints ORDER BY id) as points
  FROM studentCourses
  GROUP BY studentId, courseId
  HAVING cnt > 1
`);

console.log(`Found ${dupStudents.length} duplicate enrollment groups.`);

let deleted = 0;
for (const row of dupStudents) {
  const ids = row.ids.split(",").map(Number);
  // Keep the first id, delete the rest
  const keepId = ids[0];
  const deleteIds = ids.slice(1);
  console.log(`  studentId=${row.studentId} courseId=${row.courseId}: keeping id=${keepId}, deleting ${deleteIds.length} duplicates`);
  for (const id of deleteIds) {
    await conn.execute(`DELETE FROM studentCourses WHERE id = ?`, [id]);
    deleted++;
  }
}

console.log(`\nDeleted ${deleted} duplicate enrollment rows.`);

// 2. Deduplicate attendance records
console.log("\n=== Deduplicating attendance ===");
const [dupAtt] = await conn.execute(`
  SELECT studentId, courseId, scheduleId, DATE(date) as d, COUNT(*) as cnt,
    GROUP_CONCAT(id ORDER BY id) as ids
  FROM attendance
  GROUP BY studentId, courseId, scheduleId, DATE(date)
  HAVING cnt > 1
`);

let attDeleted = 0;
for (const row of dupAtt) {
  const ids = row.ids.split(",").map(Number);
  const deleteIds = ids.slice(1);
  for (const id of deleteIds) {
    await conn.execute(`DELETE FROM attendance WHERE id = ?`, [id]);
    attDeleted++;
  }
}
console.log(`Deleted ${attDeleted} duplicate attendance rows.`);

// 3. Verify
const [[totalAfter]] = await conn.execute(`SELECT COUNT(*) as total FROM studentCourses`);
const [[uniqueAfter]] = await conn.execute(`SELECT COUNT(*) as u FROM (SELECT DISTINCT studentId, courseId FROM studentCourses) t`);
console.log(`\nAfter cleanup:`);
console.log(`  Total enrollments: ${totalAfter.total}`);
console.log(`  Unique enrollments: ${uniqueAfter.u}`);
console.log(`  Difference: ${totalAfter.total - uniqueAfter.u}`);

await conn.end();
console.log("\nDone.");
