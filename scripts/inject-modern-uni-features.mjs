import fs from 'fs';
import path from 'path';

const brainPath = 'C:\\Users\\abood\\.gemini\\antigravity\\brain\\8aa2adca-5a08-481d-adfc-6fc424d4db49\\phone_preview.html';
let html = fs.readFileSync(brainPath, 'utf8');

// 1. ADD WHAT-IF GRADE SIMULATOR BUTTON & MODAL
const whatIfButton = `
            <!-- What-If Grade Simulator Trigger -->
            <div class="col-span-2 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base">🧮</span>
                <div>
                  <h5 class="text-xs font-bold text-white">What-If Grade Simulator</h5>
                  <p class="text-[9px] text-slate-300">Simulate exam scores & projected GPA impact</p>
                </div>
              </div>
              <button onclick="openWhatIfModal()" class="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold active:scale-95 shadow">
                Simulate
              </button>
            </div>
`;

if (!html.includes('What-If Grade Simulator Trigger')) {
  html = html.replace('<!-- Next Lecture with Modality Badge -->', `${whatIfButton}\n          <!-- Next Lecture with Modality Badge -->`);
}

// 2. ADD 1-CLICK OFFICE HOURS BUTTON TO ADVISOR CARD
const officeHoursBtn = `
              <div class="flex items-center gap-1.5">
                <button onclick="openOfficeHoursModal()" class="px-2 py-1 rounded-xl bg-slate-800 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold active:scale-95">
                  Office Hours
                </button>
                <button onclick="switchScreen('chat')" class="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-bold active:scale-95">
                  Contact
                </button>
              </div>
`;

html = html.replace(
  `<button onclick="switchScreen('chat')" class="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-bold active:scale-95">\n              Contact\n            </button>`,
  officeHoursBtn
);

// 3. ADD MULTI-COURSE DEADLINE RADAR ON DASHBOARD
const deadlineRadarSection = `
          <!-- Multi-Course Deadline Radar (Anti-Deadline Surprises) -->
          <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/25 zuj-card-shadow space-y-2.5">
            <div class="flex items-center justify-between border-b border-white/10 pb-2">
              <div class="flex items-center gap-1.5">
                <span class="text-xs">🎯</span>
                <h4 class="text-xs font-bold text-white">Multi-Course Deadline Radar</h4>
              </div>
              <span class="text-[9px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">3 Tasks Due</span>
            </div>

            <div class="space-y-1.5 text-xs">
              <div onclick="switchScreen('assignments')" class="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between cursor-pointer hover:border-emerald-500/40">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">CS201</span>
                    <span class="text-[11px] font-bold text-white">AVL Tree Rotation</span>
                  </div>
                  <p class="text-[9px] text-slate-400">Due Nov 11 • 🏛️ وجاهي كامل</p>
                </div>
                <span class="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Pending</span>
              </div>

              <div onclick="switchScreen('assignments')" class="p-2 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[9px] font-mono text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.2 rounded">CS202</span>
                    <span class="text-[11px] font-bold text-white">Vehicle Hierarchy OOP</span>
                  </div>
                  <p class="text-[9px] text-slate-400">Due Nov 8 • 🏛️ وجاهي كامل</p>
                </div>
                <span class="text-[9px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">Submitted</span>
              </div>

              <div onclick="switchScreen('assignments')" class="p-2 rounded-xl bg-slate-950/80 border border-rose-500/20 flex items-center justify-between cursor-pointer hover:border-rose-500/40">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[9px] font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.2 rounded">PHYS102</span>
                    <span class="text-[11px] font-bold text-white">Gauss's Law Flux Lab</span>
                  </div>
                  <p class="text-[9px] text-slate-400">Due Oct 21 • 🌿 مدمج</p>
                </div>
                <span class="text-[9px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">Late Allowed</span>
              </div>
            </div>
          </div>
`;

if (!html.includes('Multi-Course Deadline Radar')) {
  html = html.replace('<!-- Next Lecture with Modality Badge -->', `${deadlineRadarSection}\n          <!-- Next Lecture with Modality Badge -->`);
}

