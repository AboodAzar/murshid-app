import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Route, Target, Calendar, CheckCircle2, Circle, BookOpen,
  GraduationCap, Clock, AlertTriangle,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function StudyPlan() {
  const { t } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: dashboard } = trpc.student.dashboard.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: myCourses = [] } = trpc.student.myCourses.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);

  if (!user) return null;

  const plan = dashboard?.studyPlan;
  const stats = dashboard?.stats;
  const courses = myCourses;

  const completed = courses.filter((c) => c.status === "completed");
  const inProgress = courses.filter((c) => c.status === "in_progress");
  const planned = courses.filter((c) => c.status === "planned");

  const semesters = Array.from(new Set(courses.map((c) => c.semester))).sort((a, b) => a - b);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp}>
          <h1 className="text-3xl font-bold text-white">{t("student.studyPlan")}</h1>
          <p className="text-slate-400 mt-1">{t("student.yourAcademicRoadmap")}</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.completed")}</h3>
            </div>
            <p className="text-4xl font-bold text-emerald-400">{completed.length}</p>
            <p className="text-sm text-slate-400 mt-1">{stats?.earnedCredits ?? 0} {t("student.creditsEarned")}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.inProgress")}</h3>
            </div>
            <p className="text-4xl font-bold text-blue-400">{inProgress.length}</p>
            <p className="text-sm text-slate-400 mt-1">{t("student.currentSemester")} {stats?.currentSemester ?? 0}</p>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Target className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t("student.planned")}</h3>
            </div>
            <p className="text-4xl font-bold text-violet-400">{planned.length}</p>
            <p className="text-sm text-slate-400 mt-1">{stats?.semestersLeft ?? 0} {t("student.semestersLeft")}</p>
          </motion.div>
        </div>

        {semesters.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-20">
            <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">{t("student.noStudyPlanYet")}</p>
            <p className="text-slate-500 text-sm mt-2">{t("student.contactAdvisorToPlan")}</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {semesters.map((sem) => {
              const semCourses = courses.filter((c) => c.semester === sem);
              return (
                <motion.div key={sem} {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" /> {t("student.semester")} {sem}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {semCourses.length} {t("student.courses")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {semCourses.map((c) => (
                      <div key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5 gap-2 sm:gap-0">
                        <div className="flex items-center gap-3">
                          {c.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : c.status === "in_progress" ? (
                            <Circle className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.code} • {c.credits} {t("student.credits")}</p>
                          </div>
                        </div>
                        <div className="text-start sm:text-end ps-7 sm:ps-0">
                          {c.grade && (
                            <span className="text-sm font-medium text-emerald-400">{c.grade}</span>
                          )}
                          <span className={`ms-0 sm:ms-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                            c.status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
                            c.status === "in_progress" ? "bg-blue-500/15 text-blue-400" :
                            "bg-slate-500/15 text-slate-400"
                          }`}>
                            {c.status === "completed" ? t("student.completed") : c.status === "in_progress" ? t("student.inProgress") : t("student.planned")}
                          </span>
                        </div>
                      </div>
                    ))}
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
