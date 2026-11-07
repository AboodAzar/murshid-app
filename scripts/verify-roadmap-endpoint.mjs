import 'dotenv/config';
import { coursesRouter } from '../server/routers/courses.ts';

async function test() {
  const caller = coursesRouter.createCaller({
    user: { id: 240002, role: 'student', universityId: '240002', name: 'Hanan Saleh', email: 'hanan@zuj.edu.jo' },
    req: {},
    res: {}
  });

  const roadmap = await caller.getMajorDegreeRoadmap();
  console.log('Degree Summary:', roadmap.summary);
  console.log('Families count:', roadmap.families.length);
  for (const f of roadmap.families) {
    console.log(`* ${f.titleEn} (${f.titleAr}): ${f.completedCredits}/${f.requiredCredits} Cr [${f.statusLabelEn}] (${f.progressPct}%) - Courses: ${f.coursesCount}`);
    const completedList = f.courses.filter(c => c.status === 'completed');
    const inProgressList = f.courses.filter(c => c.status === 'in_progress');
    if (completedList.length) console.log(`   Completed:`, completedList.map(c => `${c.code} ${c.nameEn} (${c.grade})`));
    if (inProgressList.length) console.log(`   In Progress:`, inProgressList.map(c => `${c.code} ${c.nameEn}`));
  }
}
test().catch(console.error);
