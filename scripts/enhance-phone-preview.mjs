import fs from 'fs';
import path from 'path';

const brainPath = 'C:\\Users\\abood\\.gemini\\antigravity\\brain\\8aa2adca-5a08-481d-adfc-6fc424d4db49\\phone_preview.html';
let html = fs.readFileSync(brainPath, 'utf8');

// Ensure tailwind cdn fallback
if (!html.includes('https://cdn.tailwindcss.com')) {
  html = html.replace(
    '<script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>',
    '<script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>\n  <script src="https://cdn.tailwindcss.com"></script>'
  );
}

// Ensure header has id="simulator-header"
html = html.replace('<header class="w-full max-w-5xl mb-4', '<header id="simulator-header" class="w-full max-w-5xl mb-4');

// Add responsive mobile CSS
const responsiveCss = `
    /* Real Mobile Device (Native Fullscreen App Feel) */
    @media (max-width: 640px) {
      html, body {
        padding: 0 !important;
        margin: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        overflow: hidden !important;
        background-color: #05110a !important;
      }
      #simulator-header {
        display: none !important;
      }
      #mobile-tools-trigger {
        display: inline-flex !important;
      }
      #phone-chassis {
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        border: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        background: #05110a !important;
      }
      #phone-screen {
        border-radius: 0 !important;
        border: none !important;
        width: 100% !important;
        height: 100% !important;
        box-shadow: none !important;
      }
      #status-bar {
        padding-top: 10px !important;
        padding-left: 14px !important;
        padding-right: 14px !important;
        height: 42px !important;
      }
      #dynamic-island {
        display: none !important;
      }
      #home-indicator {
        display: none !important;
      }
      #viewport-content {
        padding-bottom: 74px !important;
      }
    }
`;

if (!html.includes('/* Real Mobile Device (Native Fullscreen App Feel) */')) {
  html = html.replace('</style>', `${responsiveCss}\n  </style>`);
}

// Add Mobile Quick Toggle Button & Mobile Tools Modal before </main>
const mobileToolsButton = `
  <!-- Mobile Floating Switcher Trigger (Only visible on small mobile screens <= 640px) -->
  <button id="mobile-tools-trigger" onclick="toggleMobileToolsModal()" style="display: none;" class="fixed top-2.5 right-3 z-50 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 shadow-xl backdrop-blur-md items-center gap-1.5 active:scale-95 transition-all">
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    <span id="mobile-tools-label">Hanan • Student</span>
    <span class="text-xs">⚙️</span>
  </button>
`;

if (!html.includes('id="mobile-tools-trigger"')) {
  html = html.replace('<body class="', `${mobileToolsButton}\n<body class="`);
}

const mobileToolsModal = `
      <!-- Mobile Tools & Role Switcher Drawer (Mobile Viewport) -->
      <div id="mobile-tools-modal" class="hidden absolute inset-0 z-[60] bg-black/85 backdrop-blur-md flex flex-col justify-end p-3">
        <div class="bg-slate-900 border border-emerald-500/40 rounded-3xl p-4 space-y-4 max-h-[85%] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300 text-xs font-bold">O</div>
              <h4 class="text-sm font-bold text-white">Oliver Mobile Settings</h4>
            </div>
            <button onclick="toggleMobileToolsModal()" class="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">✕</button>
          </div>

          <!-- Select Student Persona -->
          <div class="space-y-1.5">
            <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Switch Student Persona</label>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="setStudent('hanan'); toggleMobileToolsModal();" id="m-btn-user-hanan" class="p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex flex-col items-center shadow">
                <span>Hanan (حنان)</span>
                <span class="text-[9px] text-emerald-200 font-mono">ID: 240002 • SE</span>
              </button>
              <button onclick="setStudent('abood'); toggleMobileToolsModal();" id="m-btn-user-abood" class="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex flex-col items-center">
                <span>Abood (عبود)</span>
                <span class="text-[9px] text-slate-400 font-mono">ID: 202212359 • CS</span>
              </button>
            </div>
          </div>

          <!-- Select Mode: Student vs Doctor -->
          <div class="space-y-1.5">
            <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Switch System Role</label>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="setRole('student'); toggleMobileToolsModal();" id="m-btn-role-student" class="p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow">
                <span>👨‍🎓 Student View</span>
              </button>
              <button onclick="setRole('doctor'); toggleMobileToolsModal();" id="m-btn-role-doctor" class="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1">
                <span>👨‍🏫 Doctor (د. أحمد)</span>
              </button>
            </div>
          </div>

          <!-- Language & Web App Links -->
          <div class="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button onclick="toggleLanguage(); toggleMobileToolsModal();" class="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1">
              <span>🌐</span>
              <span id="m-lang-label">Switch to العربية</span>
            </button>
            <a href="/" class="flex-1 py-2 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 text-center">
              <span>🚀 Open Full Web App</span>
            </a>
          </div>
        </div>
      </div>
`;