// 4. ADD MODALS FOR WHAT-IF SIMULATOR & OFFICE HOURS SCHEDULER
const extraModals = `
      <!-- 5. What-If Grade Simulator Modal -->
      <div id="whatif-modal" class="hidden absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-2">
        <div class="bg-slate-900 border border-emerald-500/40 rounded-3xl p-4 space-y-3.5 max-h-[90%] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">🧮</span>
              <div>
                <h4 class="text-xs font-bold text-white">What-If Grade Simulator</h4>
                <p class="text-[9px] text-slate-400 font-mono">Continuous 100% scale • ZUJ Bylaws</p>
              </div>
            </div>
            <button onclick="closeWhatIfModal()" class="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">✕</button>
          </div>

          <!-- Select Course -->
          <div>
            <label class="text-[10px] text-slate-400 font-bold block mb-1">Select Course:</label>
            <select id="whatif-course-select" onchange="updateWhatIfCalc()" class="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-2 text-xs text-white font-semibold">
              <option value="CS201">CS201 - Data Structures (تراكيب البيانات) • 3 Cr</option>
              <option value="CS202">CS202 - Object Oriented Programming • 3 Cr</option>
              <option value="PHYS102">PHYS102 - General Physics II • 3 Cr</option>
              <option value="ENG102">ENG102 - Technical Writing • 3 Cr</option>
            </select>
          </div>

          <!-- Inputs -->
          <div class="space-y-2 bg-slate-950/70 p-3 rounded-2xl border border-white/5 text-xs">
            <div>
              <div class="flex justify-between text-[11px] mb-1">
                <span class="text-slate-300">Coursework & Lab:</span>
                <span id="whatif-val-cw" class="font-mono font-bold text-emerald-400">27 / 30</span>
              </div>
              <input type="range" min="0" max="30" value="27" id="whatif-slider-cw" oninput="updateWhatIfCalc()" class="w-full accent-emerald-500 h-2 bg-slate-800 rounded">
            </div>

            <div>
              <div class="flex justify-between text-[11px] mb-1">
                <span class="text-slate-300">Midterm Exam (Hypothetical):</span>
                <span id="whatif-val-mid" class="font-mono font-bold text-emerald-400">26 / 30</span>
              </div>
              <input type="range" min="0" max="30" value="26" id="whatif-slider-mid" oninput="updateWhatIfCalc()" class="w-full accent-emerald-500 h-2 bg-slate-800 rounded">
            </div>

            <div>
              <div class="flex justify-between text-[11px] mb-1">
                <span class="text-slate-300">Final Comprehensive Exam:</span>
                <span id="whatif-val-fin" class="font-mono font-bold text-emerald-400">36 / 40</span>
              </div>
              <input type="range" min="0" max="40" value="36" id="whatif-slider-fin" oninput="updateWhatIfCalc()" class="w-full accent-emerald-500 h-2 bg-slate-800 rounded">
            </div>
          </div>

          <!-- Live Projected Results -->
          <div class="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-950 border border-emerald-500/40 flex items-center justify-between">
            <div>
              <span class="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Projected Course Score</span>
              <p class="text-2xl font-black text-white font-mono">
                <span id="whatif-projected-score">89</span>
                <span class="text-xs text-emerald-400 font-bold">/ 100%</span>
              </p>
              <p id="whatif-grade-letter" class="text-[10px] text-emerald-300 font-bold">A- (أ-) • 3.75 GPA • Very Good</p>
            </div>

            <div class="text-end bg-black/40 p-2 rounded-xl border border-white/5">
              <span class="text-[9px] text-slate-400 block font-bold">Cumulative GPA Shift</span>
              <span id="whatif-gpa-shift" class="text-xs font-mono font-bold text-emerald-300">+0.65% (89.85%)</span>
            </div>
          </div>

          <button onclick="closeWhatIfModal()" class="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs active:scale-95 shadow">
            Apply Projection
          </button>
        </div>
      </div>

      <!-- 6. 1-Click Office Hours Scheduler Modal -->
      <div id="office-hours-modal" class="hidden absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-2">
        <div class="bg-slate-900 border border-emerald-500/40 rounded-3xl p-4 space-y-3.5 max-h-[85%] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Dr. Ahmad Khalil • Office Hours</span>
              </h4>
              <p class="text-[9px] text-slate-400">1-Click Slot Reservation • Faculty of IT</p>
            </div>
            <button onclick="closeOfficeHoursModal()" class="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">✕</button>
          </div>

          <div class="space-y-2 text-xs">
            <div id="slot-card-1" onclick="selectOfficeSlot(1)" class="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:border-emerald-500">
              <div>
                <span class="font-bold text-white">Sunday (الأحد) • 11:00 AM</span>
                <p class="text-[10px] text-slate-400">Hall 302 • In-Person Office</p>
              </div>
              <span id="slot-badge-1" class="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg">Available</span>
            </div>

            <div id="slot-card-2" onclick="selectOfficeSlot(2)" class="p-3 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between cursor-pointer hover:border-emerald-500">
              <div>
                <span class="font-bold text-white">Tuesday (الثلاثاء) • 01:00 PM</span>
                <p class="text-[10px] text-slate-400">Hall 302 • In-Person Office</p>
              </div>
              <span id="slot-badge-2" class="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">Available</span>
            </div>

            <div id="slot-card-3" onclick="selectOfficeSlot(3)" class="p-3 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between cursor-pointer hover:border-emerald-500">
              <div>
                <span class="font-bold text-white">Wednesday (الأربعاء) • 03:00 PM</span>
                <p class="text-[10px] text-slate-400">Virtual (MS Teams) • Online</p>
              </div>
              <span id="slot-badge-3" class="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">Available</span>
            </div>
          </div>

          <div id="office-slot-confirmed-msg" class="hidden p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-xs text-emerald-200">
            ✓ Reservation confirmed with Dr. Ahmad Khalil! Added to your schedule.
          </div>

          <button onclick="confirmOfficeSlot()" class="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs active:scale-95 shadow">
            Confirm Selected Slot
          </button>
        </div>
      </div>
`;

