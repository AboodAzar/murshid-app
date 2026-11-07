import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, CheckCircle2, Clock, BookOpen, Search, X,
  GraduationCap, Award, ChevronDown, ChevronUp, Sparkles, Filter
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

interface MajorDegreeRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: number;
}

export default function MajorDegreeRoadmapModal({
  isOpen,
  onClose,
  studentId,
}: MajorDegreeRoadmapModalProps) {
  const { t, language } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in_progress" | "not_enrolled">("all");
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({
    uni_compulsory: true,
    uni_elective: true,
    faculty_compulsory: true,
    major_compulsory: true,
    major_elective: true,
    supporting_compulsory: true,
  });

  const { data: roadmap, isLoading } = trpc.courses.getMajorDegreeRoadmap.useQuery(
    studentId ? { studentId } : undefined,
    { enabled: isOpen }
  );

  const toggleFamily = (familyId: string) => {
    setExpandedFamilies((prev) => ({
      ...prev,
      [familyId]: !prev[familyId],
    }));
  };

  const expandAll = () => {
    if (!roadmap?.families) return;
    const all: Record<string, boolean> = {};
    roadmap.families.forEach((f) => (all[f.id] = true));
    setExpandedFamilies(all);
  };

  const collapseAll = () => {
    if (!roadmap?.families) return;
    const none: Record<string, boolean> = {};
    roadmap.families.forEach((f) => (none[f.id] = false));
    setExpandedFamilies(none);
  };

  // Filtered families & courses
  const filteredFamilies = useMemo(() => {
    if (!roadmap?.families) return [];

    const query = searchQuery.trim().toLowerCase();

    return roadmap.families.map((fam) => {
      const filteredCourses = fam.courses.filter((c) => {
        // Status filter
        if (filterStatus !== "all" && c.status !== filterStatus) return false;

        // Search query filter
        if (query) {
          const matchCode = (c.code || "").toLowerCase().includes(query) || (c.cleanCode || "").toLowerCase().includes(query);
          const matchNameEn = (c.nameEn || "").toLowerCase().includes(query);
          const matchNameAr = (c.nameAr || "").toLowerCase().includes(query);
          if (!matchCode && !matchNameEn && !matchNameAr) return false;
        }

        return true;
      });

      return {
        ...fam,
        filteredCourses,
      };
    });
  }, [roadmap, searchQuery, filterStatus]);

  if (!isOpen) return null;

  const summary = roadmap?.summary || {
    totalDegreeCredits: 132,
    completedCredits: 0,
    inProgressCredits: 0,
    remainingCredits: 132,
    overallProgressPct: 0,
    studentName: "Hanan Saleh",
    universityId: "240002",
    majorNameEn: "Computer Science & Software Systems (ZUJ Curriculum)",
    majorNameAr: "علم الحاسوب وهندسة البرمجيات (خطة جامعة الزيتونة)",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-6xl max-h-[92vh] bg-slate-900/95 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-start"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-6 border-b border-white/10 bg-slate-950/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {language === "ar" ? "خطة التخصص وشجرة المواد الدراسية" : "Major Curriculum Degree Roadmap"}
                  </h2>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    ZUJ Official Plan (132 Cr)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {summary.studentName} ({summary.universityId}) • {language === "ar" ? summary.majorNameAr : summary.majorNameEn}
                </p>
              </div>
            </div>

            {/* Close & Global Controls */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
              >
                {language === "ar" ? "توسيع الكل" : "Expand All"}
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
              >
                {language === "ar" ? "طي الكل" : "Collapse All"}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Top Degree Overview Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-white/10 relative overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[11px] text-slate-400 block">{language === "ar" ? "إجمالي ساعات الخطة" : "Total Degree Credits"}</span>
                  <span className="text-xl font-bold text-white mt-1 block">{summary.totalDegreeCredits} Cr</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <span className="text-[11px] text-emerald-400 block">{language === "ar" ? "الساعات المنجزة (مكتملة)" : "Completed Credits"}</span>
                  <span className="text-xl font-bold text-emerald-300 mt-1 block">
                    {summary.completedCredits} Cr <span className="text-xs font-normal text-emerald-400/80">({summary.overallProgressPct}%)</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                  <span className="text-[11px] text-cyan-400 block">{language === "ar" ? "قيد الإنجاز حالياً" : "In-Progress Credits"}</span>
                  <span className="text-xl font-bold text-cyan-300 mt-1 block">{summary.inProgressCredits} Cr</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[11px] text-slate-400 block">{language === "ar" ? "الساعات المتبقية" : "Remaining Credits"}</span>
                  <span className="text-xl font-bold text-amber-300 mt-1 block">{summary.remainingCredits} Cr</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-medium">
                  <span>{language === "ar" ? "التقدم الأكاديمي الإجمالي نحو التخرج" : "Degree Completion Progress"}</span>
                  <span className="text-emerald-400 font-bold">{summary.overallProgressPct}% Complete</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/5 flex">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700"
                    style={{ width: `${(summary.completedCredits / summary.totalDegreeCredits) * 100}%` }}
                    title={`Completed: ${summary.completedCredits} Cr`}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 opacity-80"
                    style={{ width: `${(summary.inProgressCredits / summary.totalDegreeCredits) * 100}%` }}
                    title={`In Progress: ${summary.inProgressCredits} Cr`}
                  />
                </div>
              </div>

              {/* Course Color Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
                <span className="font-semibold text-slate-400">{language === "ar" ? "دليل الألوان:" : "Color Key:"}</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <span className="font-medium text-emerald-300">{language === "ar" ? "ناجح ومكتمل (لون أخضر)" : "Passed / Completed (Green)"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                  <span className="font-medium text-cyan-300">{language === "ar" ? "قيد الدراسة حالياً (لون أزرق سماوي)" : "Currently Enrolled (Cyan)"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-600" />
                  <span className="text-slate-400">{language === "ar" ? "غير مسجل بعد (رمادي داكن)" : "Not Enrolled (Slate)"}</span>
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === "ar" ? "بحث برمز المادة أو اسمها (مثل: CS101, 130100)..." : "Search course code or title (e.g. CS101, 130100)..."}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 ps-9 pe-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: language === "ar" ? "كل المواد" : "All Courses" },
                  { id: "completed", label: language === "ar" ? "المنجزة فقط" : "Completed" },
                  { id: "in_progress", label: language === "ar" ? "قيد الدراسة" : "In Progress" },
                  { id: "not_enrolled", label: language === "ar" ? "المتبقية" : "Remaining" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      filterStatus === tab.id
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                        : "bg-slate-950/60 text-slate-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Requirement Families List */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-slate-800/40 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : filteredFamilies.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-white/10 bg-slate-950/40">
                <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-300 font-semibold">{language === "ar" ? "لا توجد مواد مطابقة للبحث" : "No matching courses found"}</p>
                <p className="text-xs text-slate-500 mt-1">{language === "ar" ? "جرّب تغيير عبارة البحث أو الفلتر" : "Try adjusting your search query or filter"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFamilies.map((fam) => {
                  const isExpanded = expandedFamilies[fam.id] ?? true;

                  return (
                    <div
                      key={fam.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden shadow-lg backdrop-blur-md transition-all"
                    >
                      {/* Family Header */}
                      <button
                        onClick={() => toggleFamily(fam.id)}
                        className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                            fam.isFinished
                              ? "bg-emerald-500 shadow-md shadow-emerald-500/50"
                              : fam.inProgressCredits > 0
                              ? "bg-cyan-400 shadow-md shadow-cyan-400/50"
                              : "bg-slate-600"
                          }`} />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-white">
                                {language === "ar" ? fam.titleAr : fam.titleEn}
                              </h3>
                              {/* Finished vs In Progress Indicator */}
                              {fam.isFinished ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm shadow-emerald-950/50">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>{language === "ar" ? fam.statusLabelAr : fam.statusLabelEn}</span>
                                </span>
                              ) : fam.inProgressCredits > 0 ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-sm shadow-cyan-950/50">
                                  <Clock className="w-3 h-3 text-cyan-400" />
                                  <span>{language === "ar" ? fam.statusLabelAr : fam.statusLabelEn}</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-white/5">
                                  {language === "ar" ? fam.statusLabelAr : fam.statusLabelEn}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {language === "ar" ? fam.titleEn : fam.titleAr} • {fam.coursesCount} {language === "ar" ? "مادة" : "courses"}
                            </p>
                          </div>
                        </div>

                        {/* Credits Meter & Chevron */}
                        <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                          <div className="text-end">
                            <span className="text-xs font-bold text-white">
                              {fam.completedCredits} / {fam.requiredCredits} Cr
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {fam.progressPct}% {language === "ar" ? "منجز" : "completed"}
                            </span>
                          </div>

                          <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                            <div
                              className={`h-full ${fam.isFinished ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 to-emerald-400"}`}
                              style={{ width: `${Math.min(100, fam.progressPct)}%` }}
                            />
                          </div>

                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Courses Grid */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 pt-0 border-t border-white/5 mt-2">
                          {fam.filteredCourses.length === 0 ? (
                            <p className="text-xs text-slate-500 italic p-3 text-center">
                              {language === "ar" ? "لا توجد مواد تطابق الفلتر في هذه العائلة" : "No courses match the active filter in this requirement family."}
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {fam.filteredCourses.map((c) => {
                                const isCompleted = c.status === "completed";
                                const isInProgress = c.status === "in_progress";

                                return (
                                  <div
                                    key={c.code}
                                    className={`p-3.5 rounded-xl border transition-all ${
                                      isCompleted
                                        ? "bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-950/45 shadow-sm shadow-emerald-950/30"
                                        : isInProgress
                                        ? "bg-cyan-950/30 border-cyan-500/40 hover:bg-cyan-950/45 ring-1 ring-cyan-500/20 shadow-sm shadow-cyan-950/30"
                                        : "bg-slate-900/60 border-white/5 hover:border-white/15 opacity-85 hover:opacity-100"
                                    }`}
                                  >
                                    {/* Card Header: Code & Status Badge */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                                          isCompleted
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : isInProgress
                                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                            : "bg-slate-800 text-slate-400 border border-white/5"
                                        }`}>
                                          {c.code}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-semibold">
                                          {c.credits} Cr
                                        </span>
                                      </div>

                                      {/* Status tag */}
                                      {isCompleted ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                          <span>Passed {c.grade ? `(${c.grade})` : ""}</span>
                                        </span>
                                      ) : isInProgress ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5 text-cyan-400" />
                                          <span>Enrolled</span>
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-500">
                                          Not Enrolled
                                        </span>
                                      )}
                                    </div>

                                    {/* Course Name */}
                                    <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                                      {language === "ar" ? c.nameAr || c.nameEn : c.nameEn || c.nameAr}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                      {language === "ar" ? c.nameEn : c.nameAr}
                                    </p>

                                    {/* Footer: Modality & Prerequisite */}
                                    <div className="flex flex-wrap items-center justify-between gap-1 mt-2.5 pt-2 border-t border-white/5 text-[10px]">
                                      <span className="text-slate-400">
                                        {language === "ar" ? c.modalityAr : c.modality}
                                      </span>
                                      {c.prerequisite ? (
                                        <span className="text-amber-400 font-mono" title={`Prerequisite: ${c.prerequisite}`}>
                                          Prereq: {c.prerequisite}
                                        </span>
                                      ) : (
                                        <span className="text-slate-500">No Prereq</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>
              {language === "ar" ? "جامعة الزيتونة الأردنية — دليل الخطة الدراسية الرسمية المعتمدة" : "Al-Zaytoonah University of Jordan — Official Degree Study Plan"}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
