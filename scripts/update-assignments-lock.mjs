import fs from 'fs';

let content = fs.readFileSync('client/src/pages/Assignments.tsx', 'utf8');

// 1. Add Lock import if not present
if (!content.includes('Lock,')) {
  content = content.replace('Clock,', 'Clock,\n  Lock,');
}

// 2. Guard openSubmitModal against completed courses
const modalTarget = 'const openSubmitModal = (item: AssignmentItem) => {';
const modalReplacement = `const openSubmitModal = (item: AssignmentItem) => {
    if (item.courseCode === "CS101" || item.courseCode === "MATH101" || (item as any).isCourseCompleted) {
      toast.error(language === "ar" ? "هذا المساق مكتمل ومؤرشف. التسليم مغلق نهائياً." : "This course is completed and archived. Submissions are permanently closed.");
      return;
    }`;

content = content.replace(modalTarget, modalReplacement);

// 3. Update button rendering in assignment card
const btnTarget = '{(a.status === "pending" || a.status === "submitted" || a.status === "overdue") && (\n                        <button\n                          onClick={() => openSubmitModal(a)}';

const btnReplacement = `{(a.courseCode === "CS101" || a.courseCode === "MATH101" || (a as any).isCourseCompleted) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-white/10 text-xs font-semibold select-none cursor-not-allowed">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === "ar" ? "مساق مكتمل (مغلق للتسليم)" : "Course Completed (Submissions Closed)"}</span>
                        </span>
                      ) : (a.status === "pending" || a.status === "submitted" || a.status === "overdue") && (
                        <button
                          onClick={() => openSubmitModal(a)}`;

content = content.replace(btnTarget, btnReplacement);

fs.writeFileSync('client/src/pages/Assignments.tsx', content);
console.log('Successfully updated client/src/pages/Assignments.tsx with completed course submission lock.');
