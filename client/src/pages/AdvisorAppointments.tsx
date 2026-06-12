import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { CalendarDays, Clock, MapPin, Plus, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const fadeInUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export default function AdvisorAppointments() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", title: "", description: "", scheduledAt: "", durationMinutes: 30, location: "" });
  const { data: appointments = [], isLoading } = trpc.advisor.getAppointments.useQuery();
  const { data: students = [] } = trpc.advisor.getAssignedStudents.useQuery();
  const utils = trpc.useUtils();
  const createAppt = trpc.advisor.scheduleAppointment.useMutation({ onSuccess: () => { utils.advisor.getAppointments.invalidate(); setShowForm(false); } });
  const cancelAppt = trpc.advisor.cancelAppointment.useMutation({ onSuccess: () => utils.advisor.getAppointments.invalidate() });

  if (!user) return null;

  const upcoming = appointments.filter((a: any) => new Date(a.scheduledAt) > new Date() && a.status !== "cancelled").sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const past = appointments.filter((a: any) => new Date(a.scheduledAt) <= new Date() || a.status === "cancelled").sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6 max-w-5xl mx-auto space-y-6">
        <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("advisor.appointments")}</h1>
            <p className="text-slate-400 mt-1">{t("advisor.appointmentsDesc")}</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto"><Plus className="w-4 h-4 me-2" />{t("advisor.scheduleAppointment")}</Button>
        </motion.div>

        <div className="space-y-6">
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-violet-400" />{t("advisor.upcomingAppointments")}</h2>
            {upcoming.length === 0 ? <p className="text-slate-400 text-center py-8">{t("advisor.noUpcomingAppointments")}</p> : (
              <div className="space-y-3">
                {upcoming.map((appt: any) => (
                  <div key={appt.id} className="p-4 rounded-xl bg-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center"><Clock className="w-5 h-5 text-violet-400" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{appt.title}</p>
                        <p className="text-xs text-slate-400">{new Date(appt.scheduledAt).toLocaleString()} • {appt.durationMinutes}m</p>
                        {appt.location && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{appt.location}</p>}
                      </div>
                    </div>
                    <Button onClick={() => cancelAppt.mutate(appt.id)} variant="outline" size="sm" className="border-white/10 text-slate-300 hover:bg-white/[0.07] w-full sm:w-auto">{t("common.cancel")}</Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" />{t("advisor.pastAppointments")}</h2>
            {past.length === 0 ? <p className="text-slate-400 text-center py-8">{t("advisor.noPastAppointments")}</p> : (
              <div className="space-y-3">
                {past.slice(0, 10).map((appt: any) => (
                  <div key={appt.id} className="p-4 rounded-xl bg-white/[0.04] opacity-70">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">{appt.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded self-start sm:self-auto ${appt.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>{appt.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{new Date(appt.scheduledAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{t("advisor.scheduleAppointment")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="h-9 w-full rounded-md bg-white/[0.04] border border-white/10 text-white text-sm px-3">
              <option value="">{t("advisor.selectStudent")}</option>
              {students.map((s: any) => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
            </select>
            <Input placeholder={t("advisor.apptTitle") || "Title"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Textarea placeholder={t("advisor.apptDescription") || "Description"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Input type="number" placeholder="Duration (minutes)" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="bg-white/[0.04] border-white/10 text-white" />
            <Input placeholder={t("advisor.apptLocation") || "Location"} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-white/[0.04] border-white/10 text-white" />
            <Button onClick={() => { if (!form.studentId) return; createAppt.mutate({ studentId: Number(form.studentId), title: form.title, description: form.description, scheduledAt: form.scheduledAt, durationMinutes: form.durationMinutes, location: form.location }); }} className="w-full bg-violet-600 hover:bg-violet-700">{t("common.schedule")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
