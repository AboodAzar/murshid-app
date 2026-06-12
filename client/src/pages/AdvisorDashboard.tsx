import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Users, AlertTriangle, CalendarDays, TrendingUp, Activity,
  BookOpen, Award, ChevronRight, GraduationCap, Clock, FileText,
  MessageSquare, Plus, ArrowRight, Bell, BrainCircuit, BarChart3,
  HelpCircle, FolderOpen, Sparkles, Zap, ArrowUpRight, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const severityColors: Record<string, string> = {
  low: "bg-primary/10 text-primary border-primary/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const riskConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  low: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400", label: "Low" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400", label: "Medium" },
  high: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400", label: "High" },
};

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="h-8 w-10 bg-white/10 rounded" />
        </div>
        <div className="h-11 w-11 bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
      <div className="h-9 w-9 bg-white/10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-white/10 rounded" />
        <div className="h-2 w-20 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export default function AdvisorDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: insights, isLoading: insightsLoading } = trpc.advisor.getInsights.useQuery();
  const { data: students = [], isLoading: studentsLoading } = trpc.advisor.getAssignedStudents.useQuery();
  const { data: appointments = [] } = trpc.advisor.getAppointments.useQuery();
  const { data: alerts = [] } = trpc.advisor.getAlerts.useQuery({});
  const { data: advisorAnalytics } = trpc.analytics.advisorInsights.useQuery({});

  if (!user) return null;

  const atRiskStudents = students.filter((s: any) => s.riskLevel === "high" || s.riskLevel === "medium");
  const upcomingAppts = appointments
    .filter((a: any) => new Date(a.scheduledAt) > new Date() && a.status !== "cancelled")
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);
  const recentAlerts = alerts
    .filter((alert: any, index: number, self: any[]) =>
      index === self.findIndex((a: any) => a.title === alert.title)
    )
    .slice(0, 5);

  const kpiCards = [
    {
      label: t("advisor.totalStudents"),
      value: insights?.totalStudents ?? 0,
      icon: Users,
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      accent: "border-s-2 border-s-blue-500/50",
      helper: "Assigned advisees",
    },
    {
      label: t("advisor.atRiskStudents"),
      value: insights?.atRiskCount ?? 0,
      icon: AlertTriangle,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      accent: "border-s-2 border-s-amber-500/50",
      helper: "Need attention",
    },
    {
      label: t("advisor.upcomingAppointments"),
      value: insights?.upcomingAppointments ?? 0,
      icon: CalendarDays,
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
      accent: "border-s-2 border-s-violet-500/50",
      helper: "This week",
    },
    {
      label: t("advisor.activeAlerts"),
      value: insights?.activeAlerts ?? 0,
      icon: Bell,
      iconBg: "bg-rose-500/15",
      iconColor: "text-rose-400",
      accent: "border-s-2 border-s-rose-500/50",
      helper: "Unread notifications",
    },
  ];

  const quickActions = [
    { label: t("advisor.myStudents"), icon: Users, path: "/advisor/students", color: "from-blue-600 to-blue-700" },
    { label: t("advisor.scheduleAppointment"), icon: CalendarDays, path: "/advisor/appointments", color: "from-violet-600 to-violet-700" },
    { label: t("advisor.faqs"), icon: HelpCircle, path: "/advisor/faqs", color: "from-emerald-600 to-emerald-700" },
    { label: t("advisor.documents"), icon: FolderOpen, path: "/advisor/documents", color: "from-amber-600 to-amber-700" },
    { label: t("advisor.aiReview"), icon: BrainCircuit, path: "/advisor/ai-review", color: "from-cyan-600 to-cyan-700" },
    { label: t("analytics.title"), icon: BarChart3, path: "/analytics", color: "from-slate-600 to-slate-700" },
  ];

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary/80 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Advisor Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{t("advisor.dashboard")}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm max-w-lg">
              Manage students, guidance, documents, FAQs, and AI insights from one place.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setLocation("/advisor/students")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
            >
              <Users className="w-4 h-4 me-2" />
              {t("advisor.myStudents")}
            </Button>
            <Button
              onClick={() => setLocation("/advisor/faqs")}
              variant="outline"
              className="border-border text-secondary-foreground hover:bg-accent hover:text-white"
            >
              <Plus className="w-4 h-4 me-2" />
              Add FAQ
            </Button>
            <Button
              onClick={() => setLocation("/advisor/documents")}
              variant="outline"
              className="border-border text-secondary-foreground hover:bg-accent hover:text-white"
            >
              <FileText className="w-4 h-4 me-2" />
              Upload Doc
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightsLoading
            ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
            : kpiCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <div className={`rounded-2xl border border-border bg-card p-4 sm:p-5 backdrop-blur-xl ${stat.accent} hover:bg-card/80 transition-colors`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground">{stat.helper}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Quick Actions Row */}
        <motion.div {...fadeInUp}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setLocation(action.path)}
                className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-b ${action.color} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all`}
              >
                <action.icon className="w-5 h-5 opacity-90" />
                <span className="text-xs font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Advisor Insights */}
        {advisorAnalytics && (
          <motion.div {...fadeInUp}>
            <div className="rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">AI Advisor Insights</h2>
                    <p className="text-[11px] text-muted-foreground">Cohort performance and common student issues</p>
                  </div>
                </div>
                <button
                  onClick={() => setLocation("/advisor/students")}
                  className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Target className="w-3.5 h-3.5" />
                  Select Student for Analytics
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Cohort Analysis */}
                <div className="lg:col-span-3 p-5 border-b lg:border-b-0 lg:border-e border-border">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-4">Cohort Performance by Semester</p>
                  <div className="space-y-3">
                    {advisorAnalytics.cohortAnalysis.map((c: any) => (
                      <div key={c.semester} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">Sem {c.semester}</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-400 transition-all"
                            style={{ width: `${Math.min(100, (parseFloat(c.averageGpa) / 4) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-10 text-end">{c.averageGpa}</span>
                        <span className="text-[10px] text-muted-foreground w-14 text-end">{c.studentCount} students</span>
                      </div>
                    ))}
                    {advisorAnalytics.cohortAnalysis.length === 0 && (
                      <div className="text-center py-6">
                        <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No cohort data available yet</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Common Issues */}
                <div className="lg:col-span-2 p-5">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-4">Common Issues</p>
                  <div className="space-y-3">
                    {advisorAnalytics.commonIssues.map((issue: any) => (
                      <div key={issue.issue} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-border">
                        <span className="text-xs text-slate-200 capitalize">{issue.issue.replace("_", " ")}</span>
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${issue.percentage}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-6 text-end">{issue.count}</span>
                        </div>
                      </div>
                    ))}
                    {advisorAnalytics.commonIssues.length === 0 && (
                      <div className="text-center py-6">
                        <Zap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No issues reported</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Academic Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div {...fadeInUp} className="rounded-2xl border border-border bg-card p-5 backdrop-blur-xl hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("advisor.averageGpa")}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{insights?.averageGpa ?? "0.00"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Across all advisees</p>
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeInUp} className="rounded-2xl border border-border bg-card p-5 backdrop-blur-xl hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 flex items-center justify-center">
                <Activity className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("advisor.averageAttendance")}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{insights?.averageAttendance ?? 0}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Average attendance rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* At-Risk Students */}
          <motion.div {...fadeInUp} className="lg:col-span-2 rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{t("advisor.atRiskStudents")}</h2>
                  <p className="text-[11px] text-muted-foreground">Students requiring intervention</p>
                </div>
              </div>
              <button
                onClick={() => setLocation("/advisor/students")}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {t("common.viewAll")} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
            <div className="p-5">
              {studentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
                </div>
              ) : atRiskStudents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <Award className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{t("advisor.noAtRiskStudents")}</p>
                  <p className="text-xs text-slate-600 mt-1">All students are on track</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {atRiskStudents.slice(0, 5).map((student: any) => {
                    const risk = riskConfig[student.riskLevel] || riskConfig.medium;
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-border hover:bg-accent hover:border-border cursor-pointer transition-all"
                        onClick={() => { localStorage.setItem("advisorSelectedStudentId", String(student.id)); setLocation("/advisor/student-profile"); }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-border flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-secondary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{student.name || student.email}</p>
                            <p className="text-xs text-muted-foreground">GPA {student.gpa} &middot; Attendance {student.attendanceRate}%</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg ${risk.bg} ${risk.text} border border-border`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                          {risk.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div {...fadeInUp} className="rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{t("advisor.upcomingAppointments")}</h2>
                  <p className="text-[11px] text-muted-foreground">Next 5 scheduled</p>
                </div>
              </div>
              <button
                onClick={() => setLocation("/advisor/appointments")}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {t("common.viewAll")} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
            <div className="p-5">
              {upcomingAppts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-border flex items-center justify-center mx-auto mb-3">
                    <CalendarDays className="w-7 h-7 text-slate-600" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{t("advisor.noUpcomingAppointments")}</p>
                  <p className="text-xs text-slate-600 mt-1">Schedule one from the appointments page</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingAppts.map((appt: any) => (
                    <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-border">
                      <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{appt.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(appt.scheduledAt).toLocaleString()}</p>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground bg-white/[0.04] px-2 py-1 rounded-lg border border-border whitespace-nowrap">
                        {appt.durationMinutes}m
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Alerts */}
        <motion.div {...fadeInUp}>
          <div className="rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{t("advisor.recentAlerts")}</h2>
                  <p className="text-[11px] text-muted-foreground">Latest system notifications</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-border flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7 text-slate-600" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{t("advisor.noRecentAlerts")}</p>
                  <p className="text-xs text-slate-600 mt-1">No new notifications at this time</p>
                </div>
              ) : (
                <ScrollArea className="h-[280px]">
                  <div className="space-y-2 pe-2">
                    {recentAlerts.map((alert: any) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-border hover:bg-white/[0.06] transition-colors">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${severityColors[alert.severity]} uppercase tracking-wider shrink-0 mt-0.5`}>
                          {alert.severity}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{alert.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                        </div>
                        <span className="text-[11px] text-slate-600 whitespace-nowrap">{new Date(alert.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
