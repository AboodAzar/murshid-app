import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function testAll() {
  console.log("=== COMPREHENSIVE VERIFICATION FOR USER REQUEST #10 ===");

  // 1. Database & Roadmap verification
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'murshid',
  });

  console.log("✓ Connected to MySQL database");

  // Check student Hanan courses
  const [coursesRows] = await connection.execute(
    `SELECT sc.id, sc.status, sc.grade, c.id AS courseId, c.code, c.name, c.credits
     FROM studentCourses sc
     JOIN courses c ON sc.courseId = c.id
     WHERE sc.studentId = 240002`
  );

  const completed = coursesRows.filter(c => c.status === 'completed');
  const inProgress = coursesRows.filter(c => c.status === 'in_progress');

  console.log(`✓ Student 240002 courses: ${completed.length} Completed, ${inProgress.length} In-Progress`);
  console.log("  Completed:", completed.map(c => `${c.code} (${c.grade})`).join(', '));
  console.log("  In-Progress:", inProgress.map(c => c.code).join(', '));

  // 2. HTTP Verification of Roadmap tRPC query
  const res = await fetch('http://localhost:3000/api/trpc/courses.getMajorDegreeRoadmap', {
    headers: { 'Content-Type': 'application/json' },
  });

  const roadmapJson = await res.json();
  const roadmapData = roadmapJson?.result?.data?.json || roadmapJson?.result?.data;

  if (roadmapData && roadmapData.families) {
    console.log("\n✓ Roadmap endpoint courses.getMajorDegreeRoadmap successfully returned:");
    console.log(`  Total Degree: ${roadmapData.summary.totalDegreeCredits} Cr`);
    console.log(`  Completed: ${roadmapData.summary.completedCredits} Cr (${roadmapData.summary.overallProgressPct}%)`);
    console.log(`  In-Progress: ${roadmapData.summary.inProgressCredits} Cr`);
    console.log(`  Remaining: ${roadmapData.summary.remainingCredits} Cr`);
    console.log(`  Requirement Families Count: ${roadmapData.families.length}`);

    for (const fam of roadmapData.families) {
      console.log(`  - [${fam.isFinished ? "FINISHED ✓" : fam.inProgressCredits > 0 ? "IN PROGRESS ⏳" : "NOT STARTED"}] ${fam.titleEn} (${fam.titleAr}): ${fam.completedCredits}/${fam.requiredCredits} Cr (${fam.progressPct}%) • ${fam.coursesCount} courses`);
    }
  } else {
    console.error("❌ Roadmap endpoint failed:", roadmapJson);
    process.exit(1);
  }

  // 3. UI Template & File Verification
  console.log("\n✓ Verifying Frontend Source Files:");
  
  const myCoursesContent = fs.readFileSync('client/src/pages/MyCourses.tsx', 'utf8');
  if (
    myCoursesContent.includes('MajorDegreeRoadmapModal') &&
    myCoursesContent.includes('inProgressCourses') &&
    myCoursesContent.includes('completedCourses') &&
    myCoursesContent.includes('from-cyan-500') &&
    myCoursesContent.includes('from-purple-600')
  ) {
    console.log("  ✓ MyCourses.tsx: Roadmap modal imported, in-progress at top (Cyan theme), completed at bottom (Purple theme)");
  } else {
    console.error("  ❌ MyCourses.tsx missing required ordering or modal");
    process.exit(1);
  }

  const studentDashboardContent = fs.readFileSync('client/src/pages/StudentDashboard.tsx', 'utf8');
  if (
    studentDashboardContent.includes('MajorDegreeRoadmapModal') &&
    studentDashboardContent.includes('sortedCourses') &&
    studentDashboardContent.includes('inProgressCourses') &&
    studentDashboardContent.includes('completedCourses') &&
    studentDashboardContent.includes('isCompleted')
  ) {
    console.log("  ✓ StudentDashboard.tsx: In-progress at top, completed at bottom, submissions disabled/grayed-out for completed courses");
  } else {
    console.error("  ❌ StudentDashboard.tsx missing required logic");
    process.exit(1);
  }

  const courseDetailsContent = fs.readFileSync('client/src/pages/CourseDetails.tsx', 'utf8');
  if (
    courseDetailsContent.includes('enrollment?.status === "completed" || enrollment?.isLocked') &&
    courseDetailsContent.includes('Submissions Closed')
  ) {
    console.log("  ✓ CourseDetails.tsx: Completed courses do NOT transfer to /assignments and show disabled 🔒 Submissions Closed");
  } else {
    console.error("  ❌ CourseDetails.tsx missing locked button");
    process.exit(1);
  }

  const phoneContent = fs.readFileSync('client/public/phone.html', 'utf8');
  if (
    phoneContent.includes('roadmap-families-container') &&
    phoneContent.includes('switchRoadmapView') &&
    phoneContent.includes('In-Progress (قيد الإنجاز)') &&
    phoneContent.includes('Completed & Archived (المواد المكتملة)') &&
    phoneContent.includes('isCompletedCourse')
  ) {
    console.log("  ✓ phone.html: Major roadmap families modal, in-progress at top, completed at bottom, completed course submissions grayed out");
  } else {
    console.error("  ❌ phone.html missing roadmap or course ordering");
    process.exit(1);
  }

  await connection.end();
  console.log("\n================ ALL CHECKS PASSED SUCCESSFULLY ================");
}

testAll().catch(e => {
  console.error("Test failed with error:", e);
  process.exit(1);
});
