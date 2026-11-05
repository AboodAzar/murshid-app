import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Route, Target, Calendar, CheckCircle2, Circle, BookOpen,
  GraduationCap, Clock, AlertTriangle, Search, Filter,
  ArrowRight, Sparkles, Layers, Info, Check, ShieldCheck,
  ChevronDown, ChevronUp, Lock
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export default function StudyPlan() {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  
  const { data: dashboard } = trpc.student.dashboard.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: myCourses = [] } = trpc.student.myCourses.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: allPrereqs = [] } = trpc.courses.getAllPrerequisites.useQuery();

  const [activeFilter, setActiveFilter] = useState<"all" | "ready" | "in_progress" | "completed" | "locked">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  if (!user) return null;

  const plan = dashboard?.studyPlan;
  const stats = dashboard?.stats;
  const courses = myCourses;

  const completed = courses.filter((c) => c.status === "completed");
  const inProgress = courses.filter((c) => c.status === "in_progress");
  const planned = courses.filter((c) => c.status === "planned");

  // Determine readiness for all planned courses
  const coursePrereqMap = useMemo(() => {
    const map = new Map<number, { prereqs: typeof allPrereqs; allMet: boolean; missingPrereqs: typeof allPrereqs; unlocks: typeof allPrereqs }>();
    
    courses.forEach((c) => {
      const coursePrereqs = allPrereqs.filter((p) => p.courseId === c.courseId);
      const missingPrereqs = coursePrereqs.filter(
        (p) => !courses.some((mc) => (mc.courseId === p.prerequisiteId || mc.code === p.prerequisiteCode) && mc.status === "completed")
      );
      const unlocks = allPrereqs.filter((p) => p.prerequisiteId === c.courseId || p.prerequisiteCode === c.code);
      
      map.set(c.courseId, {
        prereqs: coursePrereqs,
        allMet: missingPrereqs.length === 0,
        missingPrereqs,
        unlocks,
      });
    });

    return map;
  }, [courses, allPrereqs]);

  const readyToEnrollCount = courses.filter(
    (c) => c.status === "planned" && (coursePrereqMap.get(c.courseId)?.allMet ?? true)
  ).length;

  const semesters = Array.from(new Set(courses.map((c) => c.semester))).sort((a, b) => a - b);

  // Filtered courses based on search & active filter tab
  const isMatch = (c: any) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query);
    if (!matchesSearch) return false;

    const prereqData = coursePrereqMap.get(c.courseId);

    if (activeFilter === "ready") {
      return c.status === "planned" && (prereqData?.allMet ?? true);
    }
    if (activeFilter === "locked") {
      return c.status === "planned" && prereqData && !prereqData.allMet;
    }
    if (activeFilter === "in_progress") {
      return c.status === "in_progress";
    }
    if (activeFilter === "completed") {
      return c.status === "completed";
    }
    return true;
  };

  const selectedCourseData = selectedCourseId ? courses.find((c) => c.courseId === selectedCourseId) : null;
  const selectedPrereqInfo = selectedCourseId ? coursePrereqMap.get(selectedCourseId) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header with Title & Degree Progress */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div {...fadeInUp}>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 px-2 py-0.5 text-xs font-semibold">
                {language === "ar" ? "جامعة الزيتونة الأردنية" : "Al-Zaytoonah University"}
              </Badge>
              <Badge variant="outline" className="text-amber-300 border-amber-500/30 text-xs">
                {language === "ar" ? "الخطة الدراسية المعتمدة" : "Official Degree Plan"}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {t("student.studyPlan") || "Study Plan & Degree Roadmap"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {language === "ar"
                ? "خارطة تتبع المساقات التفاعلية مع التحقق الذكي من المتطلبات السابقة"
                : "Interactive curriculum dependency map with automated prerequisite verification"}
            </p>
          </motion.div>

          {/* Quick Metrics Capsule */}
          <motion.div {...fadeInUp} className="flex items-center gap-2 bg-card border border-border p-2 rounded-2xl backdrop-blur-xl">
            <div className="px-3.5 py-1.5 text-center border-e border-border/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {language === "ar" ? "الساعات المنجزة" : "Earned Credits"}
              </span>
              <span className="text-xl font-bold text-emerald-400">
                {stats?.earnedCredits ?? completed.reduce((acc, c) => acc + (c.credits || 3), 0)}
                <span className="text-xs text-slate-400 font-normal"> / {plan?.totalCredits || 132}</span>
              </span>
            </div>
            <div className="px-3.5 py-1.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {language === "ar" ? "جاهز للتسجيل" : "Ready to Register"}
              </span>
              <span className="text-xl font-bold text-amber-400 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {readyToEnrollCount}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid gap-3.5 grid-cols-2 md:grid-cols-4">
          <motion.div {...fadeInUp} className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4.5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{t("student.completed")}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{completed.length}</p>
            <p className="text-xs text-emerald-300/80 mt-1">{Math.round((completed.length / (courses.length || 1)) * 100)}% {language === "ar" ? "من الخطة" : "of curriculum"}</p>
          </motion.div>

          <motion.div {...fadeInUp} className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4.5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{t("student.inProgress")}</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{inProgress.length}</p>
            <p className="text-xs text-amber-300/80 mt-1">{language === "ar" ? "الفصل الحالي" : "Current Term"}</p>
          </motion.div>

          <motion.div {...fadeInUp} className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4.5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{language === "ar" ? "متاح للتسجيل" : "Eligible Next"}</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-300">{readyToEnrollCount}</p>
            <p className="text-xs text-amber-200/80 mt-1">{language === "ar" ? "استوفت المتطلبات" : "Prereqs Fulfilled"}</p>
          </motion.div>

          <motion.div {...fadeInUp} className="rounded-2xl border border-border bg-card/60 p-4.5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("student.planned")}</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Target className="w-4 h-4 text-slate-300" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{planned.length}</p>
            <p className="text-xs text-slate-400 mt-1">{stats?.semestersLeft ?? 0} {t("student.semestersLeft") || "Semesters Left"}</p>
          </motion.div>
        </div>

        {/* Interactive Inspection Ribbon (Shows when a course is tapped/inspected) */}
        <AnimatePresence>
          {selectedCourseData && selectedPrereqInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/40 p-4.5 backdrop-blur-xl shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Info className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{selectedCourseData.code}: {selectedCourseData.name}</span>
                      <Badge className={selectedPrereqInfo.allMet ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}>
                        {selectedPrereqInfo.allMet ? "Ready to Enroll" : "Prerequisites Blocked"}
                      </Badge>
                    </h3>
                    <p className="text-xs text-slate-300">
                      {selectedCourseData.credits} {t("student.credits")} • Semester {selectedCourseData.semester}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedCourseId(null)} className="h-8 text-slate-400 hover:text-white">
                  ✕ Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-white/10 text-xs">
                {/* Upstream Prerequisites */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Required Prerequisites ({selectedPrereqInfo.prereqs.length}):
                  </span>
                  {selectedPrereqInfo.prereqs.length === 0 ? (
                    <p className="text-emerald-400 italic">No prerequisites required (Direct enrollment eligible).</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPrereqInfo.prereqs.map((p) => {
                        const isDone = courses.some((c) => (c.courseId === p.prerequisiteId || c.code === p.prerequisiteCode) && c.status === "completed");
                        return (
                          <span
                            key={p.prerequisiteId}
                            className={`px-2 py-1 rounded-md font-medium inline-flex items-center gap-1 ${
                              isDone ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
                            {p.prerequisiteCode} - {p.prerequisiteName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Downstream Unlocked Courses */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Unlocks Future Courses ({selectedPrereqInfo.unlocks.length}):
                  </span>
                  {selectedPrereqInfo.unlocks.length === 0 ? (
                    <p className="text-slate-400 italic">Capstone or terminal course in curriculum tree.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPrereqInfo.unlocks.map((u) => (
                        <span key={u.courseId} className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                          → {u.prerequisiteCode || u.courseId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar: Search & Strategic Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 border border-border p-2.5 rounded-2xl backdrop-blur-xl">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "ar" ? "ابحث برمز أو اسم المساق..." : "Filter courses by name or code..."}
              className="ps-9 bg-white/[0.04] border-border text-white text-xs h-9.5 rounded-xl placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: language === "ar" ? "الكل" : "All" },
              { id: "ready", label: language === "ar" ? "جاهز للتسجيل" : "Ready to Enroll" },
              { id: "in_progress", label: t("student.inProgress") },
              { id: "completed", label: t("student.completed") },
              { id: "locked", label: language === "ar" ? "بانتظار المتطلب" : "Prereqs Pending" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Curriculum Semesters */}
        {semesters.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-20 bg-card/40 rounded-3xl border border-border">
            <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-medium">{t("student.noStudyPlanYet") || "No Study Plan Assigned"}</p>
            <p className="text-slate-500 text-sm mt-1">{t("student.contactAdvisorToPlan") || "Contact your academic advisor to initialize your study plan."}</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {semesters.map((sem) => {
              const semCourses = courses.filter((c) => c.semester === sem);
              const matchedSemCourses = semCourses.filter(isMatch);
              if (matchedSemCourses.length === 0 && searchQuery) return null;

              const semCompleted = semCourses.filter((c) => c.status === "completed").length;
              const semProgress = Math.round((semCompleted / (semCourses.length || 1)) * 100);

              return (
                <motion.div
                  key={sem}
                  {...fadeInUp}
                  className="rounded-3xl border border-border bg-card/50 p-5 md:p-6 backdrop-blur-2xl space-y-4 shadow-sm"
                >
                  {/* Semester Header & Micro Progress Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-extrabold text-emerald-400 text-base">
                        {sem}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {t("student.semester")} {sem}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {semCourses.reduce((acc, c) => acc + (c.credits || 3), 0)} {language === "ar" ? "ساعة معتمدة" : "Credit Hours"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="w-28 sm:w-36 bg-slate-800/80 h-2 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${semProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 min-w-[3rem] text-end">
                        {semProgress}%
                      </span>
                    </div>
                  </div>

                  {/* Course Cards Grid */}
                  <div className="grid gap-2.5">
                    {matchedSemCourses.map((c) => {
                      const prereqData = coursePrereqMap.get(c.courseId);
                      const coursePrereqs = prereqData?.prereqs || [];
                      const allPrereqsMet = prereqData?.allMet ?? true;
                      const isInspected = selectedCourseId === c.courseId;

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCourseId(isInspected ? null : c.courseId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedCourseId(isInspected ? null : c.courseId)}
                          className={`group cursor-pointer p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                            isInspected
                              ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50"
                              : "bg-slate-900/40 border-border hover:border-emerald-500/30 hover:bg-slate-900/60"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                              {/* Status Icon */}
                              <div className="mt-0.5 sm:mt-0 shrink-0">
                                {c.status === "completed" ? (
                                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                ) : c.status === "in_progress" ? (
                                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                ) : allPrereqsMet ? (
                                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center" title="Ready to Enroll">
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center" title="Prerequisites Missing">
                                    <Lock className="w-4 h-4" />
                                  </div>
                                )}
                              </div>

                              {/* Course Details */}
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    {c.code}
                                  </span>
                                  <h4 className="text-white font-semibold text-sm sm:text-base truncate group-hover:text-emerald-200 transition-colors">
                                    {c.name}
                                  </h4>
                                  {c.status === "planned" && (
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] px-2 py-0 font-medium ${
                                        allPrereqsMet
                                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                                          : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                                      }`}
                                    >
                                      {allPrereqsMet ? "Ready to Enroll" : "Prereqs Pending"}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                  <span>{c.credits} {t("student.credits") || "Credits"}</span>
                                  <span>•</span>
                                  <span className="capitalize">{c.status.replace("_", " ")}</span>
                                  {c.grade && (
                                    <>
                                      <span>•</span>
                                      <span className="font-bold text-emerald-400 font-mono">Grade: {c.grade}</span>
                                    </>
                                  )}
                                </div>

                                {/* Prerequisite Badges Pills */}
                                {coursePrereqs.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] font-semibold text-slate-400">
                                      {language === "ar" ? "المتطلبات:" : "Prerequisites:"}
                                    </span>
                                    {coursePrereqs.map((prereq) => {
                                      const isDone = courses.some(
                                        (mc) => (mc.courseId === prereq.prerequisiteId || mc.code === prereq.prerequisiteCode) && mc.status === "completed"
                                      );
                                      return (
                                        <span
                                          key={prereq.prerequisiteId}
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                            isDone
                                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                              : "bg-red-500/15 text-red-300 border-red-500/30"
                                          }`}
                                        >
                                          {isDone ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <AlertTriangle className="w-2.5 h-2.5 text-red-400" />}
                                          <span>{prereq.prerequisiteCode}</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Affordance */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 ps-10 sm:ps-0 shrink-0">
                              <span className="text-xs text-slate-400 group-hover:text-emerald-300 transition-colors inline-flex items-center gap-1 font-medium">
                                {isInspected ? "Hide details" : "Inspect flow"}
                                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
