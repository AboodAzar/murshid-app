import fs from 'fs';

const phone = fs.readFileSync('client/public/phone.html', 'utf8');

const checks = [
  { name: 'openCourseDetailsModal function', pass: phone.includes('function openCourseDetailsModal') },
  { name: 'openDoctorAddMaterialModal function', pass: phone.includes('function openDoctorAddMaterialModal') },
  { name: 'Doctor profile office & email', pass: phone.includes('Office') && phone.includes('Email') },
  { name: '[Deactivated] doctor badge', pass: phone.includes('[Deactivated]') },
  { name: 'Deactivated contact hidden alert', pass: phone.includes('Contact and office details unavailable') },
  { name: 'Locked completed course banner', pass: phone.includes('Archived Semester Offering') },
  { name: 'Slides, Notes, Assignments, Quizzes, Exams in modal', pass: ['Slides', 'Notes', 'Assignments', 'Quizzes', 'Exams'].every(t => phone.includes(t)) },
  { name: 'Article 14 Absence meter', pass: phone.includes('Article 14') },
  { name: 'Hotkey Dashboard', pass: phone.includes('>Dashboard<') },
  { name: 'Hotkey Schedule', pass: phone.includes('>Schedule<') },
  { name: 'Hotkey Oliver AI', pass: phone.includes('>Oliver AI<') },
  { name: 'Hotkey Assignments', pass: phone.includes('>Assignments<') },
  { name: 'Hotkey Attendence', pass: phone.includes('>Attendence<') },
];

console.log('Mobile Phone Verification:');
for (const c of checks) {
  console.log('  [' + (c.pass ? 'PASS' : 'FAIL') + '] ' + c.name);
}
const allPass = checks.every(c => c.pass);
console.log('All Mobile Checks Passed:', allPass);
if (!allPass) process.exit(1);
process.exit(0);