if (!html.includes('id="mobile-tools-modal"')) {
  html = html.replace('<!-- MODALS: Scanner Drawer, Doctor Projector Drawer, Assignment Submit, Grade -->', `${mobileToolsModal}\n      <!-- MODALS: Scanner Drawer, Doctor Projector Drawer, Assignment Submit, Grade -->`);
}

// Add script helper for mobile tools modal
const mobileJs = `
    function toggleMobileToolsModal() {
      const modal = document.getElementById('mobile-tools-modal');
      if (!modal) return;
      modal.classList.toggle('hidden');
    }

    // Update mobile tools trigger label on role or student change
    const originalSetStudent = setStudent;
    setStudent = function(who) {
      originalSetStudent(who);
      const label = document.getElementById('mobile-tools-label');
      if (label) {
        label.textContent = (who === 'hanan' ? 'Hanan' : 'Abood') + ' • ' + (currentRole === 'doctor' ? 'Doctor' : 'Student');
      }
      const mbHanan = document.getElementById('m-btn-user-hanan');
      const mbAbood = document.getElementById('m-btn-user-abood');
      if (mbHanan && mbAbood) {
        if (who === 'hanan') {
          mbHanan.className = 'p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex flex-col items-center shadow';
          mbAbood.className = 'p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex flex-col items-center';
        } else {
          mbAbood.className = 'p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex flex-col items-center shadow';
          mbHanan.className = 'p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex flex-col items-center';
        }
      }
    };

    const originalSetRole = setRole;
    setRole = function(role) {
      originalSetRole(role);
      const label = document.getElementById('mobile-tools-label');
      if (label) {
        label.textContent = (currentStudent === 'hanan' ? 'Hanan' : 'Abood') + ' • ' + (role === 'doctor' ? 'Doctor' : 'Student');
      }
      const mbStudent = document.getElementById('m-btn-role-student');
      const mbDoctor = document.getElementById('m-btn-role-doctor');
      if (mbStudent && mbDoctor) {
        if (role === 'student') {
          mbStudent.className = 'p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow';
          mbDoctor.className = 'p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1';
        } else {
          mbDoctor.className = 'p-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow';
          mbStudent.className = 'p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1';
        }
      }
    };
`;

if (!html.includes('toggleMobileToolsModal')) {
  html = html.replace('// Initialize', `${mobileJs}\n    // Initialize`);
}

// Write to brain artifact
fs.writeFileSync(brainPath, html, 'utf8');

// Write to client/public/phone.html
const clientPublicPath = path.resolve('client', 'public', 'phone.html');
fs.writeFileSync(clientPublicPath, html, 'utf8');

// Write to dist/public/phone.html if dist/public exists
const distPublicDir = path.resolve('dist', 'public');
if (fs.existsSync(distPublicDir)) {
  fs.writeFileSync(path.join(distPublicDir, 'phone.html'), html, 'utf8');
}

console.log('Successfully enhanced phone preview and synchronized to client/public/phone.html & dist/public/phone.html!');
