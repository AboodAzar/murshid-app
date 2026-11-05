import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Award,
  Calendar,
  Plus,
  X,
  Loader2,
  GraduationCap,
  Image as ImageIcon,
  Code2,
  CheckSquare,
  Upload,
  Star,
  MessageSquare,
  Send,
  Eye,
  Check,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

type AssignmentItem = {
  id: number;
  status: "pending" | "submitted" | "graded" | "overdue";
  score: number | null;
  solutionText?: string | null;
  solutionImageUrl?: string | null;
  selectedOption?: string | null;
  feedback?: string | null;
  gradedBy?: number | null;
  gradedAt?: Date | string | null;
  submittedAt?: Date | string | null;
  assignmentId: number;
  advisorId?: number | null;
  doctorName?: string | null;
  doctorEmail?: string | null;
  title: string | null;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  submissionType?: string | null;
  options?: string | null;
  dueDate: Date | string | null;
  totalPoints?: number | null;
  isLateSubmission?: boolean;
  isOverdueUnsubmitted?: boolean;
  courseName?: string | null;
  courseCode?: string | null;
  courseId?: number | null;
};

export default function Assignments() {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Active student selection for Advisor/Admin or direct student
  const isPrivileged = user?.role === "advisor" || user?.role === "admin";
  const [selectedStudentId, setSelectedStudentId] = useState<number>(() => {
    if (user?.role === "student") return user.id;
    const saved = localStorage.getItem("advisorSelectedStudentId");
    // Default to Hanan (240002) if no student explicitly selected
    return saved ? Number(saved) : 240002;
  });

  const targetStudentId = user?.role === "student" ? user.id : selectedStudentId;

  const { data: assignments = [], isLoading, refetch } = trpc.student.assignments.useQuery(
    targetStudentId ? { studentId: targetStudentId } : undefined
  );

  const { data: dashboardData } = trpc.student.dashboard.useQuery(
    targetStudentId ? { studentId: targetStudentId } : undefined
  );
  const availableStudents = dashboardData?.availableStudents || [];

  const { data: coursesData } = trpc.courses.list.useQuery({ limit: 100 });
  const allCourses = coursesData?.data || [];

  // Active Filter Tab
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "submitted" | "graded" | "overdue">("all");

  // Create Assignment Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createCourseId, setCreateCourseId] = useState<number>(41); // default CS201
  const [createTitle, setCreateTitle] = useState("");
  const [createTitleAr, setCreateTitleAr] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createSubmissionType, setCreateSubmissionType] = useState("all");
  const [createOptions, setCreateOptions] = useState("");
  const [createDueDate, setCreateDueDate] = useState(() => {
    const d = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [createPoints, setCreatePoints] = useState(100);

  // Student Submission Modal State
  const [submittingAssignment, setSubmittingAssignment] = useState<AssignmentItem | null>(null);
  const [solutionText, setSolutionText] = useState("");
  const [solutionImageUrl, setSolutionImageUrl] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Doctor Review & Grade Modal State
  const [gradingAssignment, setGradingAssignment] = useState<AssignmentItem | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(95);
  const [gradeFeedback, setGradeFeedback] = useState("");

  // Mutations
  const createMutation = trpc.student.createAssignment.useMutation({
    onSuccess: () => {
      setIsCreateOpen(false);
      setCreateTitle("");
      setCreateTitleAr("");
      setCreateDesc("");
      setCreateOptions("");
      utils.student.assignments.invalidate();
      refetch();
    },
  });

  const submitMutation = trpc.student.submitAssignment.useMutation({
    onSuccess: () => {
      setSubmittingAssignment(null);
      setSolutionText("");
      setSolutionImageUrl("");
      setSelectedOption("");
      setImagePreview(null);
      utils.student.assignments.invalidate();
      refetch();
    },
  });

  const gradeMutation = trpc.student.gradeAssignment.useMutation({
    onSuccess: () => {
      setGradingAssignment(null);
      setGradeFeedback("");
      utils.student.assignments.invalidate();
      refetch();
    },
  });

  // Handlers
  const handleStudentSwitch = (id: number) => {
    setSelectedStudentId(id);
    localStorage.setItem("advisorSelectedStudentId", String(id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setSolutionImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const openSubmitModal = (item: AssignmentItem) => {
    setSubmittingAssignment(item);
    setSolutionText(item.solutionText || "");
    setSolutionImageUrl(item.solutionImageUrl || "");
    setSelectedOption(item.selectedOption || "");
    setImagePreview(item.solutionImageUrl || null);
  };

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;
    submitMutation.mutate({
      assignmentId: submittingAssignment.id,
      solutionText: solutionText.trim() || undefined,
      solutionImageUrl: solutionImageUrl || undefined,
      selectedOption: selectedOption || undefined,
    });
  };

  const openGradeModal = (item: AssignmentItem) => {
    setGradingAssignment(item);
    setGradeScore(item.score ?? item.totalPoints ?? 100);
    setGradeFeedback(item.feedback || "");
  };

  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAssignment) return;
    gradeMutation.mutate({
      studentAssignmentId: gradingAssignment.id,
      score: Number(gradeScore),
      feedback: gradeFeedback.trim() || undefined,
    });
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createCourseId) return;

    let parsedOptions: string[] | undefined = undefined;
    if (createOptions.trim()) {
      parsedOptions = createOptions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    createMutation.mutate({
      courseId: createCourseId,
      studentId: targetStudentId,
      title: createTitle.trim(),
      titleAr: createTitleAr.trim() || createTitle.trim(),
      description: createDesc.trim() || undefined,
      submissionType: createSubmissionType,
      options: parsedOptions,
      dueDate: new Date(createDueDate).toISOString(),
      totalPoints: Number(createPoints) || 100,
    });
  };

  if (!user) return null;

  const pending = assignments.filter((a) => a.status === "pending");
  const submitted = assignments.filter((a) => a.status === "submitted");
  const graded = assignments.filter((a) => a.status === "graded");
  const overdue = assignments.filter((a) => a.status === "overdue");

  const filteredAssignments =
    activeTab === "pending"
      ? pending
      : activeTab === "submitted"
      ? submitted
      : activeTab === "graded"
      ? graded
      : activeTab === "overdue"
      ? overdue
      : assignments;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header & Role Banner */}
        <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-400" />
              {language === "ar" ? "واجبات وتكاليف المساقات" : "Course Assignments & Homework"}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {language === "ar"
                ? "تكاليف معتمدة من الدكاترة المشرفين مع إمكانية تسليم الحلول ورصد الدرجات"
                : "Assigned by faculty doctors with multi-format submissions, deadlines, and grade reviews"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Student Switcher for Doctor/Advisor/Admin */}
            {isPrivileged && (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-400">{language === "ar" ? "الطالب:" : "Student:"}</span>
                <select
                  value={targetStudentId}
                  onChange={(e) => handleStudentSwitch(Number(e.target.value))}
                  className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value={240002} className="bg-slate-900 text-white">
                    Hanan (240002) — Computer Science
                  </option>
                  {availableStudents
                    .filter((s) => s.id !== 240002)
                    .map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name} ({s.id})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Create Assignment Button for Doctors/Advisors */}
            {isPrivileged && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                {language === "ar" ? "تكليف جديد من الدكتور" : "Assign from Doctor"}
              </button>
            )}
          </div>
        </motion.div>

        {/* Counter Summary Cards */}
        <motion.div {...fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`p-4 rounded-2xl border text-start transition-all ${
              activeTab === "pending"
                ? "bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-950/20"
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {language === "ar" ? "قيد الانتظار" : "Pending"}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{pending.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">{language === "ar" ? "واجبات بانتظار الحل" : "Pending Submissions"}</p>
          </button>

          <button
            onClick={() => setActiveTab("submitted")}
            className={`p-4 rounded-2xl border text-start transition-all ${
              activeTab === "submitted"
                ? "bg-blue-500/15 border-blue-500/40 shadow-lg shadow-blue-950/20"
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                {language === "ar" ? "تم التسليم" : "Submitted"}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{submitted.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">{language === "ar" ? "بانتظار مراجعة الدكتور" : "Awaiting Doctor Review"}</p>
          </button>

          <button
            onClick={() => setActiveTab("graded")}
            className={`p-4 rounded-2xl border text-start transition-all ${
              activeTab === "graded"
                ? "bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <Award className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                {language === "ar" ? "تم التقييم" : "Graded"}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{graded.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">{language === "ar" ? "تم رصد العلامة ومراجعتها" : "Reviewed & Graded"}</p>
          </button>

          <button
            onClick={() => setActiveTab("overdue")}
            className={`p-4 rounded-2xl border text-start transition-all ${
              activeTab === "overdue"
                ? "bg-red-500/15 border-red-500/40 shadow-lg shadow-red-950/20"
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                {language === "ar" ? "متأخر" : "Overdue"}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{overdue.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">{language === "ar" ? "تجاوز الموعد النهائي" : "Deadline Expired"}</p>
          </button>
        </motion.div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: "all", label: language === "ar" ? "جميع الواجبات" : "All Assignments", count: assignments.length },
            { id: "pending", label: language === "ar" ? "قيد الانتظار" : "Pending", count: pending.length },
            { id: "submitted", label: language === "ar" ? "تم التسليم" : "Submitted", count: submitted.length },
            { id: "graded", label: language === "ar" ? "تم التقييم" : "Graded", count: graded.length },
            { id: "overdue", label: language === "ar" ? "متأخر" : "Overdue", count: overdue.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 font-semibold shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? "bg-slate-900/15 text-slate-900" : "bg-white/10 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-800/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/[0.02]">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
            <p className="text-slate-300 font-medium">
              {language === "ar" ? "لا توجد واجبات ضمن هذه الفئة" : "No assignments found in this category"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === "ar"
                ? "ستظهر التكاليف الجديدة تلقائياً عند إسنادها من الدكاترة"
                : "New homework will appear here automatically when assigned by professors"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((a) => {
              const daysLeft = a.dueDate
                ? Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : 0;

              let parsedOptions: string[] = [];
              if (a.options) {
                try {
                  parsedOptions = JSON.parse(a.options);
                } catch {
                  parsedOptions = [];
                }
              }

              return (
                <motion.div
                  key={a.id}
                  {...fadeInUp}
                  className={`rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                    a.status === "graded"
                      ? "bg-emerald-950/20 border-emerald-500/20"
                      : a.status === "submitted"
                      ? "bg-blue-950/20 border-blue-500/20"
                      : a.status === "overdue"
                      ? "bg-red-950/20 border-red-500/20"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Top Bar: Course, Doctor Badge, Status & Points */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono text-xs font-semibold">
                        {a.courseCode}
                      </span>
                      <span className="text-sm text-slate-300 font-medium">{a.courseName}</span>
                      {a.doctorName && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-xs text-slate-300">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                          <span>{language === "ar" ? `د. ${a.doctorName.replace(/^Dr\.\s*/i, "")}` : a.doctorName}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {a.status === "graded" && a.score !== null && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                          {a.score} / {a.totalPoints} pts
                        </span>
                      )}
                      {a.status === "submitted" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {language === "ar" ? "قيد المراجعة" : "Under Review"}
                        </span>
                      )}
                      {a.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          {daysLeft > 0
                            ? language === "ar"
                              ? `متبقي ${daysLeft} أيام`
                              : `${daysLeft} days left`
                            : language === "ar"
                            ? "مطلوب اليوم"
                            : "Due Today"}
                        </span>
                      )}
                      {a.status === "overdue" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {language === "ar" ? "متأخر (متاح التسليم)" : "Overdue (Late Allowed)"}
                        </span>
                      )}
                      {(a.isLateSubmission || (a.submittedAt && a.dueDate && new Date(a.submittedAt) > new Date(a.dueDate))) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-bold animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          {language === "ar" ? "⚠️ تسليم متأخر" : "⚠️ Late Submission"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Title & Description */}
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-bold text-white">
                      {language === "ar" && a.titleAr ? a.titleAr : a.title}
                    </h3>
                    {a.description && (
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-3 rounded-xl border border-white/5">
                        {language === "ar" && a.descriptionAr ? a.descriptionAr : a.description}
                      </p>
                    )}

                    {/* Multiple-Choice Options Preview if provided */}
                    {parsedOptions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          {language === "ar" ? "خيارات الإجابة المحددة من الدكتور:" : "Options provided by doctor:"}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {parsedOptions.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`px-3 py-2 rounded-xl text-xs font-medium border text-center ${
                                a.selectedOption === opt
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                                  : "bg-slate-800/50 border-white/5 text-slate-300"
                              }`}
                            >
                              {opt} {a.selectedOption === opt && "✓"}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submitted Content Preview */}
                  {(a.status === "submitted" || a.status === "graded") && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          {language === "ar" ? "الحل المسلّم من الطالب:" : "Student Submission:"}
                        </span>
                        {a.submittedAt && (
                          <span>
                            {new Date(a.submittedAt).toLocaleDateString()} •{" "}
                            {new Date(a.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>

                      {/* Solution Text */}
                      {a.solutionText && (
                        <div className="rounded-xl bg-slate-950/80 p-3 border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-48">
                          {a.solutionText}
                        </div>
                      )}

                      {/* Solution Image Attachment */}
                      {a.solutionImageUrl && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                            {language === "ar" ? "المخطط / الصورة المرفقة:" : "Attached Image / Diagram:"}
                          </p>
                          <a
                            href={a.solutionImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block relative group rounded-xl overflow-hidden border border-white/10 max-w-xs"
                          >
                            <img
                              src={a.solutionImageUrl}
                              alt="Submission"
                              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs gap-1">
                              <Eye className="w-4 h-4" />
                              {language === "ar" ? "عرض بالحجم الكامل" : "View Full Size"}
                            </div>
                          </a>
                        </div>
                      )}

                      {/* Doctor Feedback / Review Notes if graded */}
                      {a.status === "graded" && a.feedback && (
                        <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                          <div className="flex items-center gap-2 mb-1.5">
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-300">
                              {language === "ar" ? "ملاحظات الدكتور وتقييم الواجب:" : "Doctor Review & Feedback:"}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                            "{a.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {language === "ar" ? "الموعد النهائي:" : "Deadline:"}{" "}
                        {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : ""} {a.dueDate ? new Date(a.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Submit / Edit Solution Button for Students */}
                      {(a.status === "pending" || a.status === "submitted" || a.status === "overdue") && (
                        <button
                          onClick={() => openSubmitModal(a)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-[1.02] ${
                            a.status === "overdue"
                              ? "bg-red-600 hover:bg-red-500 text-white border border-red-400/30"
                              : a.status === "submitted"
                              ? "bg-slate-700 hover:bg-slate-600 text-white"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white"
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          {a.status === "overdue"
                            ? language === "ar"
                              ? "تسليم متأخر للدكتور"
                              : "Submit Late Solution"
                            : a.status === "submitted"
                            ? language === "ar"
                              ? "تعديل الحل المسلّم"
                              : "Edit Submission"
                            : language === "ar"
                            ? "تسليم الحل للدكتور"
                            : "Submit Solution"}
                        </button>
                      )}

                      {/* Doctor Grade Button */}
                      {isPrivileged && (a.status === "submitted" || (a.status === "overdue" && a.solutionText)) && (
                        <button
                          onClick={() => openGradeModal(a)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
                        >
                          <Award className="w-3.5 h-3.5" />
                          {language === "ar" ? "رصد وتقييم العلامة" : "Review & Grade"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ----------------- SUBMIT SOLUTION MODAL ----------------- */}
        <AnimatePresence>
          {submittingAssignment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Send className="w-5 h-5 text-emerald-400" />
                      {language === "ar" ? "تسليم حل الواجب للدكتور" : "Submit Assignment Solution"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {submittingAssignment.courseCode} • {submittingAssignment.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmittingAssignment(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitSolution} className="space-y-4 text-start">
                  {(submittingAssignment.status === "overdue" || (submittingAssignment.dueDate && new Date() > new Date(submittingAssignment.dueDate))) && (
                    <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-300">
                          {language === "ar" ? "تنبيه: تسليم متأخر بعد انقضاء الموعد النهائي" : "Notice: Submitting After Deadline (Late Submission)"}
                        </p>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">
                          {language === "ar"
                            ? "انتهى الموعد الرسمي للتسليم. يمكنك تسليم الحل، ولكن سيتم توثيقه وإبرازه كـ (تسليم متأخر) لدى الدكتور المشرف."
                            : "The official deadline has passed. You may still submit your work, but it will be flagged as Late for the faculty doctor."}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Doctor details */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-300">
                        {language === "ar" ? "الدكتور المشرف:" : "Faculty Doctor:"}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {submittingAssignment.doctorName || "Dr. Ahmad Khalil"}
                      </span>
                    </div>
                    <span className="text-xs text-amber-400 font-medium">
                      {submittingAssignment.totalPoints} {language === "ar" ? "علامة" : "pts"}
                    </span>
                  </div>

                  {/* Multiple Choice Selector if options exist */}
                  {(() => {
                    let opts: string[] = [];
                    try {
                      if (submittingAssignment.options) opts = JSON.parse(submittingAssignment.options);
                    } catch {}
                    if (opts.length === 0) return null;
                    return (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                          {language === "ar" ? "حدد الإجابة الصحيحة:" : "Select your answer option:"}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {opts.map((opt, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setSelectedOption(opt)}
                              className={`p-3 rounded-xl border text-sm text-start font-medium transition-all flex items-center justify-between ${
                                selectedOption === opt
                                  ? "bg-emerald-600/20 border-emerald-500 text-white font-bold"
                                  : "bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800"
                              }`}
                            >
                              <span>{opt}</span>
                              {selectedOption === opt && <Check className="w-4 h-4 text-emerald-400" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Solution Text / Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      {language === "ar" ? "كتابة الحل / الكود البرمجي:" : "Type Solution / Code / Explanation:"}
                    </label>
                    <textarea
                      value={solutionText}
                      onChange={(e) => setSolutionText(e.target.value)}
                      rows={6}
                      placeholder={
                        language === "ar"
                          ? "اكتب حلك هنا، أو أرفق الكود البرمجي وشرح الخطوات..."
                          : "Type your code, algorithm explanation, or mathematical solution here..."
                      }
                      className="w-full font-mono text-xs sm:text-sm rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  {/* Solution Image / Diagram */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      {language === "ar" ? "إرفاق صورة أو رسم تخطيطي:" : "Attach Image / Screenshot / Diagram:"}
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-all"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        {language === "ar" ? "رفع صورة من الجهاز" : "Upload Image File"}
                      </button>

                      <span className="text-xs text-slate-500">{language === "ar" ? "أو أدخل رابط الصورة:" : "or enter URL:"}</span>

                      <input
                        type="url"
                        value={solutionImageUrl}
                        onChange={(e) => {
                          setSolutionImageUrl(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://images.com/diagram.png"
                        className="w-full sm:flex-1 text-xs rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-white focus:outline-none"
                      />
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 w-fit">
                        <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setSolutionImageUrl("");
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-500 rounded-full text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setSubmittingAssignment(null)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition-colors"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitMutation.isPending || (!solutionText.trim() && !solutionImageUrl && !selectedOption)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all"
                    >
                      {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Send className="w-4 h-4" />
                      {language === "ar" ? "تأكيد التسليم للدكتور" : "Confirm Submission to Doctor"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ----------------- DOCTOR REVIEW & GRADE MODAL ----------------- */}
        <AnimatePresence>
          {gradingAssignment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      {language === "ar" ? "رصد الدرجة ومراجعة الحل" : "Review & Assign Grade"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {gradingAssignment.courseCode} • {gradingAssignment.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setGradingAssignment(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleGradeSubmission} className="space-y-4 text-start">
                  {(gradingAssignment.isLateSubmission || (gradingAssignment.submittedAt && gradingAssignment.dueDate && new Date(gradingAssignment.submittedAt) > new Date(gradingAssignment.dueDate))) && (
                    <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-300">
                          {language === "ar" ? "⚠️ تنبيه للدكتور: هذا الواجب تم تسليمه متأخراً" : "⚠️ Doctor Warning: Late Student Submission"}
                        </p>
                        <p className="text-slate-300 mt-0.5">
                          {language === "ar"
                            ? "قام الطالب بالتسليم بعد انقضاء الموعد النهائي المحدد. يرجى أخذ ذلك بعين الاعتبار عند رصد الدرجة النهائية."
                            : "Student submitted after the deadline. Please factor any institutional late submission penalties into the score."}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Submission Details Preview */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 space-y-2">
                    <p className="text-xs font-semibold text-slate-300">
                      {language === "ar" ? "ملخص حل الطالب:" : "Student Submission Summary:"}
                    </p>
                    {gradingAssignment.solutionText && (
                      <p className="text-xs font-mono text-emerald-300 line-clamp-3 bg-slate-950 p-2 rounded-lg">
                        {gradingAssignment.solutionText}
                      </p>
                    )}
                    {gradingAssignment.selectedOption && (
                      <p className="text-xs text-blue-300">
                        {language === "ar" ? "الخيار المختار:" : "Selected Choice:"}{" "}
                        <span className="font-bold">{gradingAssignment.selectedOption}</span>
                      </p>
                    )}
                  </div>

                  {/* SpeedGrader Rapid Rubric (Canvas Pattern) */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{language === "ar" ? "معايير التقييم السريع (SpeedGrader Rubric)" : "SpeedGrader Rapid Rubrics"}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        1-Click Scoring
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setGradeScore(100);
                          setGradeFeedback(prev => prev ? prev : (language === "ar" ? "ممتاز! حل متكامل ومتقن ومعالجة دقيقة لجميع الحالات." : "Outstanding work! Fully optimal logic with all edge cases handled."));
                        }}
                        className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 hover:bg-emerald-600/20 text-emerald-300 font-bold transition-all"
                      >
                        <span className="block text-sm font-black">100%</span>
                        <span className="text-[10px] text-slate-400">{language === "ar" ? "علامة كاملة" : "Full Score"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGradeScore(85);
                          setGradeFeedback(prev => prev ? prev : (language === "ar" ? "جيد جداً! الفكرة الأساسية سليمة مع بعض الملاحظات البسيطة." : "Very good! Core concept is solid with minor formatting suggestions."));
                        }}
                        className="p-2 rounded-xl bg-slate-900 border border-teal-500/30 hover:bg-teal-600/20 text-teal-300 font-bold transition-all"
                      >
                        <span className="block text-sm font-black">85%</span>
                        <span className="text-[10px] text-slate-400">{language === "ar" ? "جيد جداً" : "Very Good"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGradeScore(gradingAssignment.isLateSubmission ? 75 : 80);
                          setGradeFeedback(prev => prev ? prev : (language === "ar" ? "تم قبول التسليم المتأخر مع خصم 5% حسب تعليمات المساق." : "Late submission accepted with 5% deduction per course policy."));
                        }}
                        className="p-2 rounded-xl bg-slate-900 border border-amber-500/30 hover:bg-amber-600/20 text-amber-300 font-bold transition-all"
                      >
                        <span className="block text-sm font-black">{gradingAssignment.isLateSubmission ? "75%" : "80%"}</span>
                        <span className="text-[10px] text-slate-400">{language === "ar" ? "تسليم متأخر" : "Late Grace"}</span>
                      </button>
                    </div>

                    {/* Quick Feedback Chips */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        {language === "ar" ? "ملاحظات جاهزة بنقرة واحدة:" : "Quick Feedback Presets:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          language === "ar" ? "ممتاز! معالجة دقيقة لحالات الأطراف وإدارة ممتازة للذاكرة." : "🌟 Optimal logic and memory management.",
                          language === "ar" ? "يرجى الانتباه لمعادلة حساب معامل التوازن (Balance Factor)." : "🔍 Review balance factor calculation formula.",
                          language === "ar" ? "تم توثيق التسليم المتأخر مع احتساب الدرجة." : "⏱️ Late submission noted and recorded.",
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setGradeFeedback(prev => prev ? `${prev} ${chip}` : chip)}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/40 transition-colors text-start"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {language === "ar" ? "الدرجة المستحقة" : "Score / Points"} ({language === "ar" ? "من" : "out of"}{" "}
                      {gradingAssignment.totalPoints})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={gradingAssignment.totalPoints ?? 100}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(Number(e.target.value))}
                      className="w-full text-lg font-bold rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {language === "ar" ? "ملاحظات وتوجيهات الدكتور للطالب:" : "Doctor's Feedback & Comments:"}
                    </label>
                    <textarea
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      rows={4}
                      placeholder={
                        language === "ar"
                          ? "اكتب تقييمك للحل، التوجيهات الأكاديمية، ونقاط القوة..."
                          : "Write constructive feedback, review notes, and commendations..."
                      }
                      className="w-full text-sm rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setGradingAssignment(null)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm transition-colors"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={gradeMutation.isPending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/30"
                    >
                      {gradeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Award className="w-4 h-4" />
                      {language === "ar" ? "حفظ التقييم وإرسال الدرجة" : "Save Grade & Send Feedback"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ----------------- CREATE ASSIGNMENT MODAL (DOCTOR) ----------------- */}
        <AnimatePresence>
          {isCreateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    {language === "ar" ? "إضافة تكليف جديد من الدكتور" : "Assign Homework from Doctor"}
                  </h2>
                  <button
                    onClick={() => setIsCreateOpen(false)}
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
                      value={createCourseId}
                      onChange={(e) => setCreateCourseId(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                        value={createTitle}
                        onChange={(e) => setCreateTitle(e.target.value)}
                        placeholder="e.g. Lab 2: Binary Trees"
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-sm text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {language === "ar" ? "عنوان الواجب (بالعربية)" : "Title (Arabic)"}
                      </label>
                      <input
                        type="text"
                        value={createTitleAr}
                        onChange={(e) => setCreateTitleAr(e.target.value)}
                        placeholder="مثال: واجب 2: الأشجار الثنائية"
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {language === "ar" ? "وصف الواجب والمطلوب" : "Description & Instructions"}
                    </label>
                    <textarea
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                      rows={3}
                      placeholder={language === "ar" ? "تفاصيل التكليف، متطلبات الكود، أو المسائل الرياضية..." : "Assignment instructions, submission format..."}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {language === "ar" ? "خيارات الإجابة المتعددة (سطر لكل خيار - اختياري)" : "Multiple-Choice Options (one per line - optional)"}
                    </label>
                    <textarea
                      value={createOptions}
                      onChange={(e) => setCreateOptions(e.target.value)}
                      rows={2}
                      placeholder="O(1)&#10;O(log n)&#10;O(n)&#10;O(n log n)"
                      className="w-full font-mono text-xs rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {language === "ar" ? "الموعد النهائي للتسليم" : "Deadline"}
                      </label>
                      <input
                        type="datetime-local"
                        value={createDueDate}
                        onChange={(e) => setCreateDueDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-sm text-white focus:outline-none"
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
                        value={createPoints}
                        onChange={(e) => setCreatePoints(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-sm text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
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
                      {language === "ar" ? "إسناد التكليف للطلاب" : "Publish Assignment"}
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