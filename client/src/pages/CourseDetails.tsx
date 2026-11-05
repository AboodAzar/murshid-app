import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation } from "wouter";
import {
  BookOpen, Clock, MapPin, Calendar, ArrowLeft, Users, BarChart3,
  FileText, CheckCircle2, AlertCircle, Layers, Download, ExternalLink,
  ShieldAlert, QrCode, Video, Globe, GraduationCap, Check, ChevronRight,
  UserCheck, AlertTriangle
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { formatZujCourseCode, getZujCourseModality } from "@/lib/academicUtils";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function CourseDetails() {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params?.courseId) || 41; // Default to CS201

  const { data, isLoading } = trpc.student.courseDetails.useQuery(
    { courseId },
    { enabled: !!courseId && !isNaN(courseId) }
  );

  const [activeTab, setActiveTab] = useState<"modules" | "assignments" | "attendance" | "officeHours">("modules");
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  if (!user) return null;

  const course = data?.course || {
    id: 41,
    code: "CS201",
    name: "Data Structures",
    nameAr: "تراكيب البيانات",
    credits: 3,
    semester: 1,
    description: "Fundamental data structures including balanced binary search trees (AVL), graphs, hash tables, and algorithm asymptotic analysis.",
    modality: "in_person",
    modalityAr: "وجاهي كامل",
  };

  const attendance = data?.attendance || {
    rate: 93,
    present: 13,
    total: 14,
    absent: 1,
  };

  const modality = getZujCourseModality(course.code, (course as any).modality);

  // Standardized Weekly Modules (Canvas-style, anti-scavenger hunt)
  const WEEKLY_MODULES = [
    {
      week: 1,
      title: "Foundations of Asymptotic Complexity & Big-O",
      titleAr: "مفاهيم التعقيد الحسابي ونظرية Big-O",
      topics: ["Time vs Space Tradeoffs", "Worst-case analysis", "Recurrence Relations"],
      resources: [{ name: "Lecture_01_Asymptotics.pdf", size: "2.4 MB" }],
      hasAssignment: false,
    },
    {
      week: 2,
      title: "Linear Data Structures: Stacks, Queues & Deques",
      titleAr: "التراكيب الخطية: المكدس، الطابور، والطابور المزدوج",
      topics: ["Array vs Linked List implementation", "Circular Buffer", "Parenthesis Matching Algorithm"],
      resources: [{ name: "Lecture_02_Linear_Structs.pdf", size: "3.1 MB" }],
      hasAssignment: true,
      assignmentTitle: "Doubly Linked List Implementation Lab",
    },
    {
      week: 3,
      title: "Binary Search Trees & Recursive Traversals",
      titleAr: "أشجار البحث الثنائية والاجتياز التكراري",
      topics: ["Inorder, Preorder, Postorder", "Tree Depth & Height", "Search and Deletion Complexity"],
      resources: [{ name: "Lecture_03_BST_Algorithms.pdf", size: "1.8 MB" }],
      hasAssignment: false,
    },
    {
      week: 4,
      title: "Self-Balancing AVL Trees & Rotations",
      titleAr: "أشجار AVL ذاتية التوازن وحساب الدوران",
      topics: ["Balance Factor formula", "Single Left/Right Rotations", "Double LR/RL Rotations"],
      resources: [{ name: "Lecture_04_AVL_Balancing.pdf", size: "4.2 MB" }, { name: "AVL_Visualization_Tool.url", size: "Link" }],
      hasAssignment: true,
      assignmentTitle: "AVL Tree Rotation & Height Balancing",
    },
    {
      week: 5,
      title: "Priority Queues & Binary Heaps",
      titleAr: "طوابير الأولوية وأكوام البيانات الثنائية",
      topics: ["Min-Heap & Max-Heap properties", "Heapify algorithm O(n)", "Heap Sort"],
      resources: [{ name: "Lecture_05_Heaps.pdf", size: "2.9 MB" }],
      hasAssignment: false,
    },
  ];

  // Office Hour Booking Slots for Dr. Ahmad Khalil
  const OFFICE_HOUR_SLOTS = [
    { id: "slot-1", day: "Sunday", dayAr: "الأحد", time: "11:00 AM - 12:00 PM", location: "Faculty of IT - Room 302", type: "in_person" },
    { id: "slot-2", day: "Tuesday", dayAr: "الثلاثاء", time: "01:00 PM - 02:00 PM", location: "Faculty of IT - Room 302", type: "in_person" },
    { id: "slot-3", day: "Wednesday", dayAr: "الأربعاء", time: "03:00 PM - 04:00 PM", location: "Virtual Office (MS Teams)", type: "online" },
  ];

  const absenceCount = (attendance as any)?.absent ?? Math.max(0, (attendance?.total ?? 0) - (attendance?.present ?? 0));
  const maxAbsences = 4; // Article 14 limit (15% = 4 lectures)
  const isDeprivationRisk = absenceCount >= 3;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Navigation & Breadcrumb */}
        <motion.div {...fadeInUp} className="flex items-center justify-between">
          <button
            onClick={() => setLocation("/schedule")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{isRtl ? "العودة للجدول الدراسي" : "Back to Course Schedule"}</span>
          </button>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
            ZUJ Academic Semester 2026
          </span>
        </motion.div>

        {/* Unified Course Banner */}
        <motion.div
          {...fadeInUp}
          className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/95 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/40">
                  {formatZujCourseCode(course.code)}
                </span>
                <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg font-semibold">
                  {course.credits} {isRtl ? "ساعات معتمدة" : "Credit Hours"}
                </span>
                {/* Official Modality Badge */}
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1.5 ${modality.badgeColor}`}>
                  {modality.modality === "face_to_face" ? (
                    <GraduationCap className="w-3.5 h-3.5" />
                  ) : modality.modality === "integrated" ? (
                    <Layers className="w-3.5 h-3.5" />
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                  <span>{isRtl ? modality.modalityLabelAr : modality.modalityLabelEn}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isRtl ? (course as any).nameAr || course.name : course.name}
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                {course.description || "Course study plan covering theoretical foundations, laboratory hands-on implementations, and comprehensive evaluations."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setLocation("/attendance")}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/30 active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>{isRtl ? "تسجيل الحضور بالـ QR" : "QR Attendance"}</span>
              </button>

              <button
                onClick={() => setLocation("/grades")}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>{isRtl ? "محاكي العلامات What-If" : "What-If Simulator"}</span>
              </button>
            </div>
          </div>

          {/* Key Course Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block text-[11px]">{isRtl ? "مدرس المساق" : "Instructor"}</span>
              <span className="font-bold text-white text-sm">د. أحمد خليل (Dr. Ahmad)</span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block text-[11px]">{isRtl ? "القاعة الدراسية" : "Classroom"}</span>
              <span className="font-bold text-white text-sm">Hall 41 • IT Faculty</span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block text-[11px]">{isRtl ? "نسبة الحضور" : "Attendance Rate"}</span>
              <span className="font-bold text-emerald-400 text-sm">{attendance.rate}% ({attendance.present}/{attendance.total})</span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block text-[11px]">{isRtl ? "حالة الحرمان (مادة 14)" : "Article 14 Status"}</span>
              <span className={`font-bold text-sm ${isDeprivationRisk ? "text-rose-400" : "text-emerald-300"}`}>
                {absenceCount} / {maxAbsences} {isRtl ? "غيابات" : "Absences"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Unified Anti-Scavenger-Hunt Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "modules"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isRtl ? "الوحدات التعليمية الأسبوعية" : "Weekly Modules & Syllabi"}</span>
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "assignments"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isRtl ? "الواجبات والاختبارات" : "Assignments & Tasks"}</span>
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "attendance"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{isRtl ? "سجل الحضور والغياب" : "Attendance Tracker"}</span>
          </button>

          <button
            onClick={() => setActiveTab("officeHours")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "officeHours"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isRtl ? "حجز الساعات المكتبية مع الدكتور" : "Doctor Office Hours"}</span>
          </button>
        </div>

        {/* Tab 1: Weekly Modules (Anti-Scavenger Hunt Layout) */}
        {activeTab === "modules" && (
          <motion.div {...fadeInUp} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{isRtl ? "الخطة الدراسية والمحاضرات الأسبوعية" : "Course Modules & Syllabus"}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isRtl
                    ? "جميع المراجع والشرائح والواجبات مرتبة تسلسلياً حسب الأسابيع دون الحاجة للبحث في مجلدات متفرقة"
                    : "Zero-scavenger-hunt: all slides, reading notes, and tasks grouped logically by week."}
                </p>
              </div>

              <a
                href="#syllabus"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRtl ? "تحميل الخطة الرسمية (PDF)" : "Download Full Syllabus"}</span>
              </a>
            </div>

            <div className="space-y-3">
              {WEEKLY_MODULES.map((m) => (
                <div
                  key={m.week}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 hover:border-emerald-500/30 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-xs">
                        W{m.week}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {isRtl ? m.titleAr : m.title}
                      </h4>
                    </div>

                    {m.hasAssignment && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 self-start sm:self-auto">
                        <FileText className="w-3 h-3" />
                        <span>{isRtl ? "يوجد واجب مرتبط" : "Includes Assignment"}</span>
                      </span>
                    )}
                  </div>

                  {/* Topics covered */}
                  <div className="flex flex-wrap gap-1.5">
                    {m.topics.map((t, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-black/40 text-slate-300 border border-white/5">
                        • {t}
                      </span>
                    ))}
                  </div>

                  {/* Resources */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {m.resources.map((r, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-white/10 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{r.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({r.size})</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Assignments & Quizzes */}
        {activeTab === "assignments" && (
          <motion.div {...fadeInUp} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {isRtl ? "واجبات وتكليفات هذا المساق" : "Course Assignments & Problem Sets"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isRtl
                    ? "يمكنك تسليم الحل كتابةً، أو إرفاق صورة للمخطط، مع دعم التسليم المتأخر الموثق"
                    : "Submit via code/text or handwritten lab diagrams, with documented late grace submissions."}
                </p>
              </div>

              <button
                onClick={() => setLocation("/assignments")}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                {isRtl ? "فتح صفحة الواجبات الشاملة" : "Open Full Assignments Portal"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Assignment #1</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Pending</span>
                </div>
                <h4 className="text-sm font-bold text-white">AVL Tree Rotation & Height Balancing</h4>
                <p className="text-xs text-slate-400">Calculate single/double rotation complexities and show balance factor recalculation.</p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Due: Nov 11, 2026</span>
                  <button onClick={() => setLocation("/assignments")} className="text-emerald-400 font-bold hover:underline">Submit Now →</button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded font-bold">Lab Task #1</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Graded: 96/100</span>
                </div>
                <h4 className="text-sm font-bold text-white">Doubly Linked List Node Deletion Lab</h4>
                <p className="text-xs text-slate-400">Feedback: ممتاز يا حنان! معالجة دقيقة لحالات الأطراف وإدارة ممتازة للذاكرة.</p>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Reviewed by Dr. Ahmad Khalil</span>
                  <span className="text-emerald-400 font-bold">Completed ✓</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Attendance Tracker & Article 14 Deprivation Meter */}
        {activeTab === "attendance" && (
          <motion.div {...fadeInUp} className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                    <span>{isRtl ? "مقياس حرمان المادة 14 (الحد الأقصى للغياب 15%)" : "Article 14 Absence & Deprivation Meter"}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRtl
                      ? "تنص تعليمات جامعة الزيتونة على حرمان الطالب من التقدم للامتحان النهائي إذا تجاوزت نسبة غيابه 15% (أكثر من 4 محاضرات)"
                      : "ZUJ regulations mandate deprivation from final exams if unexcused absences exceed 15% (more than 4 lectures)."}
                  </p>
                </div>

                <div className="text-end">
                  <span className="text-2xl font-black text-emerald-400 font-mono">{attendance.rate}%</span>
                  <span className="text-[10px] text-slate-400 block">{isRtl ? "معدل الحضور الكلي" : "Overall Rate"}</span>
                </div>
              </div>

              {/* Visual meter bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{absenceCount} {isRtl ? "غياب مسجل" : "Absence Logged"}</span>
                  <span className="text-slate-400">Max Allowed: 4 Absences (15%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
                  <div style={{ width: `${(absenceCount / maxAbsences) * 100}%` }} className="bg-emerald-500 h-full transition-all" />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  {isRtl ? "الحالة الأكاديمية للمساق:" : "Academic Standing:"} <strong className="text-emerald-300">Safe / منتظم</strong>
                </span>
                <button
                  onClick={() => setLocation("/attendance")}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{isRtl ? "تسجيل الحضور في القاعة" : "Scan Classroom QR"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: 1-Click Doctor Office Hours Scheduler (Calendly-Style) */}
        {activeTab === "officeHours" && (
          <motion.div {...fadeInUp} className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>{isRtl ? "حجز موعد الساعات المكتبية (1-Click Booking)" : "1-Click Office Hours Scheduler"}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRtl
                      ? "اختر موعداً مباشراً لمناقشة أسئلة المساق والمشاريع مع الدكتور أحمد خليل دون الحاجة لتبادل الرسائل عبر البريد"
                      : "Book an office hour slot with Dr. Ahmad Khalil directly without email friction."}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  AK
                </div>
              </div>

              {/* Slot Cards */}
              <div className="grid gap-3 sm:grid-cols-3">
                {OFFICE_HOUR_SLOTS.map((slot) => {
                  const isBooked = bookedSlot === slot.id;
                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isBooked
                          ? "bg-emerald-950/80 border-emerald-500/80 shadow-lg shadow-emerald-950/50"
                          : "bg-slate-900/60 border-white/10 hover:border-emerald-500/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{isRtl ? slot.dayAr : slot.day}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          slot.type === "in_person" ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"
                        }`}>
                          {slot.type === "in_person" ? (isRtl ? "وجاهي" : "In-Person") : (isRtl ? "إلكتروني" : "Online")}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1">
                        <p className="flex items-center gap-1 font-semibold text-white">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{slot.time}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.location}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setBookedSlot(isBooked ? null : slot.id)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isBooked
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10"
                        }`}
                      >
                        {isBooked ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{isRtl ? "تم تأكيد الحجز ✓" : "Confirmed ✓"}</span>
                          </>
                        ) : (
                          <span>{isRtl ? "تأكيد الموعد" : "Reserve Slot"}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {bookedSlot && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {isRtl
                        ? "تم إرسال تأكيد الموعد إلى تقويمك الجامعي وتقويم الدكتور أحمد خليل بنجاح."
                        : "Slot successfully reserved and synchronized with your university Google/Apple Calendar!"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
