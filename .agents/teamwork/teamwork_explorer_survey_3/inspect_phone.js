import fs from 'fs';

const content = fs.readFileSync('client/public/phone.html', 'utf8');

// Find all screen elements
const screens = [...content.matchAll(/id=["']screen-([^"']+)["']/g)].map(m => m[1]);
console.log('Screens found:', screens);

// Find all mock data variables or structures
const vars = [...content.matchAll(/(let|const|var)\s+([a-zA-Z0-9_]+)\s*=/g)].map(m => m[2]);
console.log('Top JS Variables:', vars.slice(0, 30));

// Find all modals
const modals = [...content.matchAll(/id=["']([^"']*-modal[^"']*)["']/g)].map(m => m[1]);
console.log('Modals found:', modals);
