import fs from 'fs';

let phone = fs.readFileSync('client/public/phone.html', 'utf8');

// 1. Hide the Add Content button by default
phone = phone.replace(
  'id="cd-modal-doctor-add-btn" onclick="openDoctorAddMaterialModal()" class="text-[9px]',
  'id="cd-modal-doctor-add-btn" onclick="openDoctorAddMaterialModal()" class="hidden text-[9px]'
);

// 2. In openCourseDetailsModal, keep addBtn hidden for students
phone = phone.replace(
  "if (addBtn) addBtn.classList.remove('hidden');",
  "if (addBtn) addBtn.classList.add('hidden'); // Strictly hidden for students - authoring restricted to doctors"
);

// 3. In openDoctorAddMaterialModal, guard against student access
const oldOpenDocModal = `function openDoctorAddMaterialModal() {
      if (activePhoneCourseCode === 'CS101') {
        showToast("Completed courses are locked from adding new materials!");
        return;
      }
      document.getElementById('doctor-add-material-modal')?.classList.remove('hidden');
    }`;

const newOpenDocModal = `function openDoctorAddMaterialModal() {
      showToast("⚠️ Access Denied: Students cannot add or edit course materials, assignments, or exams. Restricted to instructors.");
      return;
    }`;

phone = phone.replace(oldOpenDocModal, newOpenDocModal);

// 4. Update CS101 modal handling to render locked submission status
const oldCs101Block = `if (courseCode === 'CS101') {
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
      }`;

const newCs101Block = `if (courseCode === 'CS101') {
        // COMPLETED & LOCKED COURSE with DEACTIVATED FACULTY & LOCKED SUBMISSIONS
        if (titleEl) titleEl.textContent = "CS101 Introduction to Computing (مقدمة في الحوسبة)";
        if (lockedBanner) lockedBanner.classList.remove('hidden');
        if (addBtn) addBtn.classList.add('hidden'); // Locked from new materials

        // Doctor is Deactivated
        if (docNameEl) docNameEl.textContent = "Dr. Samir Al-Najjar";
        if (docTitleEl) docTitleEl.textContent = "Former Assistant Professor of Computer Science";
        if (deactBadge) deactBadge.classList.remove('hidden');
        if (deactBox) deactBox.classList.remove('hidden');
        if (activeBox) activeBox.classList.add('hidden');

        // All assessment items in completed course show locked submission badges
        const asgnBadge = document.querySelector('#course-details-modal [onclick*=\"submit\"]');
        if (asgnBadge) {
          asgnBadge.outerHTML = '<span class=\"text-[9px] font-mono text-slate-400 font-bold bg-slate-800/80 px-2 py-0.5 rounded border border-white/10 select-none\">🔒 Closed (Course Completed)</span>';
        }
      }`;

phone = phone.replace(oldCs101Block, newCs101Block);

fs.writeFileSync('client/public/phone.html', phone);
fs.writeFileSync('dist/public/phone.html', phone);
fs.writeFileSync('phone_preview.html', phone);

const dest = 'C:\\\\Users\\\\abood\\\\.gemini\\\\antigravity\\\\brain\\\\8aa2adca-5a08-481d-adfc-6fc424d4db49\\\\phone_preview.html';
fs.writeFileSync(dest, phone);

console.log('Successfully updated mobile phone files with student access restrictions and submission lock on completed courses.');
