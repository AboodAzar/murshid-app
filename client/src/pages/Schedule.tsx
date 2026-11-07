import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  CalendarDays,
  Users,
  Video,
  Globe,
  BookOpen,
  ExternalLink,
  IdCard,
  Sparkles,
  Info,
  Calendar,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import {
  formatUniversityId,
  getZujCourseModality,
  formatZujCourseCode,
  ZujCourseModality,
} from "@/lib/academicUtils";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const dayColors = [
  "border-s-emerald-500", // Sunday
  "border-s-teal-500",    // Monday
  "border-s-amber-500",   // Tuesday
  "border-s-indigo-500",  // Wednesday
];

export default function Schedule() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedModality, setSelectedModality] = useState<string>("all");

  const advisorStudentId =
    user?.role === "advisor"
      ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined
      : undefined;

  const { data: schedule = [], isLoading } = trpc.student.fullSchedule.useQuery(
    advisorStudentId ? { studentId: advisorStudentId } : undefined
  );

  if (!user) return null;

  const studentUniversityId = formatUniversityId(user);

  // Filter schedule by selected modality if active
  const filteredSchedule = schedule.filter((item: any) => {
    if (selectedModality === "all") return true;
    const modality = item.modality || getZujCourseModality(item.courseCode || "").modality;
    return modality === selectedModality;
  });

  const grouped = filteredSchedule.reduce((acc: Record<number, any[]>, s: any) => {
    const day = s.dayOfWeek ?? 0;
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});

  // ZUJ 4-Day Academic Week: strictly Sunday to Wednesday
  const activeDays = [0, 1, 2, 3];
  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday"];
  const dayNamesAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء"];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <motion.div
          {...fadeInUp}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {dir === "rtl" ? "جامعة الزيتونة الأردنية" : "Al-Zaytoonah University"}
              </span>
              <span className="text-[11px] text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-medium">
                {dir === "rtl" ? "دوام 4 أيام (أحد - أربعاء)" : "4-Day Week (Sun - Wed)"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {t("student.schedule")}
              <span className="text-base font-normal text-slate-400 hidden sm:inline">
                | {dir === "rtl" ? "الجدول الدراسي الأكاديمي" : "Weekly Timetable"}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>
                {dir === "rtl"
                  ? "المساقات موزعة وفقاً لأنماط التدريس الثلاثة: مدمج، وجاهي كامل، وعن بُعد عبر تيمز"
                  : "Lectures structured across 3 delivery modalities: Integrated, Face-to-Face, and MS Teams"}
              </span>
            </p>
          </div>

          {/* Student University ID Card */}
          <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 shadow-lg shadow-emerald-950/20 backdrop-blur-md self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-medium">
                {dir === "rtl" ? "الرقم الجامعي الرسمي" : "Official University ID"}
              </p>
              <p className="text-base font-mono font-bold text-white tracking-wider">
                {studentUniversityId}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3 Course Modalities Legend & Interactive Filter */}
        <motion.div
          {...fadeInUp}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {dir === "rtl" ? "أنماط تدريس المساقات في جامعة الزيتونة" : "ZUJ Course Teaching Modalities"}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {filteredSchedule.length} {dir === "rtl" ? "جلسة أسبوعية" : "Weekly Sessions"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* All filter button */}
            <button
              onClick={() => setSelectedModality("all")}
              className={`p-3 rounded-xl border text-start transition-all flex items-center justify-between ${
                selectedModality === "all"
                  ? "bg-slate-800 border-white/30 text-white shadow-md shadow-slate-900/40"
                  : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div>
                <p className="text-xs font-bold">{dir === "rtl" ? "جميع المساقات" : "All Courses"}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{dir === "rtl" ? "عرض الجدول كاملاً" : "View Complete"}</p>
              </div>
              <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-md text-white">
                {schedule.length}
              </span>
            </button>

            {/* Integrated */}
            <button
              onClick={() => setSelectedModality("integrated")}
              className={`p-3 rounded-xl border text-start transition-all flex items-center justify-between ${
                selectedModality === "integrated"
                  ? "bg-emerald-950/60 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/40"
                  : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div>
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {dir === "rtl" ? "مدمج (Integrated)" : "Integrated (Blended)"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {dir === "rtl" ? "يوم وجاهي + يوم نشاط إلكتروني" : "1 Campus + 1 E-Activity"}
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Moodle
              </span>
            </button>

            {/* Face to Face */}
            <button
              onClick={() => setSelectedModality("face_to_face")}
              className={`p-3 rounded-xl border text-start transition-all flex items-center justify-between ${
                selectedModality === "face_to_face"
                  ? "bg-amber-950/60 border-amber-500/50 text-white shadow-lg shadow-amber-950/40"
                  : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div>
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {dir === "rtl" ? "وجاهي كامل (F2F)" : "Face-to-Face"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {dir === "rtl" ? "محاضرتان وجاهيتان بالقاعة" : "2 In-Person Lectures"}
                </p>
              </div>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                Campus
              </span>
            </button>

            {/* Teams Online */}
            <button
              onClick={() => setSelectedModality("teams")}
              className={`p-3 rounded-xl border text-start transition-all flex items-center justify-between ${
                selectedModality === "teams"
                  ? "bg-indigo-950/60 border-indigo-500/50 text-white shadow-lg shadow-indigo-950/40"
                  : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div>
                <p className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  {dir === "rtl" ? "عن بُعد (MS Teams)" : "Teams Online"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {dir === "rtl" ? "محاضرتان إلكترونيتان عبر تيمز" : "2 Live Teams Sessions"}
                </p>
              </div>
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">
                Teams
              </span>
            </button>
          </div>
        </motion.div>

        {/* Schedule Grid */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredSchedule.length === 0 ? (
          <motion.div {...fadeInUp} className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/10">
            <CalendarDays className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-semibold">{t("student.noScheduleAvailable")}</p>
            <p className="text-slate-500 text-sm mt-1">
              {dir === "rtl" ? "لا توجد محاضرات مطابقة للمرشح المحدد" : "No lecture sessions found matching the active filter"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {activeDays.map((day) => {
              const items = grouped[day] || [];
              const dayName = dir === "rtl" ? dayNamesAr[day] : dayNamesEn[day];

              return (
                <motion.div
                  key={day}
                  {...fadeInUp}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-md shadow-emerald-500/50" />
                      {dayName}
                    </h3>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300">
                      {items.length} {dir === "rtl" ? (items.length === 1 ? "محاضرة" : "محاضرات") : items.length === 1 ? "Session" : "Sessions"}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs font-mono">
                      {dir === "rtl" ? "لا توجد محاضرات مجدولة لهذا اليوم" : "No lectures scheduled on this day"}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((s: any) => {
                        const modality = s.modality || "integrated";
                        const activityType = s.activityType || "lecture";
                        const isIntegrated = modality === "integrated";
                        const isTeams = modality === "teams";
                        const isActivity = activityType === "activity";

                        return (
                          <div
                            key={s.id}
                            className={`flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-xl bg-slate-900/60 border-s-4 ${
                              dayColors[day]
                            } border-y border-e border-white/5 gap-3 transition-all hover:bg-slate-800/60`}
                          >
                            {/* Left: Timing & Course Info */}
                            <div className="flex items-start sm:items-center gap-4">
                              <div className="text-center min-w-[75px] bg-black/40 p-2 rounded-xl border border-white/5">
                                <p className="text-white font-mono font-bold text-base leading-tight">
                                  {s.startTime}
                                </p>
                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                  {s.endTime}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* ZUJ 7-digit Course Code & Alpha code */}
                                  <span className="text-xs font-bold text-white font-mono bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                                    {formatZujCourseCode(s.courseCode)}
                                  </span>
                                  {s.courseCode && !/^\d{7}$/.test(s.courseCode) && (
                                    <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                                      {s.courseCode}
                                    </span>
                                  )}

                                  {/* Section badge */}
                                  <span className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-white/10">
                                    {dir === "rtl" ? `شعبة ${s.sectionNumber || s.section || "1"}` : `Sec ${s.sectionNumber || s.section || "1"}`}
                                  </span>

                                  {/* Modality Tag */}
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      isIntegrated
                                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                        : isTeams
                                        ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    }`}
                                  >
                                    {dir === "rtl"
                                      ? s.modalityLabelAr || (isIntegrated ? "مدمج" : isTeams ? "إلكتروني تيمز" : "وجاهي")
                                      : s.modalityLabel || (isIntegrated ? "Integrated" : isTeams ? "Teams Online" : "Face-to-Face")}
                                  </span>

                                  {/* Activity Type Tag (Theoretical vs Practical / Activity) */}
                                  <span
                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                      isActivity
                                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                        : isTeams
                                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        : "bg-slate-800 text-slate-300 border border-white/10"
                                    }`}
                                  >
                                    {dir === "rtl"
                                      ? s.activityLabelAr || (isActivity ? "نشاط إلكتروني" : isTeams ? "محاضرة تيمز" : "محاضرة وجاهية")
                                      : s.activityLabel || (isActivity ? "E-Learning Activity" : isTeams ? "Teams Live" : "Campus Lecture")}
                                  </span>
                                </div>

                                <p className="text-white font-semibold text-sm">
                                  {dir === "rtl" ? s.courseNameAr || s.courseName : s.courseName}
                                </p>

                                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{s.lecturerName || "Dr. ZUJ Faculty"}</span>
                                </p>
                              </div>
                            </div>

                            {/* Right: Venue / Action Button */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                              <div className="text-start md:text-end space-y-0.5">
                                <p className="text-xs text-slate-300 flex items-center md:justify-end gap-1.5">
                                  {isTeams ? (
                                    <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                  ) : isActivity ? (
                                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  )}
                                  <span className="font-medium">
                                    {dir === "rtl"
                                      ? s.locationOrPlatformAr || (isTeams ? "عبر Microsoft Teams" : isActivity ? "بوابة Moodle التعليمية" : `${s.buildingNameAr || "كلية IT"} • قاعة ${s.roomNumber || ""}`)
                                      : s.locationOrPlatform || (isTeams ? "Microsoft Teams Live" : isActivity ? "Moodle Portal" : `${s.buildingName || "IT"} • Room ${s.roomNumber || ""}`)}
                                  </span>
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  {isTeams
                                    ? "Online Virtual Classroom"
                                    : isActivity
                                    ? "Asynchronous Interaction"
                                    : "Faculty of Science & IT"}
                                </p>
                              </div>

                              {/* Interactive Action Button (Course Template, Teams Join or Moodle Link) */}
                              <button
                                onClick={() => setLocation(`/courses/${s.courseId || 41}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-white text-xs font-bold border border-white/10 hover:border-emerald-500/40 transition-all shrink-0"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{dir === "rtl" ? "المساق والمواد" : "Course & Materials"}</span>
                              </button>
                              {isTeams && (
                                <a
                                  href={s.teamsUrl || "https://teams.microsoft.com"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-900/30 transition-all shrink-0"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>{dir === "rtl" ? "انضمام للتيمز" : "Join Teams"}</span>
                                  <ExternalLink className="w-3 h-3 ms-0.5" />
                                </a>
                              )}

                              {isActivity && (
                                <a
                                  href={s.moodleLink || "https://elearning.zuj.edu.jo"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all shrink-0"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                  <span>{dir === "rtl" ? "بوابة التعلم" : "Open Moodle"}</span>
                                  <ExternalLink className="w-3 h-3 ms-0.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Official Non-Lecture Notice (Thursday, Friday, Saturday) */}
        <motion.div
          {...fadeInUp}
          className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 backdrop-blur-xl flex items-start gap-3.5"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-200">
              {dir === "rtl"
                ? "تعليمات الدوام الأسبوعي في جامعة الزيتونة الأردنية (الأحد – الأربعاء)"
                : "ZUJ Academic Week Regulations (Sunday – Wednesday Only)"}
            </h4>
            <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
              {dir === "rtl"
                ? "يقتصر إعطاء المحاضرات الوجاهية والإلكترونية المتزامنة على أربعة أيام فقط (من الأحد إلى الأربعاء). يُخصص يوم الخميس للدراسة الذاتية، إنجاز الأنشطة والواجبات الإلكترونية عبر منصة Moodle، ومراجعة المرشد الأكاديمي."
                : "Classroom and synchronous live lectures are strictly held over four days (Sunday to Wednesday). Thursday, Friday, and Saturday are lecture-free, reserved for Moodle e-activities, self-study, and academic advising consultations."}
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
