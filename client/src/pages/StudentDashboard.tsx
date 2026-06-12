import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  BookOpen, Clock, MapPin, AlertTriangle, CheckCircle2, Info, Zap, Calendar,
  ChevronRight, GraduationCap, Activity, TrendingUp, Award, Bell, Flame,
  BarChart3, Layers, FileText, User, MessageSquare, Sparkles, Target, Star,
  ArrowUpRight, ArrowDownRight, Lightbulb, Download, ExternalLink, CalendarDays,
  BrainCircuit, ShieldAlert,
} from "lucide-react";

/* ── Animation presets ── */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } };
const cardHover = { rest: { scale: 1 }, hover: { scale: 1.01, transition: { duration: 0.3 } } };

/* ── Course color palette ── */
const COURSE_PALETTE = [
  { bg: "from-blue-600/20 to-cyan-600/20", bar: "from-blue-500 to-cyan-400", glow: "glow-blue", icon: "bg-blue-500" },
  { bg: "from-violet-600/20 to-purple-600/20", bar: "from-violet-500 to-purple-400", glow: "glow-purple", icon: "bg-violet-500" },
  { bg: "from-emerald-600/20 to-teal-600/20", bar: "from-emerald-500 to-teal-400", glow: "glow-emerald", icon: "bg-emerald-500" },
  { bg: "from-amber-600/20 to-orange-600/20", bar: "from-amber-500 to-orange-400", glow: "glow-amber", icon: "bg-amber-500" },
  { bg: "from-rose-600/20 to-pink-600/20", bar: "from-rose-500 to-pink-400", glow: "", icon: "bg-rose-500" },
];
function courseColor(i: number) { return COURSE_PALETTE[i % COURSE_PALETTE.length]; }

