import fs from 'fs';
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function testRoadmap() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [enrollments] = await conn.execute("SELECT sc.courseId, sc.status, sc.grade, c.code, c.name, c.nameAr, c.credits FROM `studentCourses` sc LEFT JOIN courses c ON sc.courseId = c.id WHERE sc.studentId = 240002");
  
  const rawCatalog = JSON.parse(fs.readFileSync('shared/data/zuj_courses.json', 'utf8'));

  // Create enrollment lookup map by code and name
  const enrollmentMap = new Map();
  for (const e of enrollments) {
    if (e.code) enrollmentMap.set(e.code.toUpperCase(), e);
    // Also map common alpha codes to 6/7 digit codes
    if (e.code === 'CS101') enrollmentMap.set('130100', e); // Fundamentals of IT / Computing
    if (e.code === 'MATH101') enrollmentMap.set('101112', e); // Foundations of Math / Calculus
    if (e.code === 'ENG101') enrollmentMap.set('420123', e); // English Communication
    if (e.code === 'PHYS101') enrollmentMap.set('101274', e); // Physics / Math applications
    if (e.code === 'CS201') enrollmentMap.set('0130221', e); // Data Structures
    if (e.code === 'CS201') enrollmentMap.set('131215', e); // Data Structures & Alg
    if (e.code === 'CS202') enrollmentMap.set('0130232', e); // Visual Prog / OOP
    if (e.code === 'CS202') enrollmentMap.set('131232', e);
    if (e.code === 'PHYS102') enrollmentMap.set('0130111', e); // Logic / Physics
    if (e.code === 'ENG102') enrollmentMap.set('135101', e); // Technical English
  }

  // Also map existing completed ones directly:
  // Let's add Military Sciences (420101) & National Ed (420151) as completed university requirements
  enrollmentMap.set('420101', { status: 'completed', grade: 'A', code: '420101', name: 'Military Sciences', credits: 3 });
  enrollmentMap.set('420151', { status: 'completed', grade: 'A-', code: '420151', name: 'National Education', credits: 3 });

  // Families definition
  const families = [
    {
      id: 'uni_compulsory',
      titleEn: 'University Compulsory Requirements',
      titleAr: 'متطلبات الجامعة الإجبارية',
      requiredCredits: 18,
      mainCategory: 'متطلبات الجامعة',
      subCategory: 'متطلبات جامعة اجبارية',
    },
    {
      id: 'uni_elective',
      titleEn: 'University Elective Requirements',
      titleAr: 'متطلبات الجامعة الاختيارية',
      requiredCredits: 6,
      mainCategory: 'متطلبات الجامعة',
      subCategory: 'متطلبات جامعة اختيارية',
    },
    {
      id: 'faculty_compulsory',
      titleEn: 'Faculty of IT Compulsory Requirements',
      titleAr: 'متطلبات الكلية الإجبارية',
      requiredCredits: 21,
      mainCategory: 'متطلبات الكلية',
    },
    {
      id: 'major_compulsory',
      titleEn: 'Major Compulsory Requirements',
      titleAr: 'متطلبات التخصص الإجبارية',
      requiredCredits: 66,
      mainCategory: 'متطلبات التخصص',
      subCategory: 'متطلبات التخصص الاجبارية',
    },
    {
      id: 'major_elective',
      titleEn: 'Major Elective Requirements',
      titleAr: 'متطلبات التخصص الاختيارية',
      requiredCredits: 9,
      mainCategory: 'متطلبات التخصص',
      subCategory: 'متطلبات التخصص الاختيارية',
    },
    {
      id: 'supporting_compulsory',
      titleEn: 'Supporting Compulsory Requirements',
      titleAr: 'متطلبات التخصص المساندة',
      requiredCredits: 12,
      mainCategory: 'متطلبات التخصص المساندة',
    },
  ];

  const results = families.map(fam => {
    // Filter matching courses from catalog
    const matchedCourses = rawCatalog.filter(c => {
      if (fam.subCategory) {
        return c.subCategory === fam.subCategory || (fam.mainCategory && c.mainCategory === fam.mainCategory && !c.subCategory);
      }
      return c.mainCategory === fam.mainCategory;
    });

    let completedCredits = 0;
    let inProgressCredits = 0;

    const enrichedCourses = matchedCourses.map(c => {
      const codeUpper = (c.code || '').toUpperCase();
      const cleanUpper = (c.cleanCode || '').toUpperCase();
      const enroll = enrollmentMap.get(codeUpper) || enrollmentMap.get(cleanUpper);

      const status = enroll ? enroll.status : 'not_enrolled';
      const grade = enroll ? enroll.grade : null;

      if (status === 'completed') completedCredits += (c.credits || 3);
      if (status === 'in_progress') inProgressCredits += (c.credits || 3);

      return {
        code: c.code,
        cleanCode: c.cleanCode,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        credits: c.credits,
        modality: c.modalityEn || 'in_person',
        modalityAr: c.modality || 'وجاهي',
        year: c.year,
        semester: c.semester,
        prerequisite: c.prerequisite,
        status,
        grade,
      };
    });

    const isFinished = completedCredits >= fam.requiredCredits;
    const progressPct = Math.min(100, Math.round((completedCredits / fam.requiredCredits) * 100));

    return {
      id: fam.id,
      titleEn: fam.titleEn,
      titleAr: fam.titleAr,
      requiredCredits: fam.requiredCredits,
      completedCredits,
      inProgressCredits,
      progressPct,
      isFinished,
      statusLabelEn: isFinished ? 'Finished ✓' : inProgressCredits > 0 ? 'In Progress ⏳' : 'Not Started',
      statusLabelAr: isFinished ? 'مكتمل ✓' : inProgressCredits > 0 ? 'قيد الإنجاز ⏳' : 'لم يبدأ بعد',
      coursesCount: enrichedCourses.length,
      courses: enrichedCourses,
    };
  });

  console.log('Roadmap Summary:');
  for (const r of results) {
    console.log(`- ${r.titleEn}: ${r.completedCredits}/${r.requiredCredits} Cr (${r.progressPct}%) [${r.statusLabelEn}] - Courses count: ${r.coursesCount}`);
  }

  await conn.end();
}

testRoadmap().catch(console.error);
