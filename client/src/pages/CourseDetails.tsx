import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useParams } from "wouter";
import {
  BookOpen, Clock, MapPin, Calendar, ArrowLeft, Users, BarChart3,
  FileText, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function CourseDetails() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params?.courseId);

  const { data, isLoading } = trpc.student.courseDetails.useQuery(
    { courseId },
    { enabled: !!courseId && !isNaN(courseId) }
  );

  if (!user) return null;

  const course = data?.course;
  const attendance = data?.attendance;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp}>
          <button onClick={() => setLocation("/courses")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("common.back")}
          </button>
        </motion.div>

        {isLoading || !course ? (
          <div className="space-y-4">
            <div className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/40 to-slate-900/60 p-6 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">{course.name}</h1>
                  <p className="text-slate-400 mt-1">{course.code} • {course.credits} {t("student.credits")} • {t("student.semester")} {course.semester}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
              </div>
              {course.description && (
                <p className="text-slate-300 mt-4 leading-relaxed">{course.description}</p>
              )}
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{t("student.attendance")}</h3>
                </div>
                <p className="text-3xl font-bold text-emerald-400">{attendance?.rate ?? 0}%</p>
                <p className="text-sm text-slate-400 mt-1">{attendance?.present ?? 0} / {attendance?.total ?? 0} {t("student.sessions")}</p>
              </motion.div>

              <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{t("student.instructor")}</h3>
                </div>
                <p className="text-3xl font-bold text-blue-400">{data?.schedule?.[0]?.lecturerName ?? "—"}</p>
                <p className="text-sm text-slate-400 mt-1">{t("student.lecturer")}</p>
              </motion.div>

              <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{t("student.status")}</h3>
                </div>
                <p className="text-3xl font-bold text-violet-400 capitalize">{data?.enrollment?.status ?? "—"}</p>
                <p className="text-sm text-slate-400 mt-1">{t("student.semester")} {data?.enrollment?.semester ?? "—"}</p>
              </motion.div>
            </div>

            <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" /> {t("student.schedule")}
              </h3>
              {data?.schedule && data.schedule.length > 0 ? (
                <div className="space-y-3">
                  {data.schedule.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-white font-medium">{s.dayOfWeek === 0 ? t("common.sunday") : s.dayOfWeek === 1 ? t("common.monday") : s.dayOfWeek === 2 ? t("common.tuesday") : s.dayOfWeek === 3 ? t("common.wednesday") : s.dayOfWeek === 4 ? t("common.thursday") : s.dayOfWeek === 5 ? t("common.friday") : t("common.saturday")}</p>
                          <p className="text-sm text-slate-400">{s.startTime} - {s.endTime}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">{s.buildingName}</p>
                        <p className="text-xs text-slate-400">{t("student.room")} {s.roomNumber} • {t("student.floor")} {s.floor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6">{t("student.noScheduleAvailable")}</p>
              )}
            </motion.div>

            <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" /> {t("student.assignments")}
              </h3>
              {data?.assignments && data.assignments.length > 0 ? (
                <div className="space-y-3">
                  {data.assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5">
                      <div>
                        <p className="text-white font-medium">{a.title}</p>
                        <p className="text-xs text-slate-400">{a.totalPoints} {t("student.points")}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          a.saStatus === "graded" ? "bg-emerald-500/15 text-emerald-400" :
                          a.saStatus === "submitted" ? "bg-blue-500/15 text-blue-400" :
                          a.saStatus === "overdue" ? "bg-red-500/15 text-red-400" :
                          "bg-amber-500/15 text-amber-400"
                        }`}>
                          {a.saStatus ?? "pending"}
                        </span>
                        {a.saScore !== null && a.saScore !== undefined && (
                          <p className="text-xs text-slate-400 mt-1">{a.saScore} / {a.totalPoints}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6">{t("student.noAssignmentsYet")}</p>
              )}
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