if (!html.includes('<!-- 5. What-If Grade Simulator Modal -->')) {
  html = html.replace('<!-- iOS Home Indicator -->', `${extraModals}\n      <!-- iOS Home Indicator -->`);
}

// 5. ENHANCE DOCTOR GRADE DRAWER WITH SPEEDGRADER RUBRICS & CHIPS
const speedGraderDoctorDrawer = `
          <!-- SpeedGrader Rapid Rubrics (Canvas Pattern) -->
          <div class="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <div class="flex items-center justify-between text-[10px]">
              <span class="font-bold text-white">SpeedGrader 1-Click Rubrics</span>
              <span class="text-emerald-400 font-mono font-bold">Rapid Presets</span>
            </div>
            <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
              <button type="button" onclick="applySpeedGrade(100, 'Excellent solution! Optimal logic & clean complexity.')" class="p-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold">
                100%
              </button>
              <button type="button" onclick="applySpeedGrade(85, 'Very good logic. Pay attention to balance factor formulas.')" class="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold">
                85%
              </button>
              <button type="button" onclick="applySpeedGrade(75, 'Late submission grace accepted (-5% deducted per policy).')" class="p-1.5 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300 font-bold">
                75% (Late)
              </button>
            </div>
            <div class="flex flex-wrap gap-1 pt-1">
              <button type="button" onclick="appendFeedback('Optimal AVL rotation code.')" class="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">+ Optimal code</button>
              <button type="button" onclick="appendFeedback('Check null pointer edge cases.')" class="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">+ Edge cases</button>
              <button type="button" onclick="appendFeedback('Documented late submission grace.')" class="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">+ Late grace</button>
            </div>
          </div>
`;

if (!html.includes('SpeedGrader Rapid Rubrics (Canvas Pattern)')) {
  html = html.replace('<div>\n            <label class="text-[10px] text-slate-400 font-bold block mb-1">Score (0-100):</label>', `${speedGraderDoctorDrawer}\n          <div>\n            <label class="text-[10px] text-slate-400 font-bold block mb-1">Score (0-100):</label>`);
}

