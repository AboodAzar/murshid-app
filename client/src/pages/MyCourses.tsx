import React, { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import MajorDegreeRoadmapModal from "@/components/MajorDegreeRoadmapModal";
import { motion } from "framer-motion";
import {
  BookOpen, ChevronRight, GraduationCap, Award, Users, BarChart3,
  Compass, Clock, CheckCircle2, Lock, Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function MyCourses() {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);

  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: courses = [], isLoading } = trpc.student.myCourses.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);

  // Strictly order courses: In-progress at TOP, Completed at BOTTOM
  const inProgressCourses = useMemo(() => {
    return courses.filter((c) => c.status === "in_progress");
  }, [courses]);

  const completedCourses = useMemo(() => {
    return courses.filter((c) => c.status === "completed");
  }, [courses]);

  const otherCourses = useMemo(() => {
    return courses.filter((c) => c.status !== "in_progress" && c.status !== "completed");
  }, [courses]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Page Top Header with Title and Major Degree Roadmap Button */}
        <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("student.myCourses")}</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">
              {courses.length} {t("student.enrolledCourses")} ({inProgressCourses.length} {language === "ar" ? "قيد الدراسة" : "In Progress"}, {completedCourses.length} {language === "ar" ? "مكتملة" : "Completed"})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoadmapModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Compass className="w-4 h-4 text-emerald-100" />
              <span>{language === "ar" ? "خطة التخصص وشجرة المواد 🗺️" : "View Major Degree Roadmap 🗺️"}</span>
            </button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-800/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-20 rounded-3xl border border-white/10 bg-slate-900/30">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">{t("student.noCoursesYet")}</p>
            <p className="text-slate-500 text-sm mt-2">{t("student.contactAdvisorToEnroll")}</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* 1. TOP SECTION: IN-PROGRESS COURSES (Vibrant Cyan / Sky Blue Theme) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>{language === "ar" ? "المساقات قيد الدراسة (الفصل الحالي)" : "In-Progress Courses (Current Semester)"}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                        {inProgressCourses.length} Active
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {language === "ar" ? "المواد المسجلة حالياً وتخضع للتقييم المستمر والحضور والغياب" : "Currently registered courses with ongoing assignments, exams, and attendance tracking"}
                    </p>
                  </div>
                </div>
              </div>

              {inProgressCourses.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-slate-400 text-xs">
                  {language === "ar" ? "لا توجد مواد مسجلة قيد الدراسة حالياً" : "No active in-progress courses found."}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.map((course, i) => (
                    <motion.div
                      key={course.id}
                      {...fadeInUp}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setLocation(`/courses/${course.courseId}`)}
                      className="cursor-pointer group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 backdrop-blur-2xl hover:bg-slate-900/80 hover:border-cyan-400/50 transition-all hover:-translate-y-1 shadow-lg shadow-cyan-950/20"
                    >
                      {/* Top Stripe - Cyan Theme */}
                      <div className="absolute top-0 start-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600" />

                      <div className="flex items-start justify-between mb-3 mt-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-950/50">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{t("student.inProgress")}</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-400 mb-3 font-mono">
                        {course.code} • {course.credits} {t("student.credits")}
                      </p>

                      <div className="space-y-2 py-2 border-y border-white/5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500" /> {course.instructorName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-400" /> {course.currentGrade || "—"}
                          </span>
                          <span className={`flex items-center gap-1.5 font-bold ${
                            course.attendance >= 85 ? "text-emerald-400" : course.attendance >= 75 ? "text-amber-400" : "text-red-400"
                          }`}>
                            <BarChart3 className="w-3.5 h-3.5" /> {course.attendance}% {t("student.attendance")}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{t("student.progress")}</span>
                          <span className="text-cyan-300 font-bold">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          {course.completedAssignments}/{course.totalAssignments} {t("student.completed")}
                        </span>
                        <span className="text-cyan-400 group-hover:text-cyan-300 font-semibold flex items-center">
                          {t("student.viewDetails")} <ChevronRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. BOTTOM SECTION: COMPLETED COURSES (Regal Purple / Violet / Gold Theme) */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>{language === "ar" ? "المساقات المكتملة والمحفوظة (الأرشيف الأكاديمي)" : "Completed & Archived Courses (Academic Archive)"}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                        {completedCourses.length} Passed
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {language === "ar" ? "مواد منجزة ومحفوظة بنجاح — مغلقة ولا تتغير مع الفصول القادمة" : "Successfully completed courses — locked and permanently preserved"}
                    </p>
                  </div>
                </div>
              </div>

              {completedCourses.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-slate-400 text-xs">
                  {language === "ar" ? "لا توجد مواد مكتملة مسجلة بعد" : "No completed courses found."}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((course, i) => (
                    <motion.div
                      key={course.id}
                      {...fadeInUp}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setLocation(`/courses/${course.courseId}`)}
                      className="cursor-pointer group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-purple-950/10 p-5 backdrop-blur-2xl hover:bg-purple-950/25 hover:border-purple-400/50 transition-all hover:-translate-y-1 shadow-lg shadow-purple-950/20"
                    >
                      {/* Top Stripe - Purple Theme */}
                      <div className="absolute top-0 start-0 w-full h-1.5 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600" />

                      <div className="flex items-start justify-between mb-3 mt-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-950/50">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Grade: {course.currentGrade || "A"}</span>
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5 text-purple-400" />
                            <span>{t("student.completed")}</span>
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-400 mb-3 font-mono">
                        {course.code} • {course.credits} {t("student.credits")}
                      </p>

                      <div className="space-y-2 py-2 border-y border-white/5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500" /> {course.instructorName}
                          </span>
                          <span className="text-[10px] text-purple-400 font-mono">
                            🔒 Record Saved
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-emerald-400" /> Final Grade: {course.currentGrade || "A"}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> {course.attendance}% {t("student.attendance")}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{t("student.progress")}</span>
                          <span className="text-purple-300 font-bold">100% {language === "ar" ? "مكتمل" : "Completed"}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-purple-300/80 font-medium text-[11px] flex items-center gap-1">
                          <Lock className="w-3 h-3 text-purple-400" />
                          <span>{language === "ar" ? "المساق مغلق ومحفوظ" : "Archived & Submissions Closed"}</span>
                        </span>
                        <span className="text-purple-400 group-hover:text-purple-300 font-semibold flex items-center">
                          {language === "ar" ? "عرض الأرشيف" : "View Archive"} <ChevronRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. OTHER / PLANNED COURSES (if any) */}
            {otherCourses.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {language === "ar" ? "مساقات أخرى مخطط لها" : "Other / Planned Courses"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {otherCourses.map((course, i) => (
                    <div
                      key={course.id}
                      onClick={() => setLocation(`/courses/${course.courseId}`)}
                      className="cursor-pointer p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <h4 className="text-sm font-bold text-white">{course.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{course.code} • {course.credits} Cr</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Major Degree Roadmap Full Modal */}
        <MajorDegreeRoadmapModal
          isOpen={showRoadmapModal}
          onClose={() => setShowRoadmapModal(false)}
          studentId={advisorStudentId}
        />
      </div>
    </DashboardLayout>
  );
}
