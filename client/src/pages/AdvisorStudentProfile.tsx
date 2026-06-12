import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft, GraduationCap, Mail, BookOpen, Award, Activity,
  AlertTriangle, FileText, CalendarDays, TrendingUp, Target,
  ChevronRight, Plus, CheckCircle2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const fadeInUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };
const severityColors: Record<string, string> = {
  low: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function AdvisorStudentProfile() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const studentId = Number(localStorage.getItem("advisorSelectedStudentId") || 0);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showApptForm, setShowApptForm] = useState(false);
  const [alertForm, setAlertForm] = useState({ title: "", message: "", severity: "medium" as any, type: "custom" as any });
  const [noteForm, setNoteForm] = useState({ title: "", content: "", category: "general" as any, isPrivate: false });
  const [apptForm, setApptForm] = useState({ title: "", description: "", scheduledAt: "", durationMinutes: 30, location: "" });

  const { data: profile, isLoading } = trpc.advisor.getStudentProfile.useQuery({ studentId }, { enabled: !!studentId });
  const { data: alerts = [] } = trpc.advisor.getAlerts.useQuery({ studentId }, { enabled: !!studentId });
  const { data: notes = [] } = trpc.advisor.getNotes.useQuery({ studentId }, { enabled: !!studentId });
  const { data: appointments = [] } = trpc.advisor.getAppointments.useQuery({ studentId }, { enabled: !!studentId });
  const { data: recommendations = [] } = trpc.advisor.getRecommendations.useQuery({ studentId }, { enabled: !!studentId });
  const utils = trpc.useUtils();

  const createAlert = trpc.advisor.createAlert.useMutation({ onSuccess: () => { utils.advisor.getAlerts.invalidate({ studentId }); setShowAlertForm(false); } });
  const resolveAlert = trpc.advisor.resolveAlert.useMutation({ onSuccess: () => utils.advisor.getAlerts.invalidate({ studentId }) });
  const addNote = trpc.advisor.addNote.useMutation({ onSuccess: () => { utils.advisor.getNotes.invalidate({ studentId }); setShowNoteForm(false); } });
  const scheduleAppt = trpc.advisor.scheduleAppointment.useMutation({ onSuccess: () => { utils.advisor.getAppointments.invalidate({ studentId }); setShowApptForm(false); } });

  const uniqueCourses = useMemo(() => {
    const all = profile?.courses ?? [];
    return all.filter((c: any, index: number, self: any[]) =>
      index === self.findIndex((x: any) => x.courseId === c.courseId)
    );
  }, [profile?.courses]);
  const createRec = trpc.advisor.createRecommendation.useMutation({ onSuccess: () => utils.advisor.getRecommendations.invalidate({ studentId }) });

  if (!user) return null;
  if (!studentId) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p className="text-slate-400">{t("advisor.selectStudentFirst")}</p>
          <Button onClick={() => setLocation("/advisor/students")} className="mt-4 bg-blue-600 hover:bg-blue-700">{t("advisor.myStudents")}</Button>
        </div>
      </DashboardLayout>
    );
  }

  const s = profile?.student;
  const stats = profile?.stats;

  const tabs = [
    { key: "overview", label: t("advisor.overview"), icon: Activity },
    { key: "alerts", label: t("advisor.alerts"), icon: AlertTriangle },
    { key: "notes", label: t("advisor.notes"), icon: FileText },
    { key: "appointments", label: t("advisor.appointments"), icon: CalendarDays },
    { key: "recommendations", label: t("advisor.recommendations"), icon: Target },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp} className="flex items-center gap-4">
          <button onClick={() => setLocation("/advisor/students")} className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] text-slate-300">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-400" />
              {s?.name || t("advisor.studentProfile")}
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> {s?.email}
              {profile?.department && <span className="text-slate-500">• {profile.department.name}</span>}
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t("student.gpa"), value: stats?.gpa ?? "0.00", icon: Award, color: "text-emerald-400 bg-emerald-500/15" },
            { label: t("student.creditsEarned"), value: stats?.earnedCredits ?? 0, icon: BookOpen, color: "text-blue-400 bg-blue-500/15" },
            { label: t("student.attendance"), value: `${stats?.attendanceRate ?? 0}%`, icon: Activity, color: "text-sky-400 bg-sky-500/15" },
            { label: t("advisor.activeAlerts"), value: stats?.activeAlerts ?? 0, icon: AlertTriangle, color: "text-rose-400 bg-rose-500/15" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
                <span className="text-xs text-slate-400">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.07]"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400" />{t("student.myCourses")}</h3>
                {uniqueCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uniqueCourses.map((c: any) => (
                      <div key={c.id ?? `${c.courseId}-${c.semester}`} className="p-3 rounded-xl bg-white/[0.04] flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{c.course?.name || c.course?.code}</p>
                          <p className="text-xs text-slate-400">{c.course?.code} • {c.semester}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${c.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : c.status === "in_progress" ? "bg-blue-500/15 text-blue-400" : "bg-slate-500/15 text-slate-400"}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 text-center py-4">{t("student.noCoursesYet")}</p>}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" />{t("advisor.recommendations")}</h3>
                {recommendations.length > 0 ? (
                  <div className="space-y-2">
                    {recommendations.slice(0, 3).map((r: any) => (
                      <div key={r.id} className="p-3 rounded-xl bg-white/[0.04] flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{r.title}</p>
                          <p className="text-xs text-slate-400">{r.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${r.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 text-center py-4">{t("advisor.noRecommendations")}</p>}
              </div>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{t("advisor.academicAlerts")}</h3>
                <Button onClick={() => setShowAlertForm(true)} size="sm" className="bg-rose-600 hover:bg-rose-700"><Plus className="w-4 h-4 me-1" />{t("advisor.createAlert")}</Button>
              </div>
              {(() => {
                const uniqueAlerts = alerts.filter((alert: any, index: number, self: any[]) =>
                  index === self.findIndex((a: any) => a.title === alert.title)
                );
                return uniqueAlerts.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">{t("advisor.noAlerts")}</p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pe-2">
                      {uniqueAlerts.map((alert: any) => (
                        <div key={alert.id} className={`p-4 rounded-xl border bg-white/[0.04] ${alert.isResolved ? "opacity-60" : ""}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${severityColors[alert.severity]}`}>{alert.severity}</span>
                              <span className="text-xs text-slate-500">{alert.type}</span>
                            </div>
                            {!alert.isResolved && (
                              <button onClick={() => resolveAlert.mutate({ alertId: alert.id })} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />{t("common.resolve")}
                              </button>
                            )}
                          </div>
                          <p className="text-sm font-medium text-white mt-2">{alert.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
                          <p className="text-xs text-slate-500 mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                );
              })()}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{t("advisor.advisingNotes")}</h3>
                <Button onClick={() => setShowNoteForm(true)} size="sm" className="bg-amber-600 hover:bg-amber-700"><Plus className="w-4 h-4 me-1" />{t("advisor.addNote")}</Button>
              </div>
              {notes.length === 0 ? <p className="text-slate-400 text-center py-8">{t("advisor.noNotes")}</p> : (
                <div className="space-y-3">
                  {notes.map((note: any) => (
                    <div key={note.id} className="p-4 rounded-xl bg-white/[0.04]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{note.title}</p>
                          {note.isPrivate && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-500/15 text-slate-400">{t("advisor.private")}</span>}
                        </div>
                        <span className="text-xs text-slate-500 capitalize">{note.category}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{note.content}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{t("advisor.appointments")}</h3>
                <Button onClick={() => setShowApptForm(true)} size="sm" className="bg-violet-600 hover:bg-violet-700"><Plus className="w-4 h-4 me-1" />{t("advisor.scheduleAppointment")}</Button>
              </div>
              {appointments.length === 0 ? <p className="text-slate-400 text-center py-8">{t("advisor.noAppointments")}</p> : (
                <div className="space-y-3">
                  {appointments.map((appt: any) => (
                    <div key={appt.id} className="p-4 rounded-xl bg-white/[0.04]">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{appt.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${appt.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : appt.status === "cancelled" ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400"}`}>{appt.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{new Date(appt.scheduledAt).toLocaleString()} • {appt.durationMinutes}m</p>
                      {appt.location && <p className="text-xs text-slate-500 mt-1">{appt.location}</p>}
                      {appt.notes && <p className="text-xs text-slate-400 mt-2 italic">{appt.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{t("advisor.recommendations")}</h3>
                <Button onClick={() => {
                  const title = prompt(t("advisor.recommendationTitle") || "Enter recommendation title");
                  const desc = prompt(t("advisor.recommendationDesc") || "Enter description");
                  if (title && desc) createRec.mutate({ studentId, title, description: desc });
                }} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 me-1" />{t("advisor.createRecommendation")}</Button>
              </div>
              {recommendations.length === 0 ? <p className="text-slate-400 text-center py-8">{t("advisor.noRecommendations")}</p> : (
                <div className="space-y-3">
                  {recommendations.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-xl bg-white/[0.04]">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{r.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${r.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : r.status === "accepted" ? "bg-blue-500/15 text-blue-400" : r.status === "rejected" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>{r.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Alert Dialog */}
      <Dialog open={showAlertForm} onOpenChange={setShowAlertForm}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{t("advisor.createAlert")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder={t("advisor.alertTitle") || "Title"} value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Textarea placeholder={t("advisor.alertMessage") || "Message"} value={alertForm.message} onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <div className="grid grid-cols-2 gap-2">
              <select value={alertForm.severity} onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                className="h-9 rounded-md bg-white/[0.04] border border-white/10 text-white text-sm px-3">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
              <select value={alertForm.type} onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                className="h-9 rounded-md bg-white/[0.04] border border-white/10 text-white text-sm px-3">
                <option value="attendance">Attendance</option><option value="gpa_drop">GPA Drop</option><option value="missing_assignments">Missing Assignments</option><option value="at_risk">At Risk</option><option value="probation">Probation</option><option value="custom">Custom</option>
              </select>
            </div>
            <Button onClick={() => createAlert.mutate({ studentId, ...alertForm })} className="w-full bg-rose-600 hover:bg-rose-700">{t("common.create")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{t("advisor.addNote")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder={t("advisor.noteTitle") || "Title"} value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Textarea placeholder={t("advisor.noteContent") || "Content"} value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <select value={noteForm.category} onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
              className="h-9 w-full rounded-md bg-white/[0.04] border border-white/10 text-white text-sm px-3">
              <option value="general">General</option><option value="academic">Academic</option><option value="behavioral">Behavioral</option><option value="career">Career</option><option value="attendance">Attendance</option><option value="gpa">GPA</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={noteForm.isPrivate} onChange={(e) => setNoteForm({ ...noteForm, isPrivate: e.target.checked })} className="rounded" />
              {t("advisor.privateNote")}
            </label>
            <Button onClick={() => addNote.mutate({ studentId, ...noteForm })} className="w-full bg-amber-600 hover:bg-amber-700">{t("common.create")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Dialog */}
      <Dialog open={showApptForm} onOpenChange={setShowApptForm}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{t("advisor.scheduleAppointment")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder={t("advisor.apptTitle") || "Title"} value={apptForm.title} onChange={(e) => setApptForm({ ...apptForm, title: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Textarea placeholder={t("advisor.apptDescription") || "Description"} value={apptForm.description} onChange={(e) => setApptForm({ ...apptForm, description: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Input type="datetime-local" value={apptForm.scheduledAt} onChange={(e) => setApptForm({ ...apptForm, scheduledAt: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Input type="number" placeholder="Duration (minutes)" value={apptForm.durationMinutes} onChange={(e) => setApptForm({ ...apptForm, durationMinutes: Number(e.target.value) })} className="bg-white/[0.04] border-white/10 text-white" />
            <Input placeholder={t("advisor.apptLocation") || "Location"} value={apptForm.location} onChange={(e) => setApptForm({ ...apptForm, location: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Button onClick={() => scheduleAppt.mutate({ studentId, ...apptForm })} className="w-full bg-violet-600 hover:bg-violet-700">{t("common.schedule")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
