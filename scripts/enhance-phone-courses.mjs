import fs from "fs";

let html = fs.readFileSync("client/public/phone.html", "utf8");

const targetModalInsertion = `      <!-- iOS Home Indicator -->`;

const newModals = `      <!-- 9. Comprehensive Course Details Modal (ZUJ E-Learning Template) -->
      <div id="course-details-modal" class="hidden absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end p-2">
        <div class="bg-slate-900 border border-emerald-500/40 rounded-3xl p-4 space-y-3.5 max-h-[92%] overflow-y-auto mobile-scroll">
          
          <!-- Header & Title -->
          <div class="flex items-start justify-between border-b border-white/10 pb-2.5">
            <div>
              <div class="flex items-center gap-1.5 mb-1">
                <span id="cd-modal-code" class="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">CS201</span>
                <span id="cd-modal-modality" class="text-[9px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full">🏛️ وجاهي كامل • 3 Cr</span>
                <span id="cd-modal-status-badge" class="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <h4 id="cd-modal-title" class="text-xs font-bold text-white">CS201 Data Structures (تراكيب البيانات)</h4>
              <p id="cd-modal-desc" class="text-[10px] text-slate-300 mt-0.5 leading-snug">
                Fundamental data structures: AVL trees, graphs, heaps, and asymptotic algorithmic analysis.
              </p>
            </div>
            <button onclick="closeCourseDetailsModal()" class="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">✕</button>
          </div>

          <!-- Locked / Archived Completed Course Banner -->
          <div id="cd-modal-locked-banner" class="hidden p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-amber-300">
              <span class="flex items-center gap-1.5">
                <span>🔒</span> <span>Archived Semester Offering (Locked)</span>
              </span>
              <span class="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">Passed (A)</span>
            </div>
            <p class="text-[9px] text-slate-300 leading-snug">
              This course was passed in Fall 2025/2026. Content is permanently archived and locked from other semesters.
            </p>
          </div>

          <!-- Progress Bar (Matching recording) -->
          <div class="p-2.5 rounded-xl bg-slate-950 border border-white/5 space-y-1">
            <div class="flex justify-between text-[10px]">
              <span class="text-slate-400">Course Completion Progress</span>
              <span id="cd-modal-progress-label" class="text-emerald-400 font-mono font-bold">68%</span>
            </div>
            <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div id="cd-modal-progress-bar" class="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full w-[68%]"></div>
            </div>
          </div>

          <!-- ─── DOCTORS PROFILE & CONTACT (WITH DEACTIVATED RULE) ─── -->
          <div class="p-3 rounded-2xl bg-slate-950 border border-emerald-500/25 space-y-2">
            <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span class="text-[10px] font-bold text-white flex items-center gap-1.5">
                <span>👨‍🏫</span> <span>Lecturers' Names and Emails:</span>
              </span>
              <button onclick="togglePhoneDoctorDeactivated()" class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-white/10">
                Simulate Deactivation
              </button>
            </div>

            <div class="space-y-1.5 text-xs">
              <div class="flex items-center gap-2">
                <span id="cd-modal-doc-name" class="font-bold text-white">Dr. Ahmad Khalil</span>
                <span id="cd-modal-doc-deactivated-badge" class="hidden text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded">
                  [Deactivated]
                </span>
              </div>
              <p id="cd-modal-doc-title" class="text-[10px] text-slate-400">Associate Professor of AI & Software Systems</p>

              <!-- Deactivated Warning Notice -->
              <div id="cd-modal-doc-deactivated-box" class="hidden p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[10px] text-rose-200">
                ⚠️ <strong>Faculty Deactivated:</strong> Instructor is no longer active at the university. Office location and direct contact information are unavailable.
              </div>

              <!-- Active Contact Details -->
              <div id="cd-modal-doc-active-box" class="grid grid-cols-2 gap-2 pt-1 text-[10px] text-slate-300">
                <div class="p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <span class="text-slate-400 block text-[9px]">Office Number:</span>
                  <span id="cd-modal-doc-office" class="text-white font-semibold">IT Faculty - Room 302</span>
                </div>
                <div class="p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <span class="text-slate-400 block text-[9px]">University Email:</span>
                  <span id="cd-modal-doc-email" class="text-emerald-400 font-mono font-semibold truncate block">a.khalil@zuj.edu.jo</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance Quick Summary (Article 14) -->
          <div class="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span class="text-[9px] text-slate-400 block">Classroom Attendance</span>
              <span class="text-emerald-400 font-bold font-mono">93% • Safe (0/4 Absences)</span>
            </div>
            <button onclick="switchScreen('attendance'); closeCourseDetailsModal();" class="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold active:scale-95">
              QR Attend
            </button>
          </div>

          <!-- ─── CHAPTERS & MODULES LIST (Slides, Notes, Assignments, Quizzes, Exams) ─── -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-1">
              <span>Course Chapters & Learning Modules</span>
              <button id="cd-modal-doctor-add-btn" onclick="openDoctorAddMaterialModal()" class="text-[9px] px-2 py-0.5 rounded bg-emerald-600 text-white font-bold flex items-center gap-1 active:scale-95">
                <span>➕ Add Content</span>
              </button>
            </div>

            <!-- Chapter 1 -->
            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                <span>Chapter 1: Asymptotic Complexity & Big-O</span>
                <span class="text-[9px] font-mono text-slate-400">4 items</span>
              </div>
              <div class="space-y-1 text-[10px]">
                <div class="p-1.5 rounded-lg bg-purple-950/30 border border-purple-500/20 flex items-center justify-between text-slate-200">
                  <div class="flex items-center gap-1.5">
                    <span>📑</span> <span>Ch1 Slides: Big-O, Omega & Theta (2.8 MB)</span>
                  </div>
                  <button onclick="showToast('Downloading Ch1 Slides...')" class="text-[9px] text-purple-300 font-bold">Download</button>
                </div>
                <div class="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between text-slate-200">
                  <div class="flex items-center gap-1.5">
                    <span>📝</span> <span>Complexity Cheat Sheet (850 KB)</span>
                  </div>
                  <button onclick="showToast('Viewing Cheat Sheet...')" class="text-[9px] text-slate-300">View</button>
                </div>
                <div class="p-1.5 rounded-lg bg-blue-950/30 border border-blue-500/20 flex items-center justify-between text-slate-200">
                  <div class="flex items-center gap-1.5">
                    <span>⏱️</span> <span>Quiz 1: Big-O Verification (10 pts)</span>
                  </div>
                  <span class="text-[9px] font-mono text-amber-300">Due Nov 15</span>
                </div>
              </div>
            </div>

            <!-- Chapter 2 -->
            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-bold text-blue-400">
                <span>Chapter 2: Linear Data Structures (Stacks & Queues)</span>
                <span class="text-[9px] font-mono text-slate-400">2 items</span>
              </div>
              <div class="space-y-1 text-[10px]">
                <div class="p-1.5 rounded-lg bg-purple-950/30 border border-purple-500/20 flex items-center justify-between text-slate-200">
                  <div class="flex items-center gap-1.5">
                    <span>📑</span> <span>Ch2 Slides: Dynamic Array & Nodes (3.4 MB)</span>
                  </div>
                  <button onclick="showToast('Downloading Ch2 Slides...')" class="text-[9px] text-purple-300 font-bold">Download</button>
                </div>
                <div class="p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/20 flex items-center justify-between text-slate-200">
                  <div class="flex items-center gap-1.5">
                    <span>📋</span> <span>Assignment 1: Doubly Linked List Lab (15 pts)</span>
                  </div>
                  <span class="text-[9px] font-mono text-emerald-400 font-bold">Graded: 96</span>
                </div>
              </div>
            </div>

            <!-- Chapter 4: AVL Trees & Midterm -->
            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-bold text-amber-400">
                <span>Chapter 4: AVL Trees & Rotations</span>
                <span class="text-[9px] font-mono text-slate-400">3 items</span>
              </div>
              <div class="space-y-1 text-[10px]">
                <div class="p-1.5 rounded-lg bg-purple-950/30 border border-purple-500/20 flex items-center justify-between text-slate-200">
                  <div class="flex items-center gap-1.5">
                    <span>📑</span> <span>Ch4 Slides: Single & Double Rotations (4.1 MB)</span>
                  </div>
                  <button onclick="showToast('Downloading Ch4 Slides...')" class="text-[9px] text-purple-300 font-bold">Download</button>
                </div>
                <div class="p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/20 flex items-center justify-between text-slate-200">
                  <div class="flex items-center gap-1.5">
                    <span>📋</span> <span>Assignment 2: AVL Rotation Complexity (20 pts)</span>
                  </div>
                  <button onclick="closeCourseDetailsModal(); switchScreen('assignments');" class="text-[9px] text-amber-300 font-bold underline">Submit</button>
                </div>
                <div class="p-1.5 rounded-lg bg-rose-950/30 border border-rose-500/20 flex items-center justify-between text-slate-200">
                  <div class="flex items-center gap-1.5">
                    <span>🎓</span> <span>Midterm Exam (30 pts • Hall 41)</span>
                  </div>
                  <span class="text-[9px] font-mono text-rose-300">Nov 20</span>
                </div>
              </div>
            </div>

          </div>

          <button onclick="closeCourseDetailsModal()" class="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs active:scale-95">
            Done
          </button>
        </div>
      </div>

      <!-- 10. Doctor Add Material Modal (Mobile) -->
      <div id="doctor-add-material-modal" class="hidden absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col justify-end p-2">
        <div class="bg-slate-900 border border-emerald-500/50 rounded-3xl p-4 space-y-3 max-h-[85%] overflow-y-auto mobile-scroll">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
              <span>➕ Add Course Content</span>
            </h4>
            <button onclick="closeDoctorAddMaterialModal()" class="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">✕</button>
          </div>

          <div class="space-y-2.5 text-xs">
            <div>
              <label class="text-[10px] text-slate-400 block mb-1">Category:</label>
              <select id="m-add-type" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs">
                <option value="slides">Slides (شرائح العرض)</option>
                <option value="notes">Notes / Material (ملاحظات ومراجع)</option>
                <option value="activity">Activity (نشاط وتمرين)</option>
                <option value="assignment">Assignment (واجب دراسي)</option>
                <option value="quiz">Quiz (اختبار قصير)</option>
                <option value="exam">Exam (امتحان)</option>
              </select>
            </div>

            <div>
              <label class="text-[10px] text-slate-400 block mb-1">Chapter:</label>
              <select id="m-add-chapter" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs">
                <option value="1">Chapter 1: Asymptotic Complexity & Big-O</option>
                <option value="2">Chapter 2: Linear Data Structures</option>
                <option value="3">Chapter 3: Binary Search Trees</option>
                <option value="4">Chapter 4: AVL Trees & Rotations</option>
                <option value="5">Chapter 5: Graph Theory</option>
              </select>
            </div>

            <div>
              <label class="text-[10px] text-slate-400 block mb-1">Title:</label>
              <input id="m-add-title" type="text" placeholder="e.g. Ch1 Slides: Amortized Analysis" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs">
            </div>

            <div>
              <label class="text-[10px] text-slate-400 block mb-1">Attachment File Name:</label>
              <input id="m-add-filename" type="text" placeholder="e.g. CS201_Ch1_Slides.pdf" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs font-mono">
            </div>

            <button onclick="saveDoctorMaterialFromPhone()" class="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs active:scale-95 shadow">
              Add to Course Template
            </button>
          </div>
        </div>
      </div>
`;

