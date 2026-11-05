import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, AlertCircle, CheckCircle2, Award, Calendar, Plus, X, Loader2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Assignments() {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const advisorStudentId = (user?.role === "advisor" || user?.role === "admin")
    ? Number(localStorage.getItem("advisorSelectedStudentId") || 0) || undefined
    : undefined;

  const { data: assignments = [], isLoading, refetch } = trpc.student.assignments.useQuery(
    advisorStudentId ? { studentId: advisorStudentId } : undefined
  );
  const { data: coursesData } = trpc.courses.list.useQuery({ limit: 100 });
  const allCourses = coursesData?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseId, setCourseId] = useState<number>(54);
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [totalPoints, setTotalPoints] = useState(100);

  const utils = trpc.useUtils();
  const createMutation = trpc.student.createAssignment.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setTitle("");
      setTitleAr("");
      setDescription("");
      utils.student.assignments.invalidate();
      utils.student.overview.invalidate();
      utils.student.dashboard.invalidate();
      refetch();
    },
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;
    createMutation.mutate({
      courseId,
      title: title.trim(),
      titleAr: titleAr.trim() || title.trim(),
      description: description.trim() || undefined,
      dueDate: new Date(dueDate).toISOString(),
      totalPoints: Number(totalPoints) || 100,
    });
  };

  if (!user) return null;

  const pending = assignments.filter((a) => a.status === "pending");
  const submitted = assignments.filter((a) => a.status === "submitted" || a.status === "graded");
  const overdue = assignments.filter((a) => a.status === "overdue");

  const renderList = (items: typeof assignments, titleText: string, icon: React.ReactNode, emptyText: string) => (
    <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">{icon} {titleText}</h3>
      {items.length === 0 ? (
        <p className="text-slate-400 text-center py-6">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const daysLeft = a.dueDate
              ? Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : 0;
            return (
              <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5 gap-3 sm:gap-0 hover:border-white/15 transition-all">
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{language === "ar" && a.titleAr ? a.titleAr : a.title}</p>
                  <p className="text-sm text-slate-400">{a.courseCode} • {a.courseName}</p>
                  {a.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{a.description}</p>
                  )}
                </div>
                <div className="text-start sm:text-end">
                  {a.status === "pending" && daysLeft >= 0 && (
                    <p className="text-xs text-amber-400 flex items-center justify-start sm:justify-end gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {daysLeft} {t("student.daysLeft")}
                    </p>
                  )}
                  {a.status === "overdue" && (
                    <p className="text-xs text-red-400 flex items-center justify-start sm:justify-end gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {t("student.overdue")}
                    </p>
                  )}
                  {a.status === "graded" && a.score !== null && a.score !== undefined && (
                    <p className="text-sm text-emerald-400 font-medium">{a.score} / {a.totalPoints}</p>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                    a.status === "graded" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                    a.status === "submitted" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                    a.status === "overdue" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                    "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  }`}>
                    {a.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("student.assignments")}</h1>
            <p className="text-slate-400 mt-1">{assignments.length} {t("student.totalAssignments")}</p>
          </div>
          <div className="flex gap-3 flex-wrap items-center justify-start sm:justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إضافة واجب جديد" : "Add Assignment"}
            </button>
            <div className="text-center px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-2xl font-bold text-amber-400">{pending.length}</p>
              <p className="text-xs text-slate-400">{t("student.pending")}</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-400">{submitted.length}</p>
              <p className="text-xs text-slate-400">{t("student.submitted")}</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{overdue.length}</p>
              <p className="text-xs text-slate-400">{t("student.overdue")}</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {renderList(pending, t("student.pendingAssignments"), <Clock className="w-5 h-5 text-amber-400" />, t("student.noPendingAssignments"))}
            {renderList(submitted, t("student.submittedAssignments"), <CheckCircle2 className="w-5 h-5 text-emerald-400" />, t("student.noSubmittedAssignments"))}
            {renderList(overdue, t("student.overdueAssignments"), <AlertCircle className="w-5 h-5 text-red-400" />, t("student.noOverdueAssignments"))}
          </div>
        )}

        {/* Add Assignment Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    {language === "ar" ? "إضافة واجب جديد" : "Create New Assignment"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAssignment} className="space-y-4 text-start">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {language === "ar" ? "المساق الدراسي" : "Course"}
                    </label>
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    >
                      {allCourses.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {language === "ar" ? "عنوان الواجب (بالإنجليزية)" : "Title (English)"}
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Lab 3: CNN Models"
                        className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {language === "ar" ? "عنوان الواجب (بالعربية)" : "Title (Arabic)"}
                      </label>
                      <input
                        type="text"
                        value={titleAr}
                        onChange={(e) => setTitleAr(e.target.value)}
                        placeholder="مثال: واجب 3: نماذج CNN"
                        className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {language === "ar" ? "الوصف والتعليمات" : "Description & Instructions"}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder={language === "ar" ? "تفاصيل الواجب ومتطلبات التسليم..." : "Assignment instructions, submission format..."}
                      className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {language === "ar" ? "موعد التسليم" : "Due Date & Time"}
                      </label>
                      <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {language === "ar" ? "الدرجة الكلية" : "Total Points"}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={totalPoints}
                        onChange={(e) => setTotalPoints(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition-colors"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all"
                    >
                      {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      {language === "ar" ? "حفظ وإسناد للطلاب" : "Save & Assign to Students"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}