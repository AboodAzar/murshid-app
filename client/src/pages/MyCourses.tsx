import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  BookOpen, ChevronRight, GraduationCap, Award, Users, BarChart3,
} from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const courseColors = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-indigo-500",
];

export default function MyCourses() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: courses = [], isLoading } = trpc.student.myCourses.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("student.myCourses")}</h1>
            <p className="text-slate-400 mt-1">{courses.length} {t("student.enrolledCourses")}</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">{t("student.noCoursesYet")}</p>
            <p className="text-slate-500 text-sm mt-2">{t("student.contactAdvisorToEnroll")}</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                {...fadeInUp}
                transition={{ delay: i * 0.05 }}
                onClick={() => setLocation(`/courses/${course.courseId}`)}
                className="cursor-pointer group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl hover:bg-white/[0.07] transition-all hover:-translate-y-1"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${courseColors[i % courseColors.length]}`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${courseColors[i % courseColors.length]} flex items-center justify-center`}>
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    course.status === "completed"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : course.status === "in_progress"
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-slate-500/15 text-slate-400"
                  }`}>
                    {course.status === "completed" ? t("student.completed") : course.status === "in_progress" ? t("student.inProgress") : t("student.planned")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{course.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{course.code} • {course.credits} {t("student.credits")}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {course.instructorName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> {course.currentGrade}</span>
                    <span className="text-slate-400 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> {course.attendance}% {t("student.attendance")}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{t("student.progress")}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
                  {t("student.viewDetails")} <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
