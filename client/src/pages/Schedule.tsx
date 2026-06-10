import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Clock, MapPin, CalendarDays, Users } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const dayColors = [
  "border-l-blue-500",
  "border-l-violet-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-rose-500",
  "border-l-sky-500",
  "border-l-indigo-500",
];

export default function Schedule() {
  const { t } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;
  const { data: schedule = [], isLoading } = trpc.student.fullSchedule.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);

  if (!user) return null;

  const grouped = schedule.reduce((acc, s) => {
    const day = s.dayOfWeek ?? 0;
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {} as Record<number, typeof schedule>);

  const dayOrder = [0, 1, 2, 3, 4, 5, 6];
  const dayNames = [
    t("common.sunday"), t("common.monday"), t("common.tuesday"),
    t("common.wednesday"), t("common.thursday"), t("common.friday"), t("common.saturday"),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("student.schedule")}</h1>
            <p className="text-slate-400 mt-1">{t("student.weeklySchedule")}</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : schedule.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-20">
            <CalendarDays className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">{t("student.noScheduleAvailable")}</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {dayOrder.map((day) => {
              const items = grouped[day];
              if (!items || items.length === 0) return null;
              return (
                <motion.div key={day} {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400`} />
                    {dayNames[day]}
                  </h3>
                  <div className="space-y-3">
                    {items.map((s) => (
                      <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border-l-4 ${dayColors[day]} border-y border-r border-white/5`}>
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[70px]">
                            <p className="text-white font-bold text-lg">{s.startTime}</p>
                            <p className="text-xs text-slate-400">{s.endTime}</p>
                          </div>
                          <div className="h-10 w-px bg-white/10" />
                          <div>
                            <p className="text-white font-medium">{s.courseName}</p>
                            <p className="text-sm text-slate-400">{s.courseCode}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm text-slate-300 flex items-center justify-end gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" /> {s.buildingName} • {t("student.room")} {s.roomNumber}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center justify-end gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500" /> {s.lecturerName}
                          </p>
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
