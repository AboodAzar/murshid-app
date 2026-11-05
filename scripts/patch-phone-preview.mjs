import fs from "fs";

let c = fs.readFileSync("C:/Users/abood/.gemini/antigravity/brain/8aa2adca-5a08-481d-adfc-6fc424d4db49/phone_preview.html", "utf8");
c = c.replace(/\r\n/g, "\n");

// Update Profile Header in Dashboard screen
const oldProfile = `<h3 class="text-base font-bold text-white">Khaled Haddad</h3>
              <p class="text-[10px] text-slate-400">Software Engineering • 202210045</p>`;

const newProfile = `<h3 class="text-base font-bold text-white">Abdualrhman (Abood)</h3>
              <p class="text-[10px] text-slate-400">Computer Science • <span class="font-mono text-emerald-400 font-bold">ID: 202212359</span></p>`;

if (c.includes(oldProfile)) {
  c = c.replace(oldProfile, newProfile);
}

// Update KPI Ribbon in Dashboard: 100% Score System as Primary + 4.0 secondary
const oldGpaKpi = `<div class="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 text-center">
              <p class="text-[10px] text-slate-400">GPA</p>
              <p class="text-lg font-black text-emerald-400 mt-0.5">3.42</p>
              <span class="text-[9px] text-emerald-300">Very Good</span>
            </div>`;

const newGpaKpi = `<div class="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 text-center">
              <p class="text-[9px] text-slate-400 uppercase font-semibold">100% Score</p>
              <p class="text-lg font-black text-emerald-400 mt-0.5">88.5%</p>
              <span class="text-[9px] text-slate-400 font-mono block">(3.54 / 4.00)</span>
              <span class="text-[8px] text-emerald-300 font-bold">ممتاز (Excellent)</span>
            </div>`;

if (c.includes(oldGpaKpi)) {
  c = c.replace(oldGpaKpi, newGpaKpi);
}

// Update Next Lecture Alert Card to show ZUJ 4-Day & Modality
const oldNextLec = `<p class="text-[10px] text-emerald-400 font-semibold uppercase">Next Lecture • 11:30 AM</p>
                <h4 class="text-xs font-bold text-white">SE312 Software Architecture</h4>
                <p class="text-[10px] text-slate-400">Faculty of IT • Hall B-104</p>`;

const newNextLec = `<div class="flex items-center gap-1.5 mb-0.5">
                  <span class="text-[9px] text-emerald-400 font-bold uppercase">Sun 10:00 AM</span>
                  <span class="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 rounded border border-emerald-500/30">🌿 مدمج (وجاهي)</span>
                </div>
                <h4 class="text-xs font-bold text-white">CS304 Artificial Intelligence</h4>
                <p class="text-[10px] text-slate-400">Faculty of IT • Hall G-103</p>`;

if (c.includes(oldNextLec)) {
  c = c.replace(oldNextLec, newNextLec);
}

// Update Courses to show 100% numerical grades & modalities
const oldCoursesBlock = `<div class="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <div>
                  <h5 class="text-xs font-bold text-white">SE312 Software Architecture</h5>
                  <p class="text-[10px] text-slate-400">Dr. Ahmad Khalil • 3 Cr</p>
                </div>
                <div class="text-end">
                  <span class="text-xs font-bold text-amber-400">82%</span>
                  <p class="text-[9px] text-slate-500">In Progress</p>
                </div>
              </div>`;

const newCoursesBlock = `<div class="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <h5 class="text-xs font-bold text-white">CS304 Artificial Intelligence</h5>
                    <span class="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 rounded">🌿 مدمج</span>
                  </div>
                  <p class="text-[10px] text-slate-400">Dr. Omar Hassan • 3 Cr (Sun/Tue)</p>
                </div>
                <div class="text-end">
                  <span class="text-xs font-bold text-emerald-400 font-mono">88%</span>
                  <p class="text-[9px] text-slate-400 font-mono">(3.50)</p>
                </div>
              </div>
              <div class="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <h5 class="text-xs font-bold text-white">ENG102 Technical Writing</h5>
                    <span class="text-[8px] bg-indigo-500/20 text-indigo-300 px-1 rounded">💻 تيمز</span>
                  </div>
                  <p class="text-[10px] text-slate-400">Dr. Sara Mahmoud • 3 Cr (Mon/Wed)</p>
                </div>
                <div class="text-end">
                  <span class="text-xs font-bold text-teal-400 font-mono">92%</span>
                  <p class="text-[9px] text-slate-400 font-mono">(3.75)</p>
                </div>
              </div>`;

if (c.includes(oldCoursesBlock)) {
  c = c.replace(oldCoursesBlock, newCoursesBlock);
}

fs.writeFileSync("C:/Users/abood/.gemini/antigravity/brain/8aa2adca-5a08-481d-adfc-6fc424d4db49/phone_preview.html", c);
console.log("Updated phone_preview.html");
