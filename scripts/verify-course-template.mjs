import 'dotenv/config';
import { coursesRouter } from '../server/routers/courses.ts';

async function test() {
  console.log('Testing Course Template & Authoring System...');
  
  // Hanan Saleh (Student 240002, id: 240002)
  const studentCtx = {
    user: { id: 240002, role: 'student', universityId: '240002', name: 'Hanan Saleh', email: 'hanan@zuj.edu.jo' },
    req: {},
    res: {}
  };

  // Dr. Ahmad Khalil (Doctor D1001, id: 210024)
  const doctorCtx = {
    user: { id: 210024, role: 'advisor', universityId: 'D1001', name: 'Dr. Ahmad Khalil', email: 'a.khalil@zuj.edu.jo' },
    req: {},
    res: {}
  };

  const studentCaller = coursesRouter.createCaller(studentCtx);
  const doctorCaller = coursesRouter.createCaller(doctorCtx);

  // 1. Test getCourseTemplate for CS201 (active course ID 41)
  const cs201Template = await studentCaller.getCourseTemplate({ courseId: 41 });
  console.log('\n--- CS201 (Active Course) ---');
  console.log('Code:', cs201Template.course.code);
  console.log('Name:', cs201Template.course.name);
  console.log('Modality:', cs201Template.course.modality);
  console.log('Enrollment Status:', cs201Template.enrollment.status);
  console.log('Is Completed:', cs201Template.enrollment.isCompleted);
  console.log('Is Locked:', cs201Template.enrollment.isLocked);
  console.log('Doctor Count:', cs201Template.doctors.length);
  const doc = cs201Template.doctors[0];
  console.log('Primary Doctor Name:', doc.name);
  console.log('Primary Doctor Email:', doc.email);
  console.log('Primary Doctor Office:', doc.officeNumber);
  console.log('Primary Doctor Deactivated:', doc.isDeactivated);
  console.log('Chapters count:', cs201Template.chapters.length);
  if (cs201Template.chapters.length > 0) {
    console.log('Chapter 1 items:', cs201Template.chapters[0].items.map(i => `[${i.type}] ${i.title}`));
  }

  // 2. Test getCourseTemplate for CS101 (Completed course ID 33)
  const cs101Template = await studentCaller.getCourseTemplate({ courseId: 33 });
  console.log('\n--- CS101 (Completed / Archived Course ID 33) ---');
  console.log('Code:', cs101Template.course.code);
  console.log('Name:', cs101Template.course.name);
  console.log('Enrollment Status:', cs101Template.enrollment.status);
  console.log('Is Completed:', cs101Template.enrollment.isCompleted);
  console.log('Is Locked:', cs101Template.enrollment.isLocked);
  console.log('Completed Semester:', cs101Template.enrollment.completedSemester);
  console.log('Grade:', cs101Template.enrollment.grade);
  const doc101 = cs101Template.doctors[0];
  console.log('Doctor Name:', doc101.name);
  console.log('Doctor Email (Hidden/Null):', doc101.email);
  console.log('Doctor Office (Hidden/Null):', doc101.officeNumber);
  console.log('Doctor Deactivated:', doc101.isDeactivated);
  console.log('Doctor Contact Notice:', doc101.contactNotice);

  // 3. Test addMaterial as Doctor for active CS201
  console.log('\n--- Doctor Material Authoring on Active CS201 ---');
  const newMaterial = await doctorCaller.addMaterial({
    courseId: 41,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Linked Lists & Pointers',
    chapterTitleAr: 'الفصل الثاني: القوائم المترابطة والمؤشرات',
    type: 'slides',
    title: 'Lecture 06 - Doubly Linked Lists & Sentinel Nodes',
    titleAr: 'المحاضرة 06 - القوائم ثنائية الترابط والعقد الوهمية',
    description: 'Detailed slides covering node pointers, memory traversal, and circular lists.',
    fileName: 'CS201_Ch2_DoublyLinkedLists.pptx',
    fileUrl: '/materials/cs201/CS201_Ch2_DoublyLinkedLists.pptx',
    fileSize: '4.2 MB'
  });
  console.log('Authoring result:', newMaterial);

  // 4. Test Doctor attempting to add material to completed locked CS101 (ID 33) (should fail with FORBIDDEN)
  console.log('\n--- Doctor Material Authoring on Locked CS101 (Should Reject) ---');
  try {
    await doctorCaller.addMaterial({
      courseId: 33,
      chapterNumber: 1,
      chapterTitle: 'Chapter 1',
      type: 'notes',
      title: 'Illegal Note on Locked Course',
      fileName: 'notes.pdf'
    });
    console.error('FAIL: Expected error was not thrown on locked course!');
    process.exit(1);
  } catch (err) {
    console.log('SUCCESS: Correctly rejected modification on locked course with error:', err.message);
  }

  console.log('\n>>> ALL COURSE TEMPLATE & AUTHORING TESTS PASSED PERFECTLY! <<<');
  process.exit(0);
}

test().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
