import fs from 'fs';

const content = fs.readFileSync('client/public/phone.html', 'utf8');

// Check student switching logic
const studentSwitch = content.match(/function setStudent[\s\S]*?function setDevice/);
console.log('=== setStudent ===\n', studentSwitch ? studentSwitch[0].slice(0, 1500) : 'Not found');

// Check ASSIGNMENTS_DB
const asgnDb = content.match(/const ASSIGNMENTS_DB = \[[\s\S]*?\];/);
console.log('=== ASSIGNMENTS_DB ===\n', asgnDb ? asgnDb[0].slice(0, 600) + '...' : 'Not found');
