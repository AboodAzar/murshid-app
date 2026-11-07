import fs from "fs";

let html = fs.readFileSync("client/public/phone.html", "utf8");

// 1. Next lecture card on dashboard
html = html.replace(
  `<div onclick="switchScreen('attendance')" class="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/25 zuj-card-shadow space-y-2 cursor-pointer hover:border-emerald-500/50">`,
  `<div onclick="openCourseDetailsModal('CS201')" class="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/25 zuj-card-shadow space-y-2 cursor-pointer hover:border-emerald-500/50">`
);

// 2. Schedule course cards
html = html.replace(
  `<div class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-blue-500 border border-white/5 space-y-1">`,
  `<div onclick="openCourseDetailsModal('CS202')" class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-blue-500 border border-white/5 space-y-1 cursor-pointer hover:border-blue-400">`
);

html = html.replace(
  `<div class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-rose-500 border border-white/5 space-y-1">`,
  `<div onclick="openCourseDetailsModal('PHYS102')" class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-rose-500 border border-white/5 space-y-1 cursor-pointer hover:border-rose-400">`
);

html = html.replace(
  `<div class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-emerald-500 border border-white/5 space-y-1">`,
  `<div onclick="openCourseDetailsModal('CS201')" class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-emerald-500 border border-white/5 space-y-1 cursor-pointer hover:border-emerald-400">`
);

html = html.replace(
  `<div class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-amber-500 border border-white/5 space-y-1">`,
  `<div onclick="openCourseDetailsModal('ENG102')" class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-amber-500 border border-white/5 space-y-1 cursor-pointer hover:border-amber-400">`
);

// 3. Roadmap completed CS101 card
html = html.replace(
  `<div class="p-2 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex items-center justify-between opacity-80">`,
  `<div onclick="openCourseDetailsModal('CS101')" class="p-2 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex items-center justify-between opacity-80 cursor-pointer hover:border-emerald-400">`
);

fs.writeFileSync("client/public/phone.html", html, "utf8");
console.log("Wired course modal triggers into client/public/phone.html");
