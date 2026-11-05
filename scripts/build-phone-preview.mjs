import fs from "fs";
import path from "path";

const targetPath = "C:/Users/abood/.gemini/antigravity/brain/8aa2adca-5a08-481d-adfc-6fc424d4db49/phone_preview.html";

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oliver - Authentic ZUJ Mobile Experience Simulator</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    .mobile-scroll::-webkit-scrollbar { width: 4px; }
    .mobile-scroll::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
    .mobile-scroll::-webkit-scrollbar-thumb { background: rgba(34, 197, 94, 0.35); border-radius: 4px; }
    .mobile-scroll::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.7); }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.03); }
    }
    .animate-glow { animation: pulseGlow 3.5s ease-in-out infinite; }
    .zuj-card-shadow { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.25); }
    .screen-view { animation: fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-2 md:p-6 antialiased flex flex-col items-center justify-center font-sans selection:bg-emerald-500/30">

  <!-- Top Simulator Control Bar (UI/UX Pro Max Multi-Persona Bar) -->
  <header class="w-full max-w-5xl mb-4 bg-slate-900/90 border border-emerald-500/25 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/30">
          <span class="text-white font-black text-base">O</span>
        </div>
        <div>
          <h1 class="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span>Oliver Mobile Experience Simulator</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">ZUJ Portal & Elearning 2026</span>
          </h1>
          <p class="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Interactive Student & Faculty Experience</span>
            <span class="text-slate-600">•</span>
            <span class="text-emerald-400 font-medium">4-Day Timetable • Late Submission System • Continuous 100% Scale</span>
          </p>
        </div>
      </div>

      <!-- Persona & Role Switchers (Student Hanan vs Doctor Ahmad Khalil) -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Student Profile Selector -->
        <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
          <button onclick="setStudent('hanan')" id="btn-user-hanan" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold transition-all flex items-center gap-1.5 shadow">
            <span class="w-2 h-2 rounded-full bg-emerald-300"></span>
            <span>Hanan (240002)</span>
            <span class="text-[9px] bg-emerald-900/60 px-1 rounded text-emerald-200">Active</span>
          </button>
          <button onclick="setStudent('abood')" id="btn-user-abood" class="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5">
            <span>Abood (202212359)</span>
          </button>
        </div>

        <!-- Role Toggle (Student View vs Doctor Review View) -->
        <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
          <button onclick="setRole('student')" id="btn-role-student" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold transition-all flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Student View</span>
          </button>
          <button onclick="setRole('doctor')" id="btn-role-doctor" class="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            <span>Doctor View (د. أحمد خليل)</span>
          </button>
        </div>

        <!-- Device Selector -->
        <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button onclick="setDevice('iphone')" id="dev-btn-iphone" class="px-2 py-1 rounded-lg bg-emerald-600 text-white font-semibold transition-all">iPhone 15 Pro</button>
          <button onclick="setDevice('samsung')" id="dev-btn-samsung" class="px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-all">Galaxy S24</button>
        </div>

        <!-- Bilingual Toggle -->
        <button onclick="toggleLanguage()" id="lang-toggle-btn" class="min-h-[34px] flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-white/10 transition-colors active:scale-95">
          <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          <span id="lang-label">العربية (RTL)</span>
        </button>
      </div>
    </div>

    <!-- Screen Navigation Switcher (8 Dedicated Interactive Views) -->
    <div class="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-white/10 overflow-x-auto max-w-full">
      <button onclick="switchScreen('assignments')" id="btn-assignments" class="screen-btn min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-600 text-white shadow flex items-center gap-1.5 active:scale-95">
        <svg class="w-3.5 h-3.5 text-emerald-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span data-i18n="nav.assignments">Assignments (واجبات حنان)</span>
        <span class="text-[10px] bg-rose-500/30 text-rose-300 px-1.5 rounded-full font-mono font-bold">4</span>
      </button>

      <button onclick="switchScreen('oliver-hub')" id="btn-oliver-hub" class="screen-btn min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 active:scale-95">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span data-i18n="nav.hub">Oliver Hub</span>
      </button>

      <button onclick="switchScreen('zuj-schedule')" id="btn-zuj-schedule" class="screen-btn min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 active:scale-95">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span data-i18n="nav.schedule">Hanan Schedule (الجدول)</span>
      </button>

      <button onclick="switchScreen('zuj-elearning')" id="btn-zuj-elearning" class="screen-btn min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 active:scale-95">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span data-i18n="nav.elearn">ZUJ Elearning</span>
      </button>

      <button onclick="switchScreen('zuj-portal')" id="btn-zuj-portal" class="screen-btn min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 active:scale-95">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span data-i18n="nav.portal">ZUJ Portal</span>
      </button>

      <button onclick="switchScreen('curriculums')" id="btn-curriculums" class="screen-btn min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 active:scale-95">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        <span data-i18n="nav.curriculum">Curriculums</span>
      </button>

      <button onclick="switchScreen('chat')" id="btn-chat" class="screen-btn min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 active:scale-95">
        <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
        <span data-i18n="nav.ai">Oliver AI</span>
      </button>

      <button onclick="switchScreen('map')" id="btn-map" class="screen-btn min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 active:scale-95">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span data-i18n="nav.campus">Campus Nav</span>
      </button>
    </div>
  </header>

  <!-- Mobile Phone Outer Chassis -->
  <main id="phone-chassis" class="relative w-[392px] h-[835px] max-w-full rounded-[50px] p-3.5 bg-gradient-to-b from-[#242b25] via-[#161d18] to-[#0c120e] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(34,197,94,0.18)] border-4 border-[#3a493c] transition-all duration-300 flex flex-col overflow-hidden">
    
    <!-- Phone Screen Bezel Container -->
    <div id="phone-screen" dir="ltr" class="relative w-full h-full rounded-[42px] bg-[#05110a] overflow-hidden flex flex-col border border-white/10 shadow-inner">

      <!-- Dynamic Top Bar (Dynamic Island for iPhone / Punch hole for Galaxy) -->
      <div id="status-bar" class="relative z-50 h-11 w-full pt-3 px-6 flex items-center justify-between text-white text-xs select-none">
        <span class="font-semibold text-[13px] tracking-tight">9:41</span>
        
        <!-- iPhone Dynamic Island Hardware Pill -->
        <div id="dynamic-island" class="absolute left-1/2 -translate-x-1/2 top-2.5 h-6 w-32 bg-black rounded-full flex items-center justify-between px-3 border border-white/10 shadow-sm transition-all duration-300">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span id="island-badge" class="text-[9px] text-emerald-400 font-mono font-bold">Hanan • ZUJ</span>
          </div>
        </div>

        <!-- System Status Icons -->
        <div class="flex items-center gap-2 text-white/90">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 18.25A10.93 10.93 0 012 12C2 6.48 6.48 2 12 2s10 4.48 10 10c0 2.32-.78 4.46-2.1 6.18l-.62-.62A8.96 8.96 0 0021 12c0-4.97-4.03-9-9-9z"/>
          </svg>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A17.9 17.9 0 0012 4zm0 4c3.34 0 6.37 1.34 8.59 3.51L12 19.89 3.41 11.51C5.63 9.34 8.66 8 12 8z"/>
          </svg>
          <div class="w-5 h-2.5 rounded-xs border border-white/70 p-0.5 flex items-center">
            <div class="h-full w-full bg-emerald-400 rounded-2xs"></div>
          </div>
        </div>
      </div>

      <!-- Scrollable Main Mobile Viewport -->
      <div id="viewport-content" class="mobile-scroll flex-1 overflow-y-auto px-4 pb-20 pt-1 text-slate-100">

        <!-- ============================================== -->
        <!-- SCREEN 0: ASSIGNMENTS DASHBOARD (PRIMARY FOCUS) -->
        <!-- ============================================== -->
        <section id="screen-assignments" class="screen-view space-y-3.5">
          <!-- Assignments Header -->
          <div class="flex items-center justify-between pt-1 pb-1 border-b border-white/10">
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="text-sm font-extrabold text-white" data-i18n="asgn.title">Course Assignments</h3>
                <span id="role-tag-badge" class="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">Student: Hanan</span>
              </div>
              <p class="text-[10px] text-slate-400" data-i18n="asgn.subtitle">Assignments from course doctors & advisors</p>
            </div>
            <button onclick="switchScreen('zuj-schedule')" class="text-[10px] font-semibold px-2 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 transition-colors flex items-center gap-1">
              <span data-i18n="asgn.scheduleBtn">Schedule</span>
              <svg class="w-3 h-3 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Doctor View Warning Alert (Visible when viewing as Doctor) -->
          <div id="doctor-mode-banner" class="hidden p-3 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-xs text-blue-200 space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span class="font-bold text-blue-300">Doctor Mode: Dr. Ahmad Khalil (Advisor)</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-snug">
              Reviewing Hanan's registered course submissions. Overdue items are clearly flagged with late submission notices.
            </p>
          </div>

          <!-- Assignment Filter Tabs (All / Pending / Submitted / Graded / Overdue) -->
          <div class="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 overflow-x-auto text-[11px] font-semibold">
            <button onclick="filterAssignments('all')" id="tab-asgn-all" class="asgn-tab-btn flex-1 min-h-[30px] px-2 py-1 rounded-lg bg-emerald-600 text-white text-center shadow">
              <span data-i18n="asgn.tabAll">All</span> <span class="text-[9px] opacity-80">(4)</span>
            </button>
            <button onclick="filterAssignments('pending')" id="tab-asgn-pending" class="asgn-tab-btn flex-1 min-h-[30px] px-2 py-1 rounded-lg text-slate-400 hover:text-white text-center">
              <span data-i18n="asgn.tabPending">Pending</span> <span class="text-[9px] opacity-80">(1)</span>
            </button>
            <button onclick="filterAssignments('submitted')" id="tab-asgn-submitted" class="asgn-tab-btn flex-1 min-h-[30px] px-2 py-1 rounded-lg text-slate-400 hover:text-white text-center">
              <span data-i18n="asgn.tabSubmitted">Submitted</span> <span class="text-[9px] opacity-80">(1)</span>
            </button>
            <button onclick="filterAssignments('graded')" id="tab-asgn-graded" class="asgn-tab-btn flex-1 min-h-[30px] px-2 py-1 rounded-lg text-slate-400 hover:text-white text-center">
              <span data-i18n="asgn.tabGraded">Graded</span> <span class="text-[9px] opacity-80">(1)</span>
            </button>
            <button onclick="filterAssignments('overdue')" id="tab-asgn-overdue" class="asgn-tab-btn flex-1 min-h-[30px] px-2 py-1 rounded-lg text-slate-400 hover:text-white text-center">
              <span data-i18n="asgn.tabOverdue">Overdue</span> <span class="text-[9px] text-rose-400 font-bold">(1)</span>
            </button>
          </div>

          <!-- Dynamic Assignment Cards Container -->
          <div id="assignments-cards-container" class="space-y-3">
            <!-- Populated via renderAssignments() -->
          </div>
        </section>

        <!-- ============================================== -->
        <!-- SCREEN 1: OLIVER UNIFIED HUB                   -->
        <!-- ============================================== -->
        <section id="screen-oliver-hub" class="screen-view hidden space-y-3.5">
          <!-- Student Header with Authentic ID -->
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-600 to-amber-500 p-0.5 shadow-md">
                  <div class="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-sm text-emerald-300">
                    <span id="hub-avatar-initials">HA</span>
                  </div>
                </div>
                <span class="absolute -bottom-0.5 -end-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#05110a] rounded-full"></span>
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <h3 id="hub-student-name" class="text-sm font-extrabold text-white">Hanan (حنان)</h3>
                  <span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30 font-bold">ZUJ</span>
                </div>
                <p class="text-[10px] text-slate-400 font-mono">
                  <span data-i18n="student.idLabel">ID:</span> <span id="hub-student-id" class="text-emerald-400 font-bold">240002</span> • <span id="hub-student-dept">Software Eng</span>
                </p>
              </div>
            </div>

            <button onclick="switchScreen('assignments')" class="min-h-[36px] text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 transition-colors flex items-center gap-1">
              <span>Assignments</span>
              <svg class="w-3 h-3 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Academic & Advisor Banner -->
          <div class="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-slate-900/90 border border-emerald-500/30 zuj-card-shadow relative overflow-hidden flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-[10px] text-emerald-300 font-medium">Academic Advisor (المرشد الأكاديمي)</span>
              <h4 class="text-xs font-extrabold text-white">Dr. Ahmad Khalil (د. أحمد خليل)</h4>
              <p class="text-[10px] text-slate-400">Department of Software Engineering • IT Faculty</p>
            </div>
            <button onclick="openChatWithAdvisor()" class="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold active:scale-95 shadow">
              Contact
            </button>
          </div>

          <!-- Unified ZUJ Academic & Financial Cards -->
          <div class="grid grid-cols-2 gap-2.5">
            <!-- Cumulative GPA Card -->
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/25 zuj-card-shadow relative overflow-hidden">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-emerald-300 font-medium" data-i18n="hub.cummGpa">Cumulative GPA</span>
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">%</div>
              </div>
              <p class="text-lg font-black text-emerald-400 font-mono">89.2%</p>
              <p class="text-[9px] text-slate-300 font-mono mt-0.5">3.78 / 4.00 • <span class="text-emerald-300 font-bold">Excellent (ممتاز)</span></p>
            </div>

            <!-- Financial Debit Balance Card -->
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-white/10 zuj-card-shadow relative overflow-hidden">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-slate-400 font-medium" data-i18n="hub.finBalance">Financial Balance</span>
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">JD</div>
              </div>
              <p class="text-lg font-black text-white font-mono">680 <span class="text-xs text-emerald-400 font-sans">[Credit]</span></p>
              <p class="text-[9px] text-emerald-400 font-medium mt-0.5">40% Excellence Merit Award</p>
            </div>
          </div>

          <!-- Pending Assignment Alert Strip -->
          <div onclick="switchScreen('assignments')" class="p-3 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900/80 to-slate-900/90 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] font-bold text-amber-400 uppercase tracking-wide">Assignment Due in 6 Days</span>
                  <span class="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">CS201</span>
                </div>
                <p class="text-xs font-bold text-white leading-tight">AVL Tree Rotation Complexity</p>
                <p class="text-[9px] text-slate-400">Dr. Ahmad Khalil • Due Nov 11, 23:59</p>
              </div>
            </div>
            <button class="min-h-[32px] px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 active:scale-95">
              Solve
            </button>
          </div>

          <!-- Next Lecture: CS201 Data Structures -->
          <div onclick="openCourseModal('CS201', 'Data Structures (تراكيب البيانات)', 'وجاهي كامل (In-Person)', 'Hall 41 (Faculty of Science & IT)', 'Tuesday 11:30 - 12:20', 'Dr. Ahmad Khalil')" class="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/25 zuj-card-shadow space-y-2.5 cursor-pointer hover:border-emerald-500/50 transition-colors">
            <div class="flex items-center justify-between border-b border-white/5 pb-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Next Class • Tuesday 11:30</span>
              </div>
              <span class="text-[9px] font-mono bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                CS201 • Room 41
              </span>
            </div>

            <div>
              <h4 class="text-xs font-extrabold text-white">CS201 Data Structures (تراكيب البيانات)</h4>
              <p class="text-[11px] text-slate-300 mt-0.5">Faculty of Science & IT • Hall 41 • Dr. Ahmad Khalil</p>
            </div>

            <!-- Modality & Time Details -->
            <div class="flex flex-wrap items-center gap-2 text-[10px]">
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                🏛️ وجاهي كامل (In-Person)
              </span>
              <span class="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-mono">
                [ 11:30_12:20 ] Tuesday
              </span>
              <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                3 Credit Hours
              </span>
            </div>

            <!-- Quick Action Row -->
            <div class="grid grid-cols-2 gap-2 pt-1" onclick="event.stopPropagation()">
              <button onclick="switchScreen('map')" class="min-h-[44px] w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-white/10 active:scale-95">
                <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Hall 41 Route</span>
              </button>
              <button onclick="switchScreen('assignments')" class="min-h-[44px] w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
                <span>View Homework</span>
              </button>
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- SCREEN 2: AUTHENTIC ZUJ PORTAL                 -->
        <!-- ============================================== -->
        <section id="screen-zuj-portal" class="screen-view hidden space-y-3.5">
          <!-- ZUJ University Portal Brand Header -->
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow">
                ZUJ
              </div>
              <div>
                <h4 class="text-xs font-bold text-white" data-i18n="portal.title">ZUJ Student Portal App</h4>
                <p class="text-[9px] text-slate-400" data-i18n="portal.subtitle">بوابة الطالب - جامعة الزيتونة الأردنية</p>
              </div>
            </div>
            <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              2026/2027-1
            </span>
          </div>

          <!-- 4 Core Portal Stat Cards -->
          <div class="grid grid-cols-2 gap-2">
            <!-- 1. Cumulative GPA -->
            <div class="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                %
              </div>
              <div>
                <p class="text-[9px] text-emerald-400 uppercase font-medium" data-i18n="portal.cummGpa">Cumulative GPA</p>
                <p class="text-sm font-black text-emerald-400 font-mono">89.2%</p>
              </div>
            </div>

            <!-- 2. Registered Hours -->
            <div class="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                Cr
              </div>
              <div>
                <p class="text-[9px] text-slate-400 uppercase font-medium">Registered</p>
                <p class="text-sm font-bold text-white font-mono">12 Cr (4 Courses)</p>
              </div>
            </div>

            <!-- 3. Active Assignments -->
            <div onclick="switchScreen('assignments')" class="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-2.5 cursor-pointer hover:border-emerald-500/40">
              <div class="w-9 h-9 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
              </div>
              <div>
                <p class="text-[9px] text-slate-400 uppercase font-medium" data-i18n="portal.homeworks">Active Homeworks</p>
                <p class="text-sm font-bold text-white font-mono">4 Total</p>
              </div>
            </div>

            <!-- 4. Plan Progress -->
            <div class="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon></svg>
              </div>
              <div>
                <p class="text-[9px] text-slate-400 uppercase font-medium" data-i18n="portal.planProgress">Plan Progress</p>
                <p class="text-sm font-bold text-white font-mono">48 / 133 Cr (36%)</p>
              </div>
            </div>
          </div>

          <!-- Academic Marks Breakdown Table -->
          <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
            <div class="flex items-center justify-between">
              <h5 class="text-xs font-bold text-white" data-i18n="portal.transcriptTitle">Course Results (كشف العلامات)</h5>
              <span class="text-[9px] text-slate-400">Semester 2026/1</span>
            </div>
            
            <div class="space-y-1.5 text-xs">
              <div class="p-2 rounded-xl bg-white/[0.03] flex items-center justify-between">
                <div>
                  <p class="font-bold text-white text-[11px]">CS201 Data Structures</p>
                  <p class="text-[9px] text-slate-400 font-mono">Dr. Ahmad Khalil • 3 Cr</p>
                </div>
                <div class="text-end">
                  <span class="text-emerald-400 font-bold font-mono">94%</span>
                  <span class="text-[9px] text-slate-400 block">أ (A)</span>
                </div>
              </div>
              <div class="p-2 rounded-xl bg-white/[0.03] flex items-center justify-between">
                <div>
                  <p class="font-bold text-white text-[11px]">CS202 Object Oriented Programming</p>
                  <p class="text-[9px] text-slate-400 font-mono">Dr. Ahmad Khalil • 3 Cr</p>
                </div>
                <div class="text-end">
                  <span class="text-emerald-400 font-bold font-mono">91%</span>
                  <span class="text-[9px] text-slate-400 block">أ- (A-)</span>
                </div>
              </div>
              <div class="p-2 rounded-xl bg-white/[0.03] flex items-center justify-between">
                <div>
                  <p class="font-bold text-white text-[11px]">ENG102 Technical Writing</p>
                  <p class="text-[9px] text-slate-400 font-mono">Dr. Sara Mahmoud • 3 Cr</p>
                </div>
                <div class="text-end">
                  <span class="text-emerald-400 font-bold font-mono">88%</span>
                  <span class="text-[9px] text-slate-400 block">ب+ (B+)</span>
                </div>
              </div>
              <div class="p-2 rounded-xl bg-white/[0.03] flex items-center justify-between">
                <div>
                  <p class="font-bold text-white text-[11px]">PHYS102 General Physics II</p>
                  <p class="text-[9px] text-slate-400 font-mono">Dr. Omar Hassan • 3 Cr</p>
                </div>
                <div class="text-end">
                  <span class="text-amber-400 font-bold font-mono">82%</span>
                  <span class="text-[9px] text-slate-400 block">ب (B)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- SCREEN 3: AUTHENTIC ZUJ ELEARNING (MOODLE)     -->
        <!-- ============================================== -->
        <section id="screen-zuj-elearning" class="screen-view hidden space-y-3.5">
          <!-- Elearning Header (Moodle Brand) -->
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white text-xs font-bold shadow">
                E
              </div>
              <div>
                <h4 class="text-xs font-bold text-white" data-i18n="elearn.title">ZUJ Elearning (Moodle)</h4>
                <p class="text-[9px] text-slate-400" data-i18n="elearn.subtitle">منظومة التعلم الإلكتروني - جامعة الزيتونة</p>
              </div>
            </div>
            <span class="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20" data-i18n="elearn.connected">
              Connected
            </span>
          </div>

          <!-- Quick Action to Full Assignments Screen -->
          <div onclick="switchScreen('assignments')" class="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-slate-900 border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              </div>
              <div>
                <h5 class="text-xs font-bold text-white">Interactive Assignments Hub</h5>
                <p class="text-[10px] text-slate-300">Submit homeworks, diagrams & check grades</p>
              </div>
            </div>
            <span class="text-xs font-bold text-emerald-400 font-mono">4 Tasks ➔</span>
          </div>

          <!-- Moodle Registered Courses (Hanan's 4 Courses) -->
          <div class="space-y-2.5">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hanan Registered Courses (4)</p>

            <!-- Course 1: CS201 -->
            <div onclick="openCourseModal('CS201', 'Data Structures', 'وجاهي كامل (In-Person)', 'Hall 41', 'Tue 11:30 - 12:20', 'Dr. Ahmad Khalil')" class="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-2 cursor-pointer hover:border-emerald-500/40 transition-colors">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  20261-CS201-Sec1-IT
                </span>
                <span class="text-[9px] text-emerald-300 font-bold">Dr. Ahmad Khalil</span>
              </div>
              <h5 class="text-xs font-bold text-white">CS201 Data Structures (تراكيب البيانات)</h5>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full w-full"></div>
              </div>
            </div>

            <!-- Course 2: CS202 -->
            <div onclick="openCourseModal('CS202', 'Object Oriented Programming', 'وجاهي كامل (In-Person)', 'Hall 42', 'Wed 08:30 - 09:45', 'Dr. Ahmad Khalil')" class="p-3 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2 cursor-pointer hover:border-white/20 transition-colors">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  20261-CS202-Sec2-IT
                </span>
                <span class="text-[9px] text-blue-300 font-bold">Dr. Ahmad Khalil</span>
              </div>
              <h5 class="text-xs font-bold text-white">CS202 Object Oriented Programming (البرمجة كائنية التوجه)</h5>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full w-3/4"></div>
              </div>
            </div>

            <!-- Course 3: ENG102 -->
            <div onclick="openCourseModal('ENG102', 'Technical Writing', 'مدمج (Blended)', 'Hall 39', 'Sun 11:30 - 12:20', 'Dr. Sara Mahmoud')" class="p-3 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2 cursor-pointer hover:border-white/20 transition-colors">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  20261-ENG102-Sec1-Arts
                </span>
                <span class="text-[9px] text-amber-300 font-bold">Dr. Sara Mahmoud</span>
              </div>
              <h5 class="text-xs font-bold text-white">ENG102 Technical Writing (الكتابة الفنية)</h5>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="h-full bg-amber-500 rounded-full w-4/5"></div>
              </div>
            </div>

            <!-- Course 4: PHYS102 -->
            <div onclick="openCourseModal('PHYS102', 'General Physics II', 'وجاهي كامل (In-Person)', 'Hall 40', 'Wed 13:00 - 14:15', 'Dr. Omar Hassan')" class="p-3 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-2 cursor-pointer hover:border-rose-500/40 transition-colors">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                  20261-PHYS102-Sec1-Sci
                </span>
                <span class="text-[9px] text-rose-300 font-bold">Dr. Omar Hassan</span>
              </div>
              <h5 class="text-xs font-bold text-white">PHYS102 General Physics II (الفيزياء العامة 2)</h5>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="h-full bg-rose-500 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- SCREEN 4: ZUJ 4-DAY TIMETABLE (HANAN'S REAL)   -->
        <!-- ============================================== -->
        <section id="screen-zuj-schedule" class="screen-view hidden space-y-3.5">
          <!-- Timetable Header with Semester Filter -->
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h4 class="text-xs font-bold text-white" data-i18n="sched.title">Student Timetable (الجدول الدراسي)</h4>
              <p class="text-[10px] text-emerald-400 font-semibold">Hanan (240002) • 4-Day Academic Week</p>
            </div>
            <div class="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              2026/2027-1
            </div>
          </div>

          <!-- Modality Legend Strip -->
          <div class="grid grid-cols-3 gap-1.5 text-[9px] text-center font-medium">
            <span class="py-1 px-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              🌿 مدمج (1W + 1E)
            </span>
            <span class="py-1 px-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              🏛️ وجاهي (2W)
            </span>
            <span class="py-1 px-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold">
              💻 تيمز (2T)
            </span>
          </div>

          <!-- Sunday -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Sunday (الأحد)</span>
              </span>
              <span class="text-[9px] text-slate-400">1 Course</span>
            </div>

            <!-- ENG102 -->
            <div onclick="openCourseModal('ENG102', 'Technical Writing', 'مدمج (Blended)', 'Hall 39', '11:30 - 12:20 (Sun)', 'Dr. Sara Mahmoud')" class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-amber-500 border-y border-e border-white/5 space-y-1.5 cursor-pointer hover:bg-slate-800/80 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    ENG102
                  </span>
                  <span class="text-[9px] bg-slate-800 text-slate-300 px-1.5 rounded">Sec 1</span>
                </div>
                <span class="text-[9px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                  🌿 مدمج
                </span>
              </div>
              <h5 class="text-xs font-bold text-white">ENG102 Technical Writing (الكتابة الفنية)</h5>
              <div class="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                <span class="font-mono text-amber-400">[ 11:30_12:20 ] Sunday</span>
                <span>Hall 39 • Dr. Sara Mahmoud</span>
              </div>
            </div>
          </div>

          <!-- Tuesday -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Tuesday (الثلاثاء)</span>
              </span>
              <span class="text-[9px] text-slate-400">1 Course</span>
            </div>

            <!-- CS201 -->
            <div onclick="openCourseModal('CS201', 'Data Structures', 'وجاهي كامل (In-Person)', 'Hall 41', '11:30 - 12:20 (Tue)', 'Dr. Ahmad Khalil')" class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-emerald-500 border-y border-e border-white/5 space-y-1.5 cursor-pointer hover:bg-slate-800/80 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    CS201
                  </span>
                  <span class="text-[9px] bg-slate-800 text-slate-300 px-1.5 rounded">Sec 1</span>
                </div>
                <span class="text-[9px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  🏛️ وجاهي كامل
                </span>
              </div>
              <h5 class="text-xs font-bold text-white">CS201 Data Structures (تراكيب البيانات)</h5>
              <div class="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                <span class="font-mono text-emerald-400">[ 11:30_12:20 ] Tuesday</span>
                <span>Hall 41 • Dr. Ahmad Khalil</span>
              </div>
            </div>
          </div>

          <!-- Wednesday -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span>Wednesday (الأربعاء)</span>
              </span>
              <span class="text-[9px] text-slate-400">2 Courses</span>
            </div>

            <!-- CS202 -->
            <div onclick="openCourseModal('CS202', 'Object Oriented Programming', 'وجاهي كامل', 'Hall 42', '08:30 - 09:45 (Wed)', 'Dr. Ahmad Khalil')" class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-blue-500 border-y border-e border-white/5 space-y-1.5 cursor-pointer hover:bg-slate-800/80 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                    CS202
                  </span>
                  <span class="text-[9px] bg-slate-800 text-slate-300 px-1.5 rounded">Sec 2</span>
                </div>
                <span class="text-[9px] font-bold text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/20">
                  🏛️ وجاهي كامل
                </span>
              </div>
              <h5 class="text-xs font-bold text-white">CS202 Object Oriented Programming (البرمجة كائنية التوجه)</h5>
              <div class="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                <span class="font-mono text-blue-400">[ 08:30_09:45 ] Wednesday</span>
                <span>Hall 42 • Dr. Ahmad Khalil</span>
              </div>
            </div>

            <!-- PHYS102 -->
            <div onclick="openCourseModal('PHYS102', 'General Physics II', 'وجاهي كامل', 'Hall 40', '13:00 - 14:15 (Wed)', 'Dr. Omar Hassan')" class="p-3 rounded-xl bg-slate-900/80 border-s-4 border-s-rose-500 border-y border-e border-white/5 space-y-1.5 cursor-pointer hover:bg-slate-800/80 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30">
                    PHYS102
                  </span>
                  <span class="text-[9px] bg-slate-800 text-slate-300 px-1.5 rounded">Sec 1</span>
                </div>
                <span class="text-[9px] font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/20">
                  🏛️ وجاهي كامل
                </span>
              </div>
              <h5 class="text-xs font-bold text-white">PHYS102 General Physics II (الفيزياء العامة 2)</h5>
              <div class="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                <span class="font-mono text-rose-400">[ 13:00_14:15 ] Wednesday</span>
                <span>Hall 40 • Dr. Omar Hassan</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- SCREEN 5: 7-TIER CURRICULUMS (133 CR)          -->
        <!-- ============================================== -->
        <section id="screen-curriculums" class="screen-view hidden space-y-3.5">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h4 class="text-xs font-bold text-white" data-i18n="curric.title">Study Plan (الخطة الدراسية)</h4>
              <p class="text-[10px] text-slate-400">Software Engineering (133 Cr Total)</p>
            </div>
            <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
              48 / 133 Cr
            </span>
          </div>

          <!-- Degree Progress Ribbon -->
          <div class="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/20">
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-slate-300 font-medium" data-i18n="curric.overallPlan">Overall Plan Completion</span>
              <span class="text-emerald-400 font-bold font-mono">36.1%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full w-[36.1%]"></div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-white font-semibold">1. University Mandatory (إجباري جامعة)</span>
                <span class="font-mono text-emerald-400 font-bold text-[11px]">12 / 12 Cr</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div class="bg-emerald-400 h-full rounded-full w-full"></div>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-white font-semibold">2. Major Mandatory (إجباري تخصص)</span>
                <span class="font-mono text-amber-400 font-bold text-[11px]">27 / 67 Cr</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div class="bg-amber-400 h-full rounded-full w-[40%]"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- SCREEN 6: OLIVER AI COPILOT CHAT               -->
        <!-- ============================================== -->
        <section id="screen-chat" class="screen-view hidden flex flex-col h-full space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div class="flex items-center gap-2">
              <div class="relative w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs">
                <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
              </div>
              <div>
                <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
                  Oliver AI Copilot
                  <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Qwen 2.5 / Local</span>
                </h4>
                <p class="text-[10px] text-slate-400">Advisor & Course Assistant</p>
              </div>
            </div>
            <span class="text-[9px] font-mono text-emerald-400 bg-white/5 px-2 py-0.5 rounded">ZUJ 2026</span>
          </div>

          <!-- Chat Messages Container -->
          <div id="chat-messages-container" class="space-y-3 py-1 text-xs max-h-[460px] overflow-y-auto mobile-scroll">
            <div class="flex justify-end">
              <div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-600 text-white px-3.5 py-2.5 shadow-md">
                Can I submit my Physics assignment even though it says Overdue?
              </div>
            </div>

            <div class="flex justify-start">
              <div class="max-w-[88%] rounded-2xl rounded-tl-xs bg-slate-900/90 border border-emerald-500/25 px-3.5 py-2.5 text-slate-100 shadow-md space-y-2">
                <p class="leading-relaxed">
                  Yes, Hanan! Oliver allows you to submit overdue assignments directly to <strong>Dr. Omar Hassan</strong>.
                </p>
                <div class="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] space-y-1 text-amber-200">
                  <p class="font-bold">⚠️ Late Submission Notice:</p>
                  <p>When you submit past the deadline, it will be clearly flagged as a <strong>"Late Submission"</strong> on your portal and especially for Dr. Omar Hassan so he can grade your solution according to course policy.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Suggestion Chips -->
          <div class="flex flex-wrap gap-1.5 pt-1">
            <button onclick="handlePromptChip('How does the AVL rotation assignment work in CS201?')" class="min-h-[30px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/10 transition-colors active:scale-95">
              🌳 AVL Tree Assignment (CS201)
            </button>
            <button onclick="handlePromptChip('What is the late submission penalty policy at ZUJ?')" class="min-h-[30px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/10 transition-colors active:scale-95">
              ⏰ Late Submission Rules
            </button>
            <button onclick="handlePromptChip('Show my weekly timetable with Dr. Ahmad Khalil')" class="min-h-[30px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/10 transition-colors active:scale-95">
              📅 Dr. Ahmad Lectures
            </button>
          </div>

          <!-- Input Form -->
          <div class="mt-auto pt-2">
            <form onsubmit="handleChatSubmit(event)" class="relative flex items-center">
              <input id="chat-input" type="text" placeholder="Ask Oliver about your assignments or schedule..." class="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl py-2.5 ps-3.5 pe-11 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner">
              <button type="submit" class="min-h-[36px] min-w-[36px] absolute end-1.5 w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs hover:bg-emerald-400 active:scale-95 transition-all">
                <svg class="w-4 h-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- SCREEN 7: CAMPUS WAYFINDING & NAVIGATION       -->
        <!-- ============================================== -->
        <section id="screen-map" class="screen-view hidden space-y-3.5">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h4 class="text-xs font-bold text-white" data-i18n="campus.title">Campus Wayfinding</h4>
              <p class="text-[10px] text-slate-400">Al-Zaytoonah University of Jordan</p>
            </div>
            <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Hall 41</span>
          </div>

          <!-- Active Guidance Card -->
          <div class="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900/90 border border-emerald-500/30">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Live Route to CS201</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">3 min walk</span>
            </div>
            <h5 class="text-xs font-bold text-white">Main Entrance ➔ IT Faculty (Hall 41)</h5>
            <p class="text-[11px] text-slate-300 mt-0.5">Faculty of Science & IT • 1st Floor • Dr. Ahmad Khalil</p>
          </div>

          <!-- Stylized Mini Mobile Map Render -->
          <div class="relative h-48 rounded-2xl bg-[#030905] border border-white/10 overflow-hidden flex items-center justify-center">
            <div class="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.06)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 320 180" fill="none">
              <path d="M40 140 C90 100 120 120 180 70 S240 80 280 40" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 6"/>
              <circle cx="40" cy="140" r="7" fill="#10b981" />
              <circle cx="180" cy="70" r="5" fill="#34d399" />
              <circle cx="280" cy="40" r="8" fill="#f59e0b" />
            </svg>

            <div class="absolute top-2 start-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-[9px] text-slate-200">
              📍 Gate 1 (Main Entrance)
            </div>
            <div class="absolute bottom-2 end-2 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/30 text-[9px] text-emerald-300 font-semibold">
              🎯 IT Faculty • Hall 41
            </div>
          </div>
        </section>

      </div>

      <!-- Persistent Mobile Bottom Tab Bar -->
      <nav class="absolute bottom-0 inset-x-0 h-16 bg-slate-950/95 border-t border-emerald-500/15 backdrop-blur-xl px-2 flex items-center justify-around text-[10px] text-slate-400 z-40 select-none">
        <button onclick="switchScreen('assignments')" id="nav-btn-assignments" class="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 text-emerald-400 transition-transform active:scale-90">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span class="font-bold text-[9px]" data-i18n="bottomNav.asgn">Tasks</span>
        </button>

        <button onclick="switchScreen('zuj-schedule')" id="nav-btn-zuj-schedule" class="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-transform active:scale-90">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span class="font-medium text-[9px]" data-i18n="bottomNav.schedule">Schedule</span>
        </button>

        <!-- Center Prominent Oliver AI Button -->
        <button onclick="switchScreen('chat')" id="nav-btn-chat" class="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center -mt-5 transition-transform active:scale-90">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-600 to-emerald-400 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/40 border-2 border-slate-950">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
          </div>
          <span class="text-[9px] font-bold text-emerald-400 mt-0.5">Oliver</span>
        </button>

        <button onclick="switchScreen('oliver-hub')" id="nav-btn-oliver-hub" class="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-transform active:scale-90">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="font-medium text-[9px]" data-i18n="bottomNav.hub">Hub</span>
        </button>

        <button onclick="switchScreen('zuj-elearning')" id="nav-btn-zuj-elearning" class="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-transform active:scale-90">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span class="font-medium text-[9px]" data-i18n="bottomNav.elearn">Moodle</span>
        </button>
      </nav>

      <!-- ============================================================== -->
      <!-- MODAL 1: MULTI-MODAL ASSIGNMENT SUBMISSION (INTERACTIVE DRAWER)-->
      <!-- ============================================================== -->
      <div id="submit-modal" class="hidden absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end p-2 transition-all">
        <div class="bg-slate-900 border border-emerald-500/40 rounded-3xl p-4 space-y-3.5 shadow-2xl max-h-[85%] overflow-y-auto mobile-scroll">
          
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <span id="sub-modal-course-badge" class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">CS201</span>
              <h4 id="sub-modal-title" class="text-xs font-bold text-white mt-1">AVL Tree Rotation Complexity</h4>
            </div>
            <button onclick="closeSubmitModal()" class="min-h-[36px] min-w-[36px] w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold hover:bg-slate-700">✕</button>
          </div>

          <!-- Late Submission Warning Banner (Dynamic) -->
          <div id="sub-modal-late-warning" class="hidden p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
            <svg class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <p class="font-bold text-rose-300" data-i18n="asgn.lateSubmitTitle">Notice: Submitting After Deadline (Late Submission)</p>
              <p class="text-slate-300 text-[11px] mt-0.5 leading-snug" data-i18n="asgn.lateSubmitNotice">
                The deadline has passed. You are allowed to submit your solution, but it will be permanently flagged as <strong>"Late Submission"</strong> for your doctor to evaluate.
              </p>
            </div>
          </div>

          <!-- Doctor & Deadline Metadata -->
          <div class="p-2.5 rounded-xl bg-slate-800/60 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-400 text-[10px] block">Course Doctor:</span>
              <span id="sub-modal-doctor" class="font-bold text-white">Dr. Ahmad Khalil</span>
            </div>
            <div class="text-end">
              <span class="text-slate-400 text-[10px] block">Deadline:</span>
              <span id="sub-modal-deadline" class="font-mono text-amber-300 font-bold">Nov 11, 23:59</span>
            </div>
          </div>

          <!-- Assignment Description Box -->
          <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-200">
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Assignment Prompt</p>
            <p id="sub-modal-desc" class="leading-relaxed text-[11px]">Determine the worst-case time complexity of rebalancing an AVL tree after a single insertion.</p>
          </div>

          <!-- Multi-Modal Input Method Tabs (Code/Text, Image Diagram, Multiple Choice) -->
          <div class="space-y-2">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Submission Answer Method</span>
            <div class="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs font-semibold">
              <button onclick="setSubMethod('text')" id="sub-tab-text" class="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-center">Type Solution</button>
              <button onclick="setSubMethod('image')" id="sub-tab-image" class="flex-1 py-1.5 rounded-lg text-slate-400 hover:text-white text-center">Attach Diagram</button>
              <button onclick="setSubMethod('choice')" id="sub-tab-choice" class="flex-1 py-1.5 rounded-lg text-slate-400 hover:text-white text-center">Pick Option</button>
            </div>
          </div>

          <!-- 1. Text Solution View -->
          <div id="sub-view-text" class="space-y-1.5">
            <label class="text-[10px] text-slate-400">Type or paste your solution / code:</label>
            <textarea id="sub-input-text" rows="3" placeholder="// Type your mathematical derivation or Java / C++ code here..." class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"></textarea>
          </div>

          <!-- 2. Image Diagram View -->
          <div id="sub-view-image" class="hidden space-y-2">
            <label class="text-[10px] text-slate-400">Upload or select solution diagram / circuit / math image:</label>
            <div class="flex gap-2">
              <button onclick="selectSampleImage('uml')" type="button" class="flex-1 p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-emerald-500 text-[10px] text-slate-300 text-center active:scale-95">
                📊 UML Diagram
              </button>
              <button onclick="selectSampleImage('avl')" type="button" class="flex-1 p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-emerald-500 text-[10px] text-slate-300 text-center active:scale-95">
                🌳 AVL Balance Tree
              </button>
              <button onclick="selectSampleImage('physics')" type="button" class="flex-1 p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-emerald-500 text-[10px] text-slate-300 text-center active:scale-95">
                ⚡ Gauss Flux Chart
              </button>
            </div>
            <!-- Image Live Preview -->
            <div id="sub-img-preview-box" class="h-28 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center overflow-hidden relative">
              <img id="sub-img-preview" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60" alt="Solution Diagram" class="w-full h-full object-cover">
              <span class="absolute bottom-1 right-2 text-[8px] bg-black/70 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Image Attached</span>
            </div>
          </div>

          <!-- 3. Multiple Choice View -->
          <div id="sub-view-choice" class="hidden space-y-2">
            <label class="text-[10px] text-slate-400">Choose the correct answer based on advisor options:</label>
            <div id="sub-choice-list" class="space-y-1.5 text-xs">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Submit Action Button -->
          <div class="pt-2">
            <button onclick="submitAssignmentFromModal()" id="sub-modal-submit-btn" class="min-h-[44px] w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold active:scale-95 shadow-lg flex items-center justify-center gap-2">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              <span id="sub-modal-btn-label">Submit Solution to Doctor</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL 2: DOCTOR REVIEW & GRADING MODAL (INTERACTIVE DRAWER)   -->
      <!-- ============================================================== -->
      <div id="grade-modal" class="hidden absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end p-2 transition-all">
        <div class="bg-slate-900 border border-blue-500/40 rounded-3xl p-4 space-y-3.5 shadow-2xl max-h-[85%] overflow-y-auto mobile-scroll">
          
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <span class="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-bold">Doctor Review Portal</span>
              <h4 id="grade-modal-title" class="text-xs font-bold text-white mt-1">Reviewing Hanan's Submission</h4>
            </div>
            <button onclick="closeGradeModal()" class="min-h-[36px] min-w-[36px] w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold hover:bg-slate-700">✕</button>
          </div>

          <!-- Late Submission Doctor Warning Banner (If submitted late) -->
          <div id="grade-modal-late-alert" class="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 space-y-1">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <p class="font-bold text-rose-300">⚠️ Attention Doctor: Late Student Submission</p>
            </div>
            <p id="grade-modal-late-desc" class="text-slate-300 text-[11px] leading-snug">
              Student submitted this assignment after the official deadline. Please factor any late submission deduction policy into the final grade.
            </p>
          </div>

          <!-- Student Solution Inspection Box -->
          <div class="p-3 rounded-xl bg-slate-800/60 border border-white/5 space-y-2 text-xs">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Submitted Solution</span>
            <div id="grade-modal-solution-text" class="p-2 rounded-lg bg-black/40 font-mono text-emerald-300 text-[11px] whitespace-pre-wrap max-h-24 overflow-y-auto">
              // Student Code
            </div>
            <div id="grade-modal-solution-image" class="h-24 rounded-lg overflow-hidden border border-white/10 hidden">
              <img id="grade-modal-image-preview" src="" alt="Diagram" class="w-full h-full object-cover">
            </div>
          </div>

          <!-- Score & Feedback Inputs -->
          <div class="space-y-2.5">
            <div>
              <label class="text-[10px] text-slate-400 font-bold block mb-1">Enter Grade (out of 100):</label>
              <input id="grade-modal-score" type="number" min="0" max="100" value="95" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="text-[10px] text-slate-400 font-bold block mb-1">Academic Feedback / Review Notes:</label>
              <textarea id="grade-modal-feedback" rows="2" placeholder="Write feedback for the student..." class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"></textarea>
            </div>
          </div>

          <!-- Save Grade Button -->
          <button onclick="saveGradeFromModal()" class="min-h-[44px] w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold active:scale-95 shadow-lg flex items-center justify-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Record Official Grade</span>
          </button>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL 3: COURSE DETAILS MODAL                                  -->
      <!-- ============================================================== -->
      <div id="course-modal" class="hidden absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-2 transition-all">
        <div class="bg-slate-900 border border-emerald-500/30 rounded-3xl p-4 space-y-3 shadow-2xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <span id="modal-code" class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">CS201</span>
              <h4 id="modal-title" class="text-xs font-bold text-white mt-1">Data Structures</h4>
            </div>
            <button onclick="closeCourseModal()" class="min-h-[36px] min-w-[36px] w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold hover:bg-slate-700">✕</button>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-slate-300">
              <span class="text-slate-400">Delivery Modality:</span>
              <span id="modal-modality" class="font-bold text-emerald-400">وجاهي كامل</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span class="text-slate-400">Classroom / Hall:</span>
              <span id="modal-room" class="font-bold text-white">Hall 41</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span class="text-slate-400">Lecture Time:</span>
              <span id="modal-time" class="font-mono text-amber-300">11:30 - 12:20 (Tue)</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span class="text-slate-400">Instructor:</span>
              <span id="modal-instructor" class="text-white">Dr. Ahmad Khalil</span>
            </div>
            <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
              ⚠️ ZUJ Article 14: Maximum absence is 15% (4 lectures). Beyond 4 absences without dean's excuse, academic deprivation is enforced.
            </div>
          </div>
          <button onclick="closeCourseModal()" class="min-h-[44px] w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold active:scale-95">Done</button>
        </div>
      </div>

      <!-- iOS Home Indicator Swipe Bar -->
      <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-50 pointer-events-none"></div>

    </div>
  </main>

  <!-- Interactive Simulator Engine (Data Store & Logic) -->
  <script>
    let currentLang = 'en';
    let currentDevice = 'iphone';
    let currentStudent = 'hanan';
    let currentRole = 'student'; // 'student' or 'doctor'
    let currentAsgnFilter = 'all';
    let activeSubmittingId = null;
    let activeGradingId = null;
    let currentSubMethod = 'text';

    // Authentic Hanan Database Assignments Dataset
    const ASSIGNMENTS_DB = [
      {
        id: 31001,
        title: "AVL Tree Rotation & Height Balancing",
        titleAr: "توازن شجرة AVL وحساب تعقيد الدوران",
        courseCode: "CS201",
        courseName: "Data Structures",
        courseNameAr: "تراكيب البيانات",
        doctorName: "Dr. Ahmad Khalil",
        doctorNameAr: "د. أحمد خليل",
        dueDate: "Nov 11, 2026, 23:59",
        daysRemaining: "6 days remaining",
        status: "pending", // pending
        submissionType: "all",
        totalPoints: 100,
        description: "Determine the worst-case time complexity of rebalancing an AVL tree after a single insertion and identify the balance factors.",
        descriptionAr: "حدد التعقيد الزمني لأسوأ حالة لإعادة توازن شجرة AVL بعد عملية إدراج واحدة وحدد معاملات التوازن المسموحة.",
        options: [
          "O(1) - Constant single/double rotation",
          "O(log n) - Tree traversal height",
          "O(n) - Linear rebalance",
          "O(n log n) - Recursive scan"
        ],
        selectedOption: null,
        solutionText: null,
        solutionImageUrl: null,
        score: null,
        feedback: null,
        isLateSubmission: false
      },
      {
        id: 31002,
        title: "Vehicle Hierarchy & Polymorphism Implementation",
        titleAr: "تطبيق الوراثة وتعدد الأشكال لكلاسات المركبات",
        courseCode: "CS202",
        courseName: "Object Oriented Programming",
        courseNameAr: "البرمجة كائنية التوجه",
        doctorName: "Dr. Ahmad Khalil",
        doctorNameAr: "د. أحمد خليل",
        dueDate: "Nov 8, 2026, 23:59",
        daysRemaining: "Submitted on time",
        status: "submitted", // submitted
        submissionType: "all",
        totalPoints: 100,
        description: "Implement an abstract Vehicle class with ElectricCar subclass. Provide Java source code and attach class diagram.",
        descriptionAr: "قم بإنشاء كلاس مجرد Vehicle وكلاس فرعي ElectricCar بلغة جافا مع إرفاق مخطط كلاسات UML.",
        options: null,
        selectedOption: null,
        solutionText: "public abstract class Vehicle {\\n    protected String vin;\\n    public abstract double calculateRange();\\n}\\npublic class ElectricCar extends Vehicle {\\n    private double batteryKwh = 75.0;\\n    @Override\\n    public double calculateRange() { return batteryKwh * 6.2; }\\n}",
        solutionImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
        score: null,
        feedback: null,
        isLateSubmission: false
      },
      {
        id: 31003,
        title: "Doubly Linked List Node Deletion Lab",
        titleAr: "حذف عقدة من القائمة المتصلة المزدوجة",
        courseCode: "CS201",
        courseName: "Data Structures",
        courseNameAr: "تراكيب البيانات",
        doctorName: "Dr. Ahmad Khalil",
        doctorNameAr: "د. أحمد خليل",
        dueDate: "Nov 1, 2026, 23:59",
        daysRemaining: "Graded by Doctor",
        status: "graded", // graded
        submissionType: "all",
        totalPoints: 100,
        description: "Implement constant time O(1) node deletion given direct node pointer.",
        descriptionAr: "تنفيذ دالة حذف عقدة بزمن ثابت O(1) عند توفر مؤشر مباشر على العقدة.",
        options: null,
        selectedOption: null,
        solutionText: "void deleteNode(Node* del) {\\n    if (!del) return;\\n    if (del->prev) del->prev->next = del->next;\\n    if (del->next) del->next->prev = del->prev;\\n    delete del;\\n}",
        solutionImageUrl: null,
        score: 96,
        feedback: "ممتاز يا حنان! معالجة دقيقة لحالات الأطراف (Head and Tail) وإدارة ممتازة للذاكرة. أحسنتِ.",
        isLateSubmission: false
      },
      {
        id: 31004,
        title: "Gauss's Law Spherical Shell Flux Calculation",
        titleAr: "حساب التدفق الكهربائي لسطح غاوس وقشرة كروية",
        courseCode: "PHYS102",
        courseName: "General Physics II",
        courseNameAr: "الفيزياء العامة 2",
        doctorName: "Dr. Omar Hassan",
        doctorNameAr: "د. عمر حسان",
        dueDate: "Oct 21, 2026, 23:59",
        daysRemaining: "Overdue by 15 days",
        status: "overdue", // overdue
        submissionType: "all",
        totalPoints: 100,
        description: "Calculate total electric flux through Gaussian spherical surface enclosing charged conducting shell.",
        descriptionAr: "احسب التدفق الكهربائي الكلي عبر سطح غاوسي كروي يحيط بقشرة موصلة مشحونة.",
        options: [
          "Φ = Q_enclosed / ε0",
          "Φ = 0 (Inside conductor)",
          "Φ = E · 4πr²",
          "All of the above based on region"
        ],
        selectedOption: null,
        solutionText: null,
        solutionImageUrl: null,
        score: null,
        feedback: null,
        isLateSubmission: false
      }
    ];

    const DICTIONARY = {
      en: {
        "nav.assignments": "Assignments (Hanan)",
        "nav.hub": "Oliver Hub",
        "nav.portal": "ZUJ Portal",
        "nav.elearn": "ZUJ Elearning",
        "nav.schedule": "Hanan Schedule",
        "nav.curriculum": "Curriculums",
        "nav.ai": "Oliver AI",
        "nav.campus": "Campus Nav",
        "asgn.title": "Course Assignments",
        "asgn.subtitle": "Assignments from course doctors & advisors",
        "asgn.scheduleBtn": "Schedule",
        "asgn.tabAll": "All",
        "asgn.tabPending": "Pending",
        "asgn.tabSubmitted": "Submitted",
        "asgn.tabGraded": "Graded",
        "asgn.tabOverdue": "Overdue",
        "asgn.lateSubmitTitle": "Notice: Submitting After Deadline (Late Submission)",
        "asgn.lateSubmitNotice": "The deadline has passed. You are allowed to submit your solution, but it will be permanently flagged as 'Late Submission' for your doctor to evaluate.",
        "student.idLabel": "ID:",
        "hub.finBalance": "Financial Balance",
        "hub.cummGpa": "Cumulative GPA",
        "bottomNav.asgn": "Tasks",
        "bottomNav.schedule": "Schedule",
        "bottomNav.hub": "Hub",
        "bottomNav.elearn": "Moodle",
        "portal.title": "ZUJ Student Portal App",
        "portal.subtitle": "بوابة الطالب - جامعة الزيتونة الأردنية",
        "portal.cummGpa": "Cumulative GPA",
        "portal.homeworks": "Active Homeworks",
        "portal.planProgress": "Plan Progress",
        "portal.transcriptTitle": "Course Results (كشف العلامات)",
        "elearn.title": "ZUJ Elearning (Moodle)",
        "elearn.subtitle": "منظومة التعلم الإلكتروني - جامعة الزيتونة",
        "elearn.connected": "Connected",
        "sched.title": "Student Timetable (الجدول الدراسي)",
        "curric.title": "Study Plan (الخطة الدراسية)",
        "curric.overallPlan": "Overall Plan Completion",
        "campus.title": "Campus Wayfinding"
      },
      ar: {
        "nav.assignments": "واجبات حنان (الجديدة)",
        "nav.hub": "أوليفر الرئيسية",
        "nav.portal": "بوابة الطالب",
        "nav.elearn": "التعلم الإلكتروني",
        "nav.schedule": "جدول حنان الأسبوعي",
        "nav.curriculum": "الخطة الدراسية",
        "nav.ai": "أوليفر الذكي",
        "nav.campus": "خريطة الحرم",
        "asgn.title": "واجبات المساقات الدراسية",
        "asgn.subtitle": "الواجبات الصادرة من دكاترة المساقات والمرشد الأكاديمي",
        "asgn.scheduleBtn": "الجدول",
        "asgn.tabAll": "الكل",
        "asgn.tabPending": "قيد الانتظار",
        "asgn.tabSubmitted": "تم التسليم",
        "asgn.tabGraded": "تم التصحيح",
        "asgn.tabOverdue": "متأخر",
        "asgn.lateSubmitTitle": "تنبيه: تسليم متأخر بعد انقضاء الموعد النهائي",
        "asgn.lateSubmitNotice": "انتهى الموعد الرسمي للتسليم. يُسمح لكِ بتسليم الحل، وسيتم توثيقه وإبرازه كـ (تسليم متأخر) لدى دكتور المادة عند التصحيح.",
        "student.idLabel": "الرقم الجامعي:",
        "hub.finBalance": "الرصيد المالي",
        "hub.cummGpa": "المعدل التراكمي",
        "bottomNav.asgn": "الواجبات",
        "bottomNav.schedule": "الجدول",
        "bottomNav.hub": "الرئيسية",
        "bottomNav.elearn": "مودل",
        "portal.title": "تطبيق بوابة الطالب - الزيتونة",
        "portal.subtitle": "بوابة الطالب - جامعة الزيتونة الأردنية",
        "portal.cummGpa": "المعدل التراكمي",
        "portal.homeworks": "الواجبات النشطة",
        "portal.planProgress": "إنجاز الخطة",
        "portal.transcriptTitle": "كشف علامات الفصل الحالي",
        "elearn.title": "منظومة التعلم الإلكتروني (مودل)",
        "elearn.subtitle": "التعليم الإلكتروني - جامعة الزيتونة الأردنية",
        "elearn.connected": "متصل",
        "sched.title": "الجدول الدراسي الأسبوعي (4 أيام)",
        "curric.title": "الخطة الدراسية الاسترشادية",
        "curric.overallPlan": "نسبة إنجاز الخطة",
        "campus.title": "الملاحة الحرمية والإرشاد المكاني"
      }
    };

    // Render Assignments List based on Filter
    function renderAssignments() {
      const container = document.getElementById('assignments-cards-container');
      if (!container) return;

      const filtered = ASSIGNMENTS_DB.filter(a => {
        if (currentAsgnFilter === 'all') return true;
        return a.status === currentAsgnFilter;
      });

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="p-6 text-center text-slate-400 space-y-1">
            <p class="text-xs font-semibold">\${currentLang === 'ar' ? 'لا توجد واجبات في هذا القسم' : 'No assignments in this category'}</p>
          </div>\`;
        return;
      }

      container.innerHTML = filtered.map(a => {
        const isAr = currentLang === 'ar';
        const title = isAr ? a.titleAr : a.title;
        const courseName = isAr ? a.courseNameAr : a.courseName;
        const doctorName = isAr ? a.doctorNameAr : a.doctorName;
        const desc = isAr ? a.descriptionAr : a.description;

        // Status Badge Style
        let statusBadge = '';
        if (a.status === 'pending') {
          statusBadge = \`<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
            \${isAr ? 'قيد الانتظار' : 'Pending'}
          </span>\`;
        } else if (a.status === 'submitted') {
          statusBadge = \`<span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
            \${isAr ? 'تم التسليم' : 'Submitted'}
          </span>\`;
        } else if (a.status === 'graded') {
          statusBadge = \`<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
            \${isAr ? 'تم التصحيح' : 'Graded'} • \${a.score}/100
          </span>\`;
        } else if (a.status === 'overdue') {
          statusBadge = \`<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
            \${isAr ? 'متأخر (متاح التسليم)' : 'Overdue (Late Allowed)'}
          </span>\`;
        }

        // Late Submission Indicator Badge
        let lateBadge = '';
        if (a.isLateSubmission) {
          lateBadge = \`
            <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 text-[9px] font-bold animate-pulse">
              <span>⚠️</span>
              <span>\${isAr ? 'تسليم متأخر للدكتور' : 'Late Submission'}</span>
            </div>\`;
        }

        // Primary Action Button (Student or Doctor)
        let actionBtn = '';
        if (currentRole === 'doctor') {
          // Doctor View Actions
          if (a.status === 'submitted' || (a.status === 'overdue' && a.solutionText)) {
            actionBtn = \`
              <button onclick="openGradeModalFor(\${a.id})" class="min-h-[36px] w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow active:scale-95">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>\${isAr ? 'تصحيح ورصد الدرجة' : 'Review & Grade'}</span>
              </button>\`;
          } else if (a.status === 'graded') {
            actionBtn = \`
              <button onclick="openGradeModalFor(\${a.id})" class="min-h-[36px] w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-white/10 active:scale-95">
                <span>\${isAr ? 'تعديل الدرجة المسجلة (' + a.score + '/100)' : 'Edit Recorded Grade (' + a.score + '/100)'}</span>
              </button>\`;
          } else {
            actionBtn = \`
              <div class="text-center py-1 text-[10px] text-slate-500 font-mono">
                \${isAr ? 'بانتظار تسليم الطالبة' : 'Awaiting student submission'}
              </div>\`;
          }
        } else {
          // Student View Actions
          if (a.status === 'pending') {
            actionBtn = \`
              <button onclick="openSubmitModalFor(\${a.id})" class="min-h-[38px] w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow active:scale-95">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                <span>\${isAr ? 'تسليم الواجب الآن' : 'Submit Solution'}</span>
              </button>\`;
          } else if (a.status === 'overdue') {
            actionBtn = \`
              <button onclick="openSubmitModalFor(\${a.id})" class="min-h-[38px] w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow border border-rose-400/40 active:scale-95">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>\${isAr ? 'تسليم متأخر للدكتور (متاح)' : 'Submit Late Solution (Allowed)'}</span>
              </button>\`;
          } else if (a.status === 'submitted') {
            actionBtn = \`
              <button onclick="openSubmitModalFor(\${a.id})" class="min-h-[36px] w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-white/10 active:scale-95">
                <span>\${isAr ? 'تعديل الحل المسلّم' : 'Edit Submission'}</span>
              </button>\`;
          } else if (a.status === 'graded') {
            actionBtn = \`
              <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-start space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-emerald-300">\${isAr ? 'ملاحظة الدكتور:' : 'Doctor Review Note:'}</span>
                  <span class="text-[10px] font-mono font-bold text-emerald-400">\${a.score} / 100</span>
                </div>
                <p class="text-[11px] text-slate-200 italic leading-snug">"\${a.feedback || 'Excellent work!'}"</p>
              </div>\`;
          }
        }

        return \`
          <div class="p-3.5 rounded-2xl bg-slate-900/90 border \${a.status === 'overdue' ? 'border-rose-500/40' : 'border-emerald-500/25'} zuj-card-shadow space-y-2.5 transition-all">
            
            <!-- Card Header: Course & Doctor -->
            <div class="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold">\${a.courseCode}</span>
                  <span class="text-[10px] text-slate-400">\${courseName}</span>
                </div>
                <h4 class="text-xs font-bold text-white mt-0.5 leading-snug">\${title}</h4>
              </div>
              <div class="flex flex-col items-end gap-1 shrink-0">
                \${statusBadge}
                \${lateBadge}
              </div>
            </div>

            <!-- Doctor & Due Date Metadata -->
            <div class="flex items-center justify-between text-[10px] text-slate-300">
              <div class="flex items-center gap-1">
                <span class="text-slate-500">\${isAr ? 'المدرس:' : 'Doctor:'}</span>
                <span class="text-white font-semibold">\${doctorName}</span>
              </div>
              <div class="font-mono \${a.status === 'overdue' ? 'text-rose-400 font-bold' : 'text-slate-400'}">
                \${a.dueDate}
              </div>
            </div>

            <!-- Prompt Preview -->
            <p class="text-[11px] text-slate-300 leading-relaxed bg-black/20 p-2 rounded-xl border border-white/5">
              \${desc}
            </p>

            <!-- Overdue Explicit Warning Strip -->
            \${a.status === 'overdue' ? \`
              <div class="p-2 rounded-xl bg-rose-950/50 border border-rose-500/30 text-[10px] text-rose-200 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>\${isAr ? 'تنبيه: انتهى الموعد النهائي (21 أكتوبر). يمكنك التسليم وسيتم توثيقه كـ (متأخر) للدكتور.' : 'Overdue: Deadline passed. You can submit now; will be documented as Late for doctor.'}</span>
              </div>\` : ''}

            <!-- Action Button -->
            <div class="pt-0.5">
              \${actionBtn}
            </div>

          </div>\`;
      }).join('');
    }

    // Filter assignments tab click
    function filterAssignments(tab) {
      currentAsgnFilter = tab;
      document.querySelectorAll('.asgn-tab-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-600', 'text-white', 'shadow');
        btn.classList.add('text-slate-400');
      });
      const activeBtn = document.getElementById('tab-asgn-' + tab);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-400');
        activeBtn.classList.add('bg-emerald-600', 'text-white', 'shadow');
      }
      renderAssignments();
    }

    // Modal Handlers for Student Submission
    function openSubmitModalFor(asgnId) {
      activeSubmittingId = asgnId;
      const asgn = ASSIGNMENTS_DB.find(x => x.id === asgnId);
      if (!asgn) return;

      const isAr = currentLang === 'ar';
      document.getElementById('sub-modal-course-badge').textContent = asgn.courseCode;
      document.getElementById('sub-modal-title').textContent = isAr ? asgn.titleAr : asgn.title;
      document.getElementById('sub-modal-doctor').textContent = isAr ? asgn.doctorNameAr : asgn.doctorName;
      document.getElementById('sub-modal-deadline').textContent = asgn.dueDate;
      document.getElementById('sub-modal-desc').textContent = isAr ? asgn.descriptionAr : asgn.description;

      // Handle late warning banner
      const lateWarn = document.getElementById('sub-modal-late-warning');
      const submitBtn = document.getElementById('sub-modal-btn-label');
      if (asgn.status === 'overdue') {
        lateWarn.classList.remove('hidden');
        submitBtn.textContent = isAr ? 'إرسال الحل كـ (تسليم متأخر) للدكتور' : 'Submit Late Solution to Doctor';
      } else {
        lateWarn.classList.add('hidden');
        submitBtn.textContent = isAr ? 'إرسال الحل للدكتور' : 'Submit Solution to Doctor';
      }

      // Populate Choices if any
      const choiceContainer = document.getElementById('sub-choice-list');
      if (asgn.options && asgn.options.length > 0) {
        choiceContainer.innerHTML = asgn.options.map((opt, idx) => \`
          <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-white/5 cursor-pointer hover:border-emerald-500/50">
            <input type="radio" name="sub-option" value="\${opt}" class="text-emerald-500 focus:ring-0">
            <span class="text-white text-[11px]">\${opt}</span>
          </label>
        \`).join('');
      } else {
        choiceContainer.innerHTML = \`<p class="text-[10px] text-slate-500">No multiple choice options for this assignment.</p>\`;
      }

      if (asgn.solutionText) {
        document.getElementById('sub-input-text').value = asgn.solutionText;
      } else {
        document.getElementById('sub-input-text').value = '';
      }

      setSubMethod(asgn.options ? 'choice' : 'text');
      document.getElementById('submit-modal').classList.remove('hidden');
    }

    function closeSubmitModal() {
      document.getElementById('submit-modal').classList.add('hidden');
    }

    function setSubMethod(method) {
      currentSubMethod = method;
      ['text', 'image', 'choice'].forEach(m => {
        const btn = document.getElementById('sub-tab-' + m);
        const view = document.getElementById('sub-view-' + m);
        if (m === method) {
          btn.classList.add('bg-emerald-600', 'text-white');
          btn.classList.remove('text-slate-400');
          view.classList.remove('hidden');
        } else {
          btn.classList.remove('bg-emerald-600', 'text-white');
          btn.classList.add('text-slate-400');
          view.classList.add('hidden');
        }
      });
    }

    function selectSampleImage(type) {
      const preview = document.getElementById('sub-img-preview');
      if (type === 'uml') {
        preview.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
      } else if (type === 'avl') {
        preview.src = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60";
      } else {
        preview.src = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60";
      }
    }

    function submitAssignmentFromModal() {
      if (!activeSubmittingId) return;
      const asgn = ASSIGNMENTS_DB.find(x => x.id === activeSubmittingId);
      if (!asgn) return;

      const isLate = (asgn.status === 'overdue');
      asgn.status = 'submitted';
      asgn.isLateSubmission = isLate;

      if (currentSubMethod === 'text') {
        asgn.solutionText = document.getElementById('sub-input-text').value || "// Solution submitted by student";
      } else if (currentSubMethod === 'image') {
        asgn.solutionImageUrl = document.getElementById('sub-img-preview').src;
        asgn.solutionText = "// Solution submitted with diagram attachment";
      } else if (currentSubMethod === 'choice') {
        const selected = document.querySelector('input[name="sub-option"]:checked');
        asgn.selectedOption = selected ? selected.value : (asgn.options ? asgn.options[0] : null);
        asgn.solutionText = "Selected: " + asgn.selectedOption;
      }

      closeSubmitModal();
      renderAssignments();

      // Show toast
      showToast(isLate ? "⚠️ Late Submission recorded and forwarded to doctor!" : "✓ Assignment submitted successfully!");
    }

    // Modal Handlers for Doctor Review & Grading
    function openGradeModalFor(asgnId) {
      activeGradingId = asgnId;
      const asgn = ASSIGNMENTS_DB.find(x => x.id === asgnId);
      if (!asgn) return;

      const isAr = currentLang === 'ar';
      document.getElementById('grade-modal-title').textContent = (isAr ? 'تصحيح واجب: ' : 'Reviewing: ') + (isAr ? asgn.titleAr : asgn.title);

      const lateAlert = document.getElementById('grade-modal-late-alert');
      if (asgn.isLateSubmission || asgn.status === 'overdue') {
        lateAlert.classList.remove('hidden');
      } else {
        lateAlert.classList.add('hidden');
      }

      document.getElementById('grade-modal-solution-text').textContent = asgn.solutionText || (asgn.selectedOption ? "Choice: " + asgn.selectedOption : "No text solution provided.");
      
      const imgBox = document.getElementById('grade-modal-solution-image');
      if (asgn.solutionImageUrl) {
        document.getElementById('grade-modal-image-preview').src = asgn.solutionImageUrl;
        imgBox.classList.remove('hidden');
      } else {
        imgBox.classList.add('hidden');
      }

      document.getElementById('grade-modal-score').value = asgn.score || 95;
      document.getElementById('grade-modal-feedback').value = asgn.feedback || (isAr ? "عمل ممتاز ودقيق، أحسنتِ يا حنان." : "Well structured solution. Excellent effort, Hanan!");

      document.getElementById('grade-modal').classList.remove('hidden');
    }

    function closeGradeModal() {
      document.getElementById('grade-modal').classList.add('hidden');
    }

    function saveGradeFromModal() {
      if (!activeGradingId) return;
      const asgn = ASSIGNMENTS_DB.find(x => x.id === activeGradingId);
      if (!asgn) return;

      const scoreVal = parseInt(document.getElementById('grade-modal-score').value, 10);
      const feedbackVal = document.getElementById('grade-modal-feedback').value;

      asgn.score = isNaN(scoreVal) ? 95 : scoreVal;
      asgn.feedback = feedbackVal;
      asgn.status = 'graded';

      closeGradeModal();
      renderAssignments();
      showToast("✓ Official grade (" + asgn.score + "/100) recorded in student ledger!");
    }

    function showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 bg-slate-900 border border-emerald-500/50 text-white text-xs px-4 py-2 rounded-xl shadow-2xl z-50 animate-bounce';
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2800);
    }

    // Role & Student Persona Switchers
    function setRole(role) {
      currentRole = role;
      const btnStudent = document.getElementById('btn-role-student');
      const btnDoctor = document.getElementById('btn-role-doctor');
      const docBanner = document.getElementById('doctor-mode-banner');
      const islandBadge = document.getElementById('island-badge');
      const roleTag = document.getElementById('role-tag-badge');

      if (role === 'doctor') {
        btnDoctor.classList.add('bg-blue-600', 'text-white', 'font-bold');
        btnDoctor.classList.remove('text-slate-400');
        btnStudent.classList.remove('bg-emerald-600', 'text-white', 'font-bold');
        btnStudent.classList.add('text-slate-400');
        if (docBanner) docBanner.classList.remove('hidden');
        if (islandBadge) islandBadge.textContent = "Dr. Ahmad Khalil";
        if (roleTag) {
          roleTag.textContent = "Doctor: Dr. Ahmad Khalil";
          roleTag.className = "text-[9px] px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold font-mono";
        }
      } else {
        btnStudent.classList.add('bg-emerald-600', 'text-white', 'font-bold');
        btnStudent.classList.remove('text-slate-400');
        btnDoctor.classList.remove('bg-blue-600', 'text-white', 'font-bold');
        btnDoctor.classList.add('text-slate-400');
        if (docBanner) docBanner.classList.add('hidden');
        if (islandBadge) islandBadge.textContent = "Hanan • ZUJ";
        if (roleTag) {
          roleTag.textContent = "Student: Hanan";
          roleTag.className = "text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono";
        }
      }
      renderAssignments();
    }

    function setStudent(student) {
      currentStudent = student;
      const btnHanan = document.getElementById('btn-user-hanan');
      const btnAbood = document.getElementById('btn-user-abood');
      const nameEl = document.getElementById('hub-student-name');
      const idEl = document.getElementById('hub-student-id');
      const initialsEl = document.getElementById('hub-avatar-initials');

      if (student === 'hanan') {
        btnHanan.classList.add('bg-emerald-600', 'text-white');
        btnHanan.classList.remove('text-slate-400');
        btnAbood.classList.remove('bg-emerald-600', 'text-white');
        btnAbood.classList.add('text-slate-400');
        if (nameEl) nameEl.textContent = "Hanan (حنان)";
        if (idEl) idEl.textContent = "240002";
        if (initialsEl) initialsEl.textContent = "HA";
      } else {
        btnAbood.classList.add('bg-emerald-600', 'text-white');
        btnAbood.classList.remove('text-slate-400');
        btnHanan.classList.remove('bg-emerald-600', 'text-white');
        btnHanan.classList.add('text-slate-400');
        if (nameEl) nameEl.textContent = "Abdualrhman (Abood)";
        if (idEl) idEl.textContent = "202212359";
        if (initialsEl) initialsEl.textContent = "AB";
      }
    }

    function switchScreen(screenId) {
      document.querySelectorAll('.screen-view').forEach(el => el.classList.add('hidden'));
      const target = document.getElementById('screen-' + screenId);
      if (target) target.classList.remove('hidden');

      document.querySelectorAll('.screen-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-600', 'text-white', 'shadow');
        btn.classList.add('text-slate-400');
      });
      const activeBtn = document.getElementById('btn-' + screenId);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-400');
        activeBtn.classList.add('bg-emerald-600', 'text-white', 'shadow');
      }

      // Update bottom nav highlights
      const navIds = ['assignments', 'oliver-hub', 'zuj-schedule', 'zuj-elearning', 'chat'];
      navIds.forEach(id => {
        const navBtn = document.getElementById('nav-btn-' + id);
        if (navBtn) {
          if (id === screenId) {
            navBtn.classList.add('text-emerald-400');
            navBtn.classList.remove('text-slate-400');
          } else if (id !== 'chat') {
            navBtn.classList.remove('text-emerald-400');
            navBtn.classList.add('text-slate-400');
          }
        }
      });

      document.getElementById('viewport-content').scrollTop = 0;
      if (screenId === 'assignments') renderAssignments();
    }

    function setDevice(device) {
      currentDevice = device;
      const chassis = document.getElementById('phone-chassis');
      const screen = document.getElementById('phone-screen');
      const island = document.getElementById('dynamic-island');
      const btnIphone = document.getElementById('dev-btn-iphone');
      const btnSamsung = document.getElementById('dev-btn-samsung');

      if (device === 'iphone') {
        chassis.style.width = '392px';
        chassis.style.height = '835px';
        chassis.style.borderRadius = '50px';
        screen.style.borderRadius = '42px';
        island.style.display = 'flex';
        btnIphone.classList.add('bg-emerald-600', 'text-white');
        btnIphone.classList.remove('text-slate-400');
        btnSamsung.classList.remove('bg-emerald-600', 'text-white');
        btnSamsung.classList.add('text-slate-400');
      } else {
        chassis.style.width = '412px';
        chassis.style.height = '840px';
        chassis.style.borderRadius = '24px';
        screen.style.borderRadius = '18px';
        island.style.display = 'none';
        btnSamsung.classList.add('bg-emerald-600', 'text-white');
        btnSamsung.classList.remove('text-slate-400');
        btnIphone.classList.remove('bg-emerald-600', 'text-white');
        btnIphone.classList.add('text-slate-400');
      }
    }

    function toggleLanguage() {
      const screen = document.getElementById('phone-screen');
      const langLabel = document.getElementById('lang-label');
      
      currentLang = currentLang === 'en' ? 'ar' : 'en';
      screen.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
      langLabel.textContent = currentLang === 'ar' ? 'English (LTR)' : 'العربية (RTL)';

      const dict = DICTIONARY[currentLang];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
      });

      renderAssignments();
    }

    function openCourseModal(code, title, modality, room, time, instructor) {
      document.getElementById('modal-code').textContent = code;
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-modality').textContent = modality;
      document.getElementById('modal-room').textContent = room;
      document.getElementById('modal-time').textContent = time;
      document.getElementById('modal-instructor').textContent = instructor;
      document.getElementById('course-modal').classList.remove('hidden');
    }

    function closeCourseModal() {
      document.getElementById('course-modal').classList.add('hidden');
    }

    function openChatWithAdvisor() {
      switchScreen('chat');
      const container = document.getElementById('chat-messages-container');
      const bubble = document.createElement('div');
      bubble.className = 'flex justify-end';
      bubble.innerHTML = '<div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-600 text-white px-3.5 py-2.5 shadow-md">Hi Dr. Ahmad, regarding the AVL Tree assignment due on Nov 11...</div>';
      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;
    }

    function handleChatSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const query = input.value.trim();
      if (!query) return;
      input.value = '';
      sendInquiry(query);
    }

    function handlePromptChip(text) {
      sendInquiry(text);
    }

    function sendInquiry(query) {
      const container = document.getElementById('chat-messages-container');
      const userBubble = document.createElement('div');
      userBubble.className = 'flex justify-end';
      userBubble.innerHTML = \`<div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-600 text-white px-3.5 py-2.5 shadow-md">\${escapeHtml(query)}</div>\`;
      container.appendChild(userBubble);
      container.scrollTop = container.scrollHeight;

      setTimeout(() => {
        let reply = "I understand your inquiry. ";
        const q = query.toLowerCase();

        if (q.includes('avl') || q.includes('tree') || q.includes('rotation') || q.includes('cs201')) {
          reply = "<strong>CS201 AVL Rotation Complexity:</strong><br>• Single or Double rotation in an AVL tree takes <strong>O(1) constant time</strong> because only parent and child pointer swaps are performed!<br>• Traversal to detect the unbalanced node takes O(log n).<br>• You can submit this directly in the Assignments tab!";
        } else if (q.includes('late') || q.includes('overdue') || q.includes('متأخر') || q.includes('penalty')) {
          reply = "<strong>ZUJ Late Submission Policy:</strong><br>• Yes! You can submit overdue assignments on Oliver.<br>• They are recorded as <strong>'Late Submission'</strong> with an audit timestamp.<br>• Your doctor (e.g. Dr. Omar Hassan) will see the late flag and grade it according to course guidelines.";
        } else if (q.includes('timetable') || q.includes('ahmad') || q.includes('schedule')) {
          reply = "<strong>Hanan's Classes with Dr. Ahmad Khalil:</strong><br>• <strong>CS201 Data Structures:</strong> Tuesday 11:30 - 12:20 (Hall 41).<br>• <strong>CS202 OOP:</strong> Wednesday 08:30 - 09:45 (Hall 42).";
        } else {
          reply = \`Verified for Student <strong>Hanan (240002)</strong>: Your academic progress is in good standing and your registered courses are synced with Dr. Ahmad Khalil.\`;
        }

        const botBubble = document.createElement('div');
        botBubble.className = 'flex justify-start';
        botBubble.innerHTML = \`
          <div class="max-w-[88%] rounded-2xl rounded-tl-xs bg-slate-900/90 border border-emerald-500/25 px-3.5 py-2.5 text-slate-100 shadow-md space-y-1.5">
            <p class="leading-relaxed text-[11px]">\${reply}</p>
            <span class="inline-block text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Oliver Verified</span>
          </div>\`;
        container.appendChild(botBubble);
        container.scrollTop = container.scrollHeight;
      }, 350);
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Initialize initial render
    renderAssignments();
  </script>
</body>
</html>
`;

fs.writeFileSync(targetPath, htmlContent, "utf8");
console.log("Successfully generated phone_preview.html at", targetPath);