// 6. ADD JAVASCRIPT HELPERS FOR WHAT-IF, OFFICE HOURS, AND SPEEDGRADER
const extraJs = `
    // What-If Grade Simulator logic
    function openWhatIfModal() {
      document.getElementById('whatif-modal')?.classList.remove('hidden');
      updateWhatIfCalc();
    }
    function closeWhatIfModal() {
      document.getElementById('whatif-modal')?.classList.add('hidden');
    }
    function updateWhatIfCalc() {
      const cw = Number(document.getElementById('whatif-slider-cw')?.value || 27);
      const mid = Number(document.getElementById('whatif-slider-mid')?.value || 26);
      const fin = Number(document.getElementById('whatif-slider-fin')?.value || 36);

      document.getElementById('whatif-val-cw').textContent = cw + ' / 30';
      document.getElementById('whatif-val-mid').textContent = mid + ' / 30';
      document.getElementById('whatif-val-fin').textContent = fin + ' / 40';

      const total = Math.min(100, Math.max(0, cw + mid + fin));
      document.getElementById('whatif-projected-score').textContent = total;

      let grade = 'A (أ) • 4.00 GPA • Excellent';
      if (total < 60) grade = 'F (هـ) • 0.00 GPA • Fail';
      else if (total < 70) grade = 'C (جـ) • 2.00 GPA • Pass';
      else if (total < 80) grade = 'B (ب) • 3.00 GPA • Good';
      else if (total < 90) grade = 'B+ (ب+) • 3.50 GPA • Very Good';

      document.getElementById('whatif-grade-letter').textContent = grade;
      const delta = ((total - 84) * 0.05).toFixed(2);
      const isPos = parseFloat(delta) >= 0;
      document.getElementById('whatif-gpa-shift').textContent = (isPos ? '+' + delta : delta) + '% shift';
    }

    // Office Hours logic
    let activeOfficeSlot = 1;
    function openOfficeHoursModal() {
      document.getElementById('office-hours-modal')?.classList.remove('hidden');
    }
    function closeOfficeHoursModal() {
      document.getElementById('office-hours-modal')?.classList.add('hidden');
    }
    function selectOfficeSlot(id) {
      activeOfficeSlot = id;
      [1, 2, 3].forEach(n => {
        const card = document.getElementById('slot-card-' + n);
        const badge = document.getElementById('slot-badge-' + n);
        if (n === id) {
          card?.classList.add('border-emerald-500', 'bg-emerald-950/40');
          if (badge) badge.textContent = 'Selected';
        } else {
          card?.classList.remove('border-emerald-500', 'bg-emerald-950/40');
          if (badge) badge.textContent = 'Available';
        }
      });
    }
    function confirmOfficeSlot() {
      const msg = document.getElementById('office-slot-confirmed-msg');
      if (msg) msg.classList.remove('hidden');
      setTimeout(() => {
        closeOfficeHoursModal();
        showToast('✓ Office hour slot reserved with Dr. Ahmad Khalil!');
      }, 1200);
    }

    // SpeedGrader doctor helpers
    function applySpeedGrade(score, comment) {
      const scoreInput = document.getElementById('grade-modal-score');
      const feedInput = document.getElementById('grade-modal-feedback');
      if (scoreInput) scoreInput.value = score;
      if (feedInput) feedInput.value = comment;
    }
    function appendFeedback(snippet) {
      const feedInput = document.getElementById('grade-modal-feedback');
      if (feedInput) {
        feedInput.value = feedInput.value ? feedInput.value + ' ' + snippet : snippet;
      }
    }
`;

if (!html.includes('updateWhatIfCalc')) {
  html = html.replace('// Initialize', `${extraJs}\n    // Initialize`);
}

// Write to brain artifact
fs.writeFileSync(brainPath, html, 'utf8');

// Write to client/public/phone.html
const clientPublicPath = path.resolve('client', 'public', 'phone.html');
fs.writeFileSync(clientPublicPath, html, 'utf8');

// Write to dist/public/phone.html
const distPublicDir = path.resolve('dist', 'public');
if (fs.existsSync(distPublicDir)) {
  fs.writeFileSync(path.join(distPublicDir, 'phone.html'), html, 'utf8');
}

console.log('Successfully injected modern university features into phone preview!');