/* ── Small helpers ── */
function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, string> = {
    upcoming: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    ongoing: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse-slow",
    completed: "bg-slate-500/15 text-muted-foreground border-slate-500/30",
    present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    absent: "bg-red-500/15 text-red-400 border-red-500/30",
    excused: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    late: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    planned: "bg-slate-500/15 text-muted-foreground border-slate-500/30",
    submitted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    graded: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    overdue: "bg-red-500/15 text-red-400 border-red-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
  const style = map[status] || map.planned;
  const label = t(`student.${status}`) || status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style}`}>
      {status === "ongoing" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
      {label}
    </span>
  );
}

function CountdownTimer({ minutes, t }: { minutes: number; t: (k: string) => string }) {
  const [remaining, setRemaining] = useState(minutes);
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => { setRemaining(p => { if (p <= 1) { clearInterval(id); return 0; } return p - 1; }); }, 60000);
    return () => clearInterval(id);
  }, [remaining]);
  const hrs = Math.floor(remaining / 60), mins = remaining % 60;
  if (remaining <= 0) return <span className="text-emerald-400 text-xs font-bold">{t("student.live")}</span>;
  return (
    <span className="text-amber-400 text-xs font-bold">
      {t("student.startsIn")} {hrs > 0 ? `${hrs}${t("student.hours")} ` : ""}{mins}{t("student.minutes")}
    </span>
  );
}

function HealthRing({ score, t }: { score: number; t: (k: string) => string }) {
  const r = 32, c = 2 * Math.PI * r, off = c - (score / 100) * c;
  let color = "#10b981", label = t("student.excellent");
  if (score < 60) { color = "#ef4444"; label = t("student.critical"); }
  else if (score < 75) { color = "#f59e0b"; label = t("student.needsAttention"); }
  else if (score < 90) { color = "#3b82f6"; label = t("student.good"); }
  return (
    <div className="relative flex items-center justify-center">
      <svg width="78" height="78" className="-rotate-90">
        <circle cx="39" cy="39" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle cx="39" cy="39" r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

function AlertIcon({ type }: { type: string }) {
  if (type === "danger") return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />;
  if (type === "warning") return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
  if (type === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
}

function AlertBorder(type: string) {
  const map: Record<string, string> = { danger: "border-red-500/25 bg-red-500/5", warning: "border-amber-500/25 bg-amber-500/5", success: "border-emerald-500/25 bg-emerald-500/5", info: "border-blue-500/25 bg-blue-500/5" };
  return map[type] || map.info;
}

/* ── Chart helpers ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-strong rounded-lg px-3 py-2 border border-border">
      <p className="text-xs text-muted-foreground">Semester {label}</p>
      <p className="text-sm font-bold text-white">GPA {payload[0].value}</p>
    </div>
  );
}

/* ── Achievement icon mapper ── */
function AchievementIcon({ icon }: { icon: string }) {
  const props = { className: "w-4 h-4" };
  if (icon === "BookOpen") return <BookOpen {...props} />;
  if (icon === "CheckCircle2") return <CheckCircle2 {...props} />;
  if (icon === "Award") return <Award {...props} />;
  if (icon === "TrendingUp") return <TrendingUp {...props} />;
  if (icon === "GraduationCap") return <GraduationCap {...props} />;
  return <Star {...props} />;
}

/* ── Minimal empty defaults ── */
const EMPTY_ALERTS: { healthScore: number; alerts: any[]; summary: { totalCourses: number; lowAttendanceCount: number; overdueCount: number; upcomingCount: number } } = { healthScore: 100, alerts: [], summary: { totalCourses: 0, lowAttendanceCount: 0, overdueCount: 0, upcomingCount: 0 } };
const EMPTY_STATS = { gpa: "0.00", earnedCredits: 0, totalCredits: 0, currentSemester: 0, progress: 0, semestersLeft: 0 };
const EMPTY_STREAK = { current: 0, best: 0 };
const EMPTY_ACHIEVEMENTS: any[] = [];
const EMPTY_ACTIVITY: any[] = [];
const EMPTY_GPA_HISTORY: any[] = [];

/* ── Main component ── */
export default function StudentDashboard() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    if (user?.name) setUserName(user.name);
    else { const s = localStorage.getItem("userName"); if (s) setUserName(s); }
  }, [user]);

  const advisorStudentId = user?.role === "advisor" ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined : undefined;

  const { data: dashboard, isLoading: dashL } = trpc.student.dashboard.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: myCourses = [], isLoading: coursesL } = trpc.student.myCourses.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: schedule = [], isLoading: schedL } = trpc.student.todaySchedule.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: alertsRaw, isLoading: alertsL } = trpc.student.academicAlerts.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const alertsData = (Array.isArray(alertsRaw) ? EMPTY_ALERTS : alertsRaw) as typeof EMPTY_ALERTS;
  const { data: overview, isLoading: overviewL } = trpc.student.overview.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: announcements = [] } = trpc.announcements.list.useQuery();
  const { data: risk } = trpc.analytics.graduationRisk.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: health } = trpc.analytics.academicHealth.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: warnings } = trpc.analytics.earlyWarnings.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const { data: career } = trpc.analytics.careerPaths.useQuery(advisorStudentId ? { studentId: advisorStudentId } : undefined);
  const utils = trpc.useUtils();
  const seedMutation = trpc.student.seed.useMutation({
    onSuccess: () => {
      utils.student.dashboard.invalidate();
      utils.student.myCourses.invalidate();
      utils.student.todaySchedule.invalidate();
      utils.student.academicAlerts.invalidate();
      utils.student.overview.invalidate();
      utils.announcements.list.invalidate();
    },
  });

  // Auto-seed demo data if student has no courses or study plan
  useEffect(() => {
    if (!dashL && !coursesL && myCourses.length === 0 && !dashboard?.studyPlan) {
      seedMutation.mutate();
    }
  }, [dashL, coursesL, myCourses.length, dashboard?.studyPlan, seedMutation]);

  const activeCourses = useMemo(() => {
    const real = myCourses.filter(c => c.status === "in_progress").slice(0, 5);
    return real.length ? real : [];
  }, [myCourses]);
  const scheduleFallback = useMemo(() => schedule.length ? schedule : [], [schedule]);
  const nextUpcoming = useMemo(() => scheduleFallback.find(s => s.status === "upcoming"), [scheduleFallback]);
  const currentLecture = useMemo(() => scheduleFallback.find(s => s.status === "ongoing"), [scheduleFallback]);

  const gpaData = useMemo(() => {
    const real = overview?.gpaHistory?.map(g => ({ semester: `S${g.semester}`, gpa: g.gpa })) || [];
    return real.length ? real : EMPTY_GPA_HISTORY.map((g: any) => ({ semester: `S${g.semester}`, gpa: g.gpa }));
  }, [overview]);
  const creditsPie = useMemo(() => {
    const stats = dashboard?.stats ?? EMPTY_STATS;
    const earned = stats.earnedCredits;
    const total = stats.totalCredits || 1;
    return [
      { name: "Earned", value: earned, color: "#3b82f6" },
      { name: "Remaining", value: Math.max(0, total - earned), color: "rgba(255,255,255,0.08)" },
    ];
  }, [dashboard]);

  const uniqueAlerts = useMemo(() => {
    const all = (alertsData ?? EMPTY_ALERTS).alerts;
    return all.filter((alert: any, index: number, self: any[]) =>
      index === self.findIndex((a: any) => a.title === alert.title)
    );
  }, [alertsData]);

  const uniqueActivity = useMemo(() => {
    const all = (overview?.recentActivity ?? EMPTY_ACTIVITY);
    return all.filter((act: any, index: number, self: any[]) =>
      index === self.findIndex((a: any) => a.id === act.id)
    );
  }, [overview?.recentActivity]);

  const gradientText = "bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent";

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10" dir={dir}>
        {/* ===== Header ===== */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className={`text-3xl sm:text-4xl font-bold ${gradientText}`}>{t("student.dashboard")}</h1>
            <p className="text-muted-foreground text-base">{t("common.welcome")}, {userName}</p>
          </div>
          <div className="flex items-center gap-3">
            {(!alertsL || (alertsData ?? EMPTY_ALERTS)) && (
              <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-3 border border-border">
                <HealthRing score={(alertsData ?? EMPTY_ALERTS).healthScore} t={t} />
                <div className="hidden sm:block">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("student.academicHealthScore")}</p>
                  <p className={`text-sm font-bold ${(alertsData ?? EMPTY_ALERTS).healthScore >= 75 ? "text-emerald-400" : (alertsData ?? EMPTY_ALERTS).healthScore >= 60 ? "text-amber-400" : "text-red-400"}`}>
                    {(alertsData ?? EMPTY_ALERTS).healthScore >= 90 ? t("student.excellent") : (alertsData ?? EMPTY_ALERTS).healthScore >= 75 ? t("student.good") : (alertsData ?? EMPTY_ALERTS).healthScore >= 60 ? t("student.needsAttention") : t("student.critical")}
                  </p>
                </div>
              </div>
            )}
            <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2 border border-border">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-secondary-foreground">{new Date().toLocaleDateString(dir === "rtl" ? "ar-SA" : "en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
          </div>
        </motion.div>

        {/* ===== AI Analytics Summary ===== */}
        {(risk || health || warnings) && (
          <motion.div initial="initial" animate="animate" variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {risk && (
              <div className="glass-card rounded-2xl p-4 border border-border hover:border-red-500/20 transition-colors cursor-pointer" onClick={() => setLocation("/analytics")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-semibold text-white">Graduation Risk</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${risk.overallRisk === "low" ? "bg-emerald-500/15 text-emerald-400" : risk.overallRisk === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>{risk.overallRisk}</span>
                </div>
                <p className="text-2xl font-bold text-white">{risk.score}<span className="text-sm text-muted-foreground">/100</span></p>
                <p className="text-[10px] text-muted-foreground mt-1">Est. graduation: Semester {risk.predictedGraduationSemester}</p>
              </div>
            )}
            {health && (
              <div className="glass-card rounded-2xl p-4 border border-border hover:border-violet-500/20 transition-colors cursor-pointer" onClick={() => setLocation("/analytics")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-semibold text-white">Health Score</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${health.overallScore >= 70 ? "bg-emerald-500/15 text-emerald-400" : health.overallScore >= 50 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>{health.overallScore >= 70 ? "Good" : health.overallScore >= 50 ? "Fair" : "Poor"}</span>
                </div>
                <p className="text-2xl font-bold text-white">{health.overallScore}<span className="text-sm text-muted-foreground">/100</span></p>
                <p className="text-[10px] text-muted-foreground mt-1">Trend: <span className={health.trend === "improving" ? "text-emerald-400" : health.trend === "declining" ? "text-red-400" : "text-amber-400"}>{health.trend}</span></p>
              </div>
            )}
            {warnings && warnings.warnings.length > 0 && (
              <div className="glass-card rounded-2xl p-4 border border-border hover:border-amber-500/20 transition-colors cursor-pointer" onClick={() => setLocation("/analytics")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-white">Warnings</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/15 text-amber-400">{warnings.warnings.length} active</span>
                </div>
                <p className="text-sm text-secondary-foreground line-clamp-2">{warnings.warnings[0].message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{warnings.warnings[0].title}</p>
              </div>
            )}
            {warnings && warnings.warnings.length === 0 && (
              <div className="glass-card rounded-2xl p-4 border border-border hover:border-emerald-500/20 transition-colors cursor-pointer" onClick={() => setLocation("/analytics")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Warnings</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/15 text-emerald-400">All Clear</span>
                </div>
                <p className="text-sm text-secondary-foreground">No early warnings detected.</p>
                <p className="text-[10px] text-muted-foreground mt-1">Keep up the great work!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== Stats Row ===== */}
        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("student.gpa"), value: (dashboard?.stats ?? EMPTY_STATS).gpa, icon: Award, grad: "from-blue-500 to-cyan-500", glow: "glow-blue", trend: null as any },
            { label: t("student.completedHours"), value: String((dashboard?.stats ?? EMPTY_STATS).earnedCredits), icon: GraduationCap, grad: "from-violet-500 to-purple-500", glow: "glow-purple", trend: { up: true, val: "+12%" } },
            { label: t("student.totalHours"), value: String((dashboard?.stats ?? EMPTY_STATS).totalCredits), icon: TrendingUp, grad: "from-emerald-500 to-teal-500", glow: "glow-emerald", trend: null },
            { label: t("student.currentSemester"), value: String((dashboard?.stats ?? EMPTY_STATS).currentSemester), icon: Calendar, grad: "from-amber-500 to-orange-500", glow: "glow-amber", trend: null },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} variants={fadeInUp} whileHover="hover" initial="rest">
                <motion.div variants={cardHover} className={`glass-card-strong rounded-2xl p-4 sm:p-5 ${s.glow} hover:border-white/20 transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {s.trend && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${s.trend.up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {s.trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.trend.val}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{s.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ===== Main Grid ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN (7 cols) ── */}
          <div className="xl:col-span-7 space-y-6">

            {/* My Courses */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t("student.myCourses")}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50">{activeCourses.length} {t("student.courses")}</span>
                  <button onClick={() => setLocation("/courses")} className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 ms-auto">
                    {t("student.viewAll")} <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {coursesL ? (
                  [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl bg-slate-800/50" />)
                ) : activeCourses.length === 0 ? (
                  <div className="md:col-span-2 glass-card rounded-2xl p-8 text-center">
                    <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">{t("student.noActiveCourses")}</p>
                    <p className="text-muted-foreground text-xs mt-1">{t("student.enrollToGetStarted")}</p>
                  </div>
                ) : (
                  activeCourses.map((course, i) => {
                    const theme = courseColor(i);
                    return (
                      <motion.div key={course.id} variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.25 } }} className="glass-card gradient-border rounded-2xl p-4 hover:bg-slate-800/80 transition-all duration-300 card-hover-lift group">
                        <div className="flex justify-between items-start mb-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{course.name}</p>
                            <p className="text-[11px] text-muted-foreground">{course.code}</p>
                          </div>
                          <StatusBadge status={course.status} t={t} />
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-[11px] text-muted-foreground">
                          <User className="w-3 h-3" /> {course.instructorName}
                          <span className="mx-1">·</span>
                          <span>{course.credits} {t("student.credits")}</span>
                          <span className="mx-1">·</span>
                          <span className={`font-semibold ${typeof course.currentGrade === "string" && course.currentGrade !== "—" ? "text-blue-400" : "text-muted-foreground"}`}>{t("student.currentGrade")}: {course.currentGrade}</span>
                        </div>
                        {/* Attendance */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">{t("student.attendance")}</span>
                            <span className={`font-bold ${course.attendance >= 85 ? "text-emerald-400" : course.attendance >= 75 ? "text-amber-400" : "text-red-400"}`}>{course.attendance}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${course.attendance}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className={`h-full rounded-full bg-gradient-to-r ${theme.bar}`} />
                          </div>
                        </div>
                        {/* Progress */}
                        <div className="space-y-1.5 mt-2">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-muted-foreground">{t("student.progress")}</span>
                            <span className="text-white font-bold">{course.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden progress-shine">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }} className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground">{course.completedAssignments}/{course.totalAssignments} {t("student.completed")}</span>
                          <button onClick={() => setLocation(`/courses/${course.courseId}`)} className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {t("student.viewDetails")} <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Upcoming Assignments */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t("student.upcomingAssignments")}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50">{(overview?.upcomingAssignments ?? []).length} {t("student.pending")}</span>
                  <button onClick={() => setLocation("/assignments")} className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 ms-auto">
                    {t("student.viewAll")} <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </motion.div>

              <div className="space-y-2">
                {overviewL ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-slate-800/50" />)
                ) : (
                  (overview?.upcomingAssignments ?? []).slice(0, 5).map((a, i) => (
                    <motion.div key={a.id} variants={fadeInUp} whileHover={{ x: dir === "rtl" ? -3 : 3, transition: { duration: 0.2 } }} className="glass-card rounded-xl p-3.5 border border-border hover:border-border transition-all duration-300 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${a.daysLeft <= 1 ? "bg-red-500/15" : a.daysLeft <= 3 ? "bg-amber-500/15" : "bg-blue-500/15"}`}>
                        <FileText className={`w-4 h-4 ${a.daysLeft <= 1 ? "text-red-400" : a.daysLeft <= 3 ? "text-amber-400" : "text-blue-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{a.title}</p>
                        <p className="text-[11px] text-muted-foreground">{a.courseCode} · {a.courseName}</p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className={`text-xs font-bold ${a.daysLeft <= 1 ? "text-red-400" : a.daysLeft <= 3 ? "text-amber-400" : "text-blue-400"}`}>{a.daysLeft}d</p>
                        <p className="text-[10px] text-muted-foreground">{t("student.dueIn")}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* GPA Trend Chart + Credits */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GPA Trend */}
              <motion.div variants={fadeInUp} className="glass-card-strong rounded-2xl p-4 sm:p-5 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white">{t("student.gpaTrend")}</h3>
                </div>
                {overviewL || !gpaData.length ? (
                  <div className="h-40 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">{overviewL ? "" : t("common.noResults")}</p>
                  </div>
                ) : (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={gpaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gpaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="semester" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 4]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="gpa" stroke="#8b5cf6" strokeWidth={2} fill="url(#gpaFill)" dot={{ r: 3, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 1 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>

              {/* Credits Progress */}
              <motion.div variants={fadeInUp} className="glass-card-strong rounded-2xl p-4 sm:p-5 border border-border flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">{t("student.creditsProgress")}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="relative w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={creditsPie} cx="50%" cy="50%" innerRadius={45} outerRadius={60} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                          {creditsPie.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">{dashboard?.stats.progress ?? 0}%</span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("common.complete")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border">
                  <span>{t("student.earnedCredits")}: <strong className="text-blue-400">{dashboard?.stats.earnedCredits ?? 0}</strong></span>
                  <span>{t("student.remainingCredits")}: <strong className="text-secondary-foreground">{Math.max(0, (dashboard?.stats.totalCredits ?? 0) - (dashboard?.stats.earnedCredits ?? 0))}</strong></span>
                </div>
              </motion.div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
              <motion.div variants={fadeInUp} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t("student.recentActivity")}</h2>
                </div>
              </motion.div>
              <div className="glass-card rounded-2xl p-4 border border-border max-h-72 overflow-y-auto scrollbar-thin space-y-3">
                {overviewL ? (
                  [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-lg bg-slate-800/50" />)
                ) : (
                  uniqueActivity.map((act) => (
                    <div key={act.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        act.type === "attendance" ? (act.status === "present" ? "bg-emerald-500/15" : act.status === "absent" ? "bg-red-500/15" : "bg-amber-500/15") : "bg-blue-500/15"
                      }`}>
                        {act.type === "attendance" ? (
                          act.status === "present" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
                          act.status === "absent" ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> :
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">
                          {act.type === "attendance" ? `${t(`student.${act.status}`)} ${t("student.attendance")}` : `${t("student.submitted")}: ${act.title}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{act.type === "submission" && act.courseName ? act.courseName : ""} · {new Date(act.date).toLocaleDateString()}</p>
                      </div>
                      {act.type === "submission" && act.score != null && (
                        <span className="text-xs font-bold text-emerald-400">{act.score}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN (5 cols) ── */}
          <div className="xl:col-span-5 space-y-6">

            {/* Today's Schedule */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t("student.todaySchedule")}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {nextUpcoming && <CountdownTimer minutes={nextUpcoming.countdownMinutes} t={t} />}
                  <button onClick={() => setLocation("/schedule")} className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 ms-auto">
                    {t("student.viewFull")} <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </motion.div>

              {/* Featured lecture card */}
              {(nextUpcoming || currentLecture) && (
                <motion.div variants={fadeInUp} className="glass-card-strong rounded-2xl p-4 sm:p-5 glow-emerald border border-emerald-500/20 relative overflow-hidden">
                  <div className="absolute top-0 end-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{currentLecture ? t("student.live") : t("student.nextUp")}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{(currentLecture || nextUpcoming)?.courseName}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{(currentLecture || nextUpcoming)?.courseCode}</p>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><User className="w-3 h-3" /> {(currentLecture || nextUpcoming)?.lecturerName}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-secondary-foreground">
                      <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50"><Clock className="w-3 h-3 text-muted-foreground" /> {(currentLecture || nextUpcoming)?.startTime} - {(currentLecture || nextUpcoming)?.endTime}</span>
                      <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50"><MapPin className="w-3 h-3 text-muted-foreground" /> {(currentLecture || nextUpcoming)?.buildingName} · {(currentLecture || nextUpcoming)?.roomNumber}</span>
                      <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50"><BarChart3 className="w-3 h-3 text-muted-foreground" /> {t("student.floor")} {(currentLecture || nextUpcoming)?.floor}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                {schedL ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl bg-slate-800/50" />)
                ) : scheduleFallback.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">{t("student.noLecturesToday")}</p>
                  </div>
                ) : (
                  scheduleFallback.map((lec, i) => {
                    const isNext = lec.status === "upcoming" && !scheduleFallback.slice(0, i).some(s => s.status === "upcoming");
                    return (
                      <motion.div key={lec.id} variants={fadeInUp} whileHover={{ x: dir === "rtl" ? -4 : 4, transition: { duration: 0.2 } }} className={`glass-card rounded-xl p-4 transition-all duration-300 ${lec.status === "ongoing" ? "border-emerald-500/30 glow-emerald" : isNext ? "border-amber-500/20" : "border-border hover:border-border"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`shrink-0 w-14 text-center py-2 rounded-lg ${lec.status === "ongoing" ? "bg-emerald-500/15" : lec.status === "upcoming" ? "bg-amber-500/10" : "bg-slate-700/40"}`}>
                            <p className="text-xs font-bold text-white">{lec.startTime}</p>
                            <p className="text-[9px] text-muted-foreground">{lec.endTime}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-white truncate">{lec.courseName}</p>
                              <StatusBadge status={lec.status} t={t} />
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lec.buildingName}</span>
                              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {lec.roomNumber}</span>
                              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {lec.lecturerName}</span>
                            </div>
                          </div>
                          {isNext && <Flame className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* AI Academic Alerts */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
              <motion.div variants={fadeInUp} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t("student.aiAlerts")}</h2>
                </div>
              </motion.div>

              {/* Summary pills */}
              {(!alertsL || (alertsData ?? EMPTY_ALERTS)) && (
                <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-2">
                  {[
                    { count: (alertsData ?? EMPTY_ALERTS).summary.lowAttendanceCount, label: t("student.lowAttendance"), color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                    { count: (alertsData ?? EMPTY_ALERTS).summary.overdueCount, label: t("student.overdueAssignments"), color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                    { count: (alertsData ?? EMPTY_ALERTS).summary.upcomingCount, label: t("student.deadlines"), color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                  ].map((pill, i) => (
                    <div key={i} className={`${pill.bg} rounded-xl p-3 text-center border ${pill.border}`}>
                      <p className={`text-xl font-bold ${pill.color}`}>{pill.count}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight mt-1">{pill.label}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Alerts list */}
              <div className="space-y-2">
                {alertsL ? (
                  [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-slate-800/50" />)
                ) : (
                  <ScrollArea className="h-[320px]">
                    <div className="space-y-2 pe-2">
                      <AnimatePresence>
                        {uniqueAlerts.map((alert) => (
                          <motion.div key={alert.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className={`glass-card rounded-xl p-4 border ${AlertBorder(alert.type)} hover:border-white/15 transition-all duration-300`}>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5"><AlertIcon type={alert.type} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white leading-tight">{dir === "rtl" && alert.titleAr ? alert.titleAr : alert.title}</p>
                                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{dir === "rtl" && alert.messageAr ? alert.messageAr : alert.message}</p>
                                {alert.action && (
                                  <button className="mt-2 text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
                                    {dir === "rtl" && alert.actionAr ? alert.actionAr : alert.action} <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                )}
              </div>
            </motion.div>

            {/* Study Streak */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer}>
              <motion.div variants={fadeInUp} className="glass-card-strong rounded-2xl p-4 sm:p-5 border border-orange-500/10 glow-amber">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <h3 className="text-sm font-bold text-white">{t("student.studyStreak")}</h3>
                  </div>
                  {(!overviewL || (overview ?? { streak: { current: 7, best: 14 } })) && (
                    <span className="text-xs text-muted-foreground">{t("student.bestStreak")}: <strong className="text-orange-400">{(overview ?? { streak: { current: 7, best: 14 } }).streak.best}</strong></span>
                  )}
                </div>
                {overviewL ? (
                  <Skeleton className="h-14 rounded-xl bg-slate-800/50" />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">{(overview ?? { streak: { current: 7, best: 14 } }).streak.current}</span>
                      </div>
                      <div className="absolute -top-1 -end-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{(overview ?? { streak: { current: 7, best: 14 } }).streak.current} {t("student.days")}</p>
                      <p className="text-xs text-muted-foreground">{t("student.currentStreak")}</p>
                    </div>
                    <div className="ms-auto flex gap-1">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className={`w-3 h-8 rounded-full ${i < (overview ?? { streak: { current: 7, best: 14 } }).streak.current ? "bg-gradient-to-t from-orange-500 to-amber-400" : "bg-slate-700/50"}`} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* Achievement Badges */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t("student.achievements")}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50">
                    {(overview?.achievements ?? EMPTY_ACHIEVEMENTS).filter(a => a.unlocked).length}/{(overview?.achievements ?? EMPTY_ACHIEVEMENTS).length}
                  </span>
                  <button onClick={() => setLocation("/achievements")} className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 ms-auto">
                    {t("student.viewAll")} <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </motion.div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {overviewL ? (
                  [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-slate-800/50" />)
                ) : (
                  (overview?.achievements ?? EMPTY_ACHIEVEMENTS).map((ach) => (
                    <motion.div key={ach.id} variants={fadeInUp} whileHover={{ y: -3, transition: { duration: 0.2 } }} className={`glass-card rounded-xl p-3 text-center border transition-all duration-300 ${ach.unlocked ? "border-amber-500/20 achievement-glow" : "border-border opacity-60"}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${ach.unlocked ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-slate-700/50"}`}>
                        <AchievementIcon icon={ach.icon} />
                      </div>
                      <p className={`text-[11px] font-semibold truncate ${ach.unlocked ? "text-white" : "text-muted-foreground"}`}>{ach.title}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{ach.description}</p>
                      {ach.unlocked && <p className="text-[9px] text-amber-400 mt-1">{t("student.achievementUnlocked")}</p>}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
              <motion.div variants={fadeInUp} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">{t("student.quickActions")}</h2>
              </motion.div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: t("student.aiAssistant"), icon: MessageSquare, color: "from-blue-500 to-cyan-500", path: "/chat" },
                  { label: t("student.studyPlan"), icon: Target, color: "from-violet-500 to-purple-500", path: "/study-plan" },
                  { label: t("student.contactAdvisor"), icon: User, color: "from-emerald-500 to-teal-500", path: "/chat" },
                  { label: t("student.viewMaterials"), icon: Download, color: "from-amber-500 to-orange-500", path: "/courses" },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button key={i} onClick={() => setLocation(action.path)} variants={fadeInUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`glass-card rounded-xl p-3 border border-border hover:border-white/15 transition-all duration-300 flex items-center gap-3 text-start`}>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-white">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Announcements */}
            {announcements.length > 0 && (
              <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4">
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">{t("student.announcements")}</h2>
                  </div>
                  <button onClick={() => setLocation("/announcements")} className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 self-start sm:self-auto">
                    {t("student.viewAll")} <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </motion.div>
                <div className="glass-card rounded-2xl p-4 border border-border space-y-2">
                  {announcements.slice(0, 3).map(a => (
                    <div key={a.id} className="p-2.5 bg-slate-800/40 rounded-lg border-s-2 border-cyan-500/50 hover:bg-slate-800/60 transition-colors">
                      <p className="text-xs font-medium text-slate-200 truncate">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{a.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ===== Advisor Communications ===== */}
        {(dashboard?.advisorAlerts?.length || dashboard?.advisorRecommendations?.length || dashboard?.advisorAppointments?.length) ? (
          <motion.div initial="initial" animate="animate" variants={fadeInUp} className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              {t("advisor.fromYourAdvisor") || "From Your Advisor"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alerts */}
              {dashboard?.advisorAlerts && dashboard.advisorAlerts.length > 0 && (
                <div className="glass-card rounded-2xl p-4 border border-rose-500/10">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-400" />{t("advisor.alerts")}</h3>
                  <div className="space-y-2">
                    {dashboard.advisorAlerts.map((alert: any) => (
                      <div key={alert.id} className="p-2.5 bg-rose-500/5 rounded-lg border border-rose-500/10">
                        <p className="text-xs font-medium text-rose-300">{alert.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Recommendations */}
              {dashboard?.advisorRecommendations && dashboard.advisorRecommendations.length > 0 && (
                <div className="glass-card rounded-2xl p-4 border border-emerald-500/10">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" />{t("advisor.recommendations")}</h3>
                  <div className="space-y-2">
                    {dashboard.advisorRecommendations.map((rec: any) => (
                      <div key={rec.id} className="p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        <p className="text-xs font-medium text-emerald-300">{rec.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Appointments */}
              {dashboard?.advisorAppointments && dashboard.advisorAppointments.length > 0 && (
                <div className="glass-card rounded-2xl p-4 border border-violet-500/10">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-violet-400" />{t("advisor.appointments")}</h3>
                  <div className="space-y-2">
                    {dashboard.advisorAppointments.map((appt: any) => (
                      <div key={appt.id} className="p-2.5 bg-violet-500/5 rounded-lg border border-violet-500/10">
                        <p className="text-xs font-medium text-violet-300">{appt.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(appt.scheduledAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}

        {/* ===== Graduation Progress ===== */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="glass-card-strong rounded-2xl p-6 glow-blue border border-blue-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{t("student.graduationProgress")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{(dashboard?.stats ?? EMPTY_STATS).earnedCredits} / {(dashboard?.stats ?? EMPTY_STATS).totalCredits} {t("student.completedHours")}</p>
            </div>
            <div className="text-end">
              <p className="text-2xl font-bold text-blue-400">{(dashboard?.stats ?? EMPTY_STATS).progress}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("common.complete")}</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-slate-700/50 overflow-hidden progress-shine">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(dashboard?.stats ?? EMPTY_STATS).progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xl font-bold text-secondary-foreground">{(dashboard?.stats ?? EMPTY_STATS).semestersLeft}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("student.semestersLeft")}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-400">{(dashboard?.stats ?? EMPTY_STATS).gpa}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("student.currentGPA")}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-violet-400">{activeCourses.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("student.currentCourses")}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-400">{(overview?.achievements ?? EMPTY_ACHIEVEMENTS).filter(a => a.unlocked).length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("student.achievements")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
