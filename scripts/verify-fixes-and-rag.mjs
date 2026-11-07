import 'dotenv/config';
import { getDb } from '../server/db.ts';
import { coursesRouter } from '../server/routers/courses.ts';
import { studentRouter } from '../server/routers/student.ts';
import { searchDoctorCourseMaterialsRAG } from '../server/utils/courseMaterialKnowledgeRAG.ts';
import { getCourseStudyStrategy, formatStudyStrategyToMarkdown } from '../server/utils/studyStrategyEngine.ts';

async function runVerification() {
  console.log('================================================================');
  console.log('  TESTING STUDENT AUTHORING GUARD, SUBMISSION LOCK & DOCTOR RAG ');
  console.log('================================================================\n');

  const db = await getDb();

  // Student Hanan (Role: student)
  const studentCtx = {
    user: { id: 240002, role: 'student', universityId: '240002', name: 'Hanan Saleh', email: 'hanan@zuj.edu.jo' },
    req: {},
    res: {}
  };

  // Doctor Ahmad Khalil (Role: advisor)
  const doctorCtx = {
    user: { id: 210024, role: 'advisor', universityId: 'D1001', name: 'Dr. Ahmad Khalil', email: 'a.khalil@zuj.edu.jo' },
    req: {},
    res: {}
  };

  const studentCoursesCaller = coursesRouter.createCaller(studentCtx);
  const doctorCoursesCaller = coursesRouter.createCaller(doctorCtx);
  const studentStudentCaller = studentRouter.createCaller(studentCtx);

  // --- CHECK 1: Student attempting to add material/assignment/exam to course ---
  console.log('--- 1. Testing Student Add/Edit Permission Guard ---');
  try {
    await studentCoursesCaller.addMaterial({
      courseId: 41,
      chapterNumber: 1,
      chapterTitle: 'Chapter 1',
      type: 'assignment',
      title: 'Illegal Student-Created Assignment',
      totalPoints: 10,
    });
    console.error('FAIL: Student was allowed to add material!');
    process.exit(1);
  } catch (err) {
    console.log('  [PASS] Student correctly blocked with error:', err.message);
  }

  // --- CHECK 2: Doctor attempting to add material to completed locked course ---
  console.log('\n--- 2. Testing Completed Course Lock on Add Material ---');
  try {
    await doctorCoursesCaller.addMaterial({
      courseId: 33, // CS101 completed
      chapterNumber: 1,
      chapterTitle: 'Chapter 1',
      type: 'exam',
      title: 'Illegal Exam on Completed Course',
      totalPoints: 30,
    });
    console.error('FAIL: Doctor was allowed to add material to completed course!');
    process.exit(1);
  } catch (err) {
    console.log('  [PASS] Modification on completed course correctly blocked:', err.message);
  }

  // --- CHECK 3: Student attempting to submit solution on completed course CS101 ---
  console.log('\n--- 3. Testing Submission Lock on Completed Courses ---');
  try {
    await studentStudentCaller.submitAssignment({
      assignmentId: 161, // CS101 completed course assignment
      solutionText: 'Submitting solution after course completion...',
    });
    console.error('FAIL: Student was allowed to submit to completed course!');
    process.exit(1);
  } catch (err) {
    console.log('  [PASS] Submission on completed course blocked with error:', err.message);
  }

  // --- CHECK 4: Doctor Course Materials RAG (Priority: 100+) ---
  console.log('\n--- 4. Testing Doctor Course Materials RAG Retrieval & Scoring ---');
  const ragResult = await searchDoctorCourseMaterialsRAG({
    db,
    studentId: 240002,
    query: 'Explain Big-O asymptotic analysis and recurrence relations from Dr. Ahmad Khalil slides',
    language: 'ar',
  });

  console.log('  Doctor Match Found:', ragResult.hasDoctorMatch);
  console.log('  Top Match Score:', ragResult.topMatchScore);
  console.log('  Total Doctor Files Matched:', ragResult.matches.length);
  if (ragResult.matches.length > 0) {
    console.log('  Top File Name:', ragResult.matches[0].fileName);
    console.log('  Instructor:', ragResult.matches[0].doctorName);
    console.log('  Course:', ragResult.matches[0].courseCode);
  }

  if (!ragResult.hasDoctorMatch || ragResult.topMatchScore < 100) {
    console.error('FAIL: Doctor materials were not scored at top priority (100+)!');
    process.exit(1);
  }
  console.log('  [PASS] Doctor materials retrieved and scored at top priority (>= 100)');

  // --- CHECK 5: Study Strategy Engine with Doctor Priority & Heads-up Notice ---
  console.log('\n--- 5. Testing Study Strategy with Doctor Materials & Heads-up Notice ---');
  const strategy = await getCourseStudyStrategy({
    query: 'CS201 Data Structures study strategy',
    language: 'en',
    doctorMaterials: ragResult.matches,
  });

  const md = formatStudyStrategyToMarkdown(strategy);
  const hasDoctorSection = md.includes('Official Doctor Course Materials & Slides') || md.includes('Priority Score: 100+');
  const hasHeadsUpNotice = md.includes('Academic Heads-up Notice') || md.includes('outside of your doctor\'s official course slides and files');

  console.log('  Has Doctor Section First (Score: 100+):', hasDoctorSection);
  console.log('  Has External Internet Heads-up Notice:', hasHeadsUpNotice);

  if (!hasDoctorSection || !hasHeadsUpNotice) {
    console.error('FAIL: Missing Doctor Materials Priority Section or Heads-up Notice in Study Strategy!');
    process.exit(1);
  }
  console.log('  [PASS] Doctor Materials Priority Section & Heads-up Notice verified!');

  console.log('\n================================================================');
  console.log('  >>> ALL FIXES & RAG VERIFICATION CHECKS PASSED PERFECTLY! <<<  ');
  console.log('================================================================\n');
  process.exit(0);
}

runVerification().catch(err => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