if (html.includes(targetModalInsertion) && !html.includes('id="course-details-modal"')) {
  html = html.replace(targetModalInsertion, newModals + "\n" + targetModalInsertion);
  console.log("Successfully injected Course Details modals into client/public/phone.html");
}

// Add JavaScript handlers
const jsAdditions = `
    // Course Details Template & Deactivated Doctor Controls
    let activePhoneCourseCode = 'CS201';
    let isPhoneDoctorDeactivated = false;

    function openCourseDetailsModal(courseCode = 'CS201') {
      activePhoneCourseCode = courseCode;
      const modal = document.getElementById('course-details-modal');
      const titleEl = document.getElementById('cd-modal-title');
      const codeEl = document.getElementById('cd-modal-code');
      const lockedBanner = document.getElementById('cd-modal-locked-banner');
      const docNameEl = document.getElementById('cd-modal-doc-name');
      const docTitleEl = document.getElementById('cd-modal-doc-title');
      const deactBadge = document.getElementById('cd-modal-doc-deactivated-badge');
      const deactBox = document.getElementById('cd-modal-doc-deactivated-box');
      const activeBox = document.getElementById('cd-modal-doc-active-box');
      const addBtn = document.getElementById('cd-modal-doctor-add-btn');

      if (codeEl) codeEl.textContent = courseCode;

      if (courseCode === 'CS101') {
        // COMPLETED & LOCKED COURSE with DEACTIVATED FACULTY
        if (titleEl) titleEl.textContent = "CS101 Introduction to Computing (مقدمة في الحوسبة)";
        if (lockedBanner) lockedBanner.classList.remove('hidden');
        if (addBtn) addBtn.classList.add('hidden'); // Locked from new materials

        // Doctor is Deactivated
        if (docNameEl) docNameEl.textContent = "Dr. Samir Al-Najjar";
        if (docTitleEl) docTitleEl.textContent = "Former Assistant Professor of Computer Science";
        if (deactBadge) deactBadge.classList.remove('hidden');
        if (deactBox) deactBox.classList.remove('hidden');
        if (activeBox) activeBox.classList.add('hidden');
      } else {
        // ACTIVE IN-PROGRESS COURSE
        if (titleEl) titleEl.textContent = courseCode === 'CS202' ? "CS202 Object Oriented Programming (البرمجة كائنية التوجه)" : courseCode === 'PHYS102' ? "PHYS102 General Physics II (الفيزياء العامة 2)" : "CS201 Data Structures (تراكيب البيانات)";
        if (lockedBanner) lockedBanner.classList.add('hidden');
        if (addBtn) addBtn.classList.remove('hidden');

        if (isPhoneDoctorDeactivated) {
          if (docNameEl) docNameEl.textContent = "Dr. Ahmad Khalil";
          if (deactBadge) deactBadge.classList.remove('hidden');
          if (deactBox) deactBox.classList.remove('hidden');
          if (activeBox) activeBox.classList.add('hidden');
        } else {
          if (docNameEl) docNameEl.textContent = "Dr. Ahmad Khalil";
          if (docTitleEl) docTitleEl.textContent = "Associate Professor of AI & Software Systems";
          if (deactBadge) deactBadge.classList.add('hidden');
          if (deactBox) deactBox.classList.add('hidden');
          if (activeBox) activeBox.classList.remove('hidden');
        }
      }

      modal?.classList.remove('hidden');
    }

    function closeCourseDetailsModal() {
      document.getElementById('course-details-modal')?.classList.add('hidden');
    }

    function togglePhoneDoctorDeactivated() {
      isPhoneDoctorDeactivated = !isPhoneDoctorDeactivated;
      showToast(isPhoneDoctorDeactivated ? "Faculty Deactivated: contact details hidden" : "Faculty Active: contact details visible");
      openCourseDetailsModal(activePhoneCourseCode);
    }

    function openDoctorAddMaterialModal() {
      if (activePhoneCourseCode === 'CS101') {
        showToast("Completed courses are locked from adding new materials!");
        return;
      }
      document.getElementById('doctor-add-material-modal')?.classList.remove('hidden');
    }

    function closeDoctorAddMaterialModal() {
      document.getElementById('doctor-add-material-modal')?.classList.add('hidden');
    }

    function saveDoctorMaterialFromPhone() {
      const type = document.getElementById('m-add-type')?.value || 'slides';
      const chapter = document.getElementById('m-add-chapter')?.value || '1';
      const title = document.getElementById('m-add-title')?.value || 'New Lecture Slide';
      const filename = document.getElementById('m-add-filename')?.value || 'Lecture_Slide.pdf';

      showToast(\`Added \${type.toUpperCase()} to Chapter \${chapter} successfully!\`);
      closeDoctorAddMaterialModal();
    }
`;

const jsInsertionTarget = `// Initialize\n    renderAssignments();`;
if (html.includes(jsInsertionTarget) && !html.includes('openCourseDetailsModal')) {
  html = html.replace(jsInsertionTarget, jsAdditions + "\n" + jsInsertionTarget);
  console.log("Successfully injected Course Details JS into client/public/phone.html");
}

fs.writeFileSync("client/public/phone.html", html, "utf8");
console.log("phone.html updated successfully");
