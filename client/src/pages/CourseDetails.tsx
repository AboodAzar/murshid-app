// CourseDetails: Comprehensive Course Page Template matching ZUJ E-Learning (elearning.zuj.edu.jo)
// Supports: Slides, Notes, Material, Activities, Assignments, Quizzes, Exams by Chapter,
// Doctor Profile Integration with [Deactivated] Faculty rule, Course-specific Attendance & QR,
// and Locked/Archived Completed Course Preservation.

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
  ChevronDown, Plus, Lock, AlertTriangle, UserX, UserCheck, HelpCircle,
  FileCheck, Sparkles, Send, Eye, X, BookMarked
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { formatZujCourseCode, getZujCourseModality } from "@/lib/academicUtils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

  // Fetch unified course template from tRPC
  const { data: templateData, isLoading, refetch } = trpc.courses.getCourseTemplate.useQuery(
    { courseId },
    { enabled: !!courseId && !isNaN(courseId) }
  );

  // Mutation to add material (for doctors)
  const addMaterialMutation = trpc.courses.addMaterial.useMutation({
    onSuccess: (res) => {
      toast.success(isRtl ? "تمت إضافة المحتوى للمساق بنجاح!" : res.message || "Material added successfully!");
      setIsAddModalOpen(false);
      resetNewItemForm();
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || (isRtl ? "فشل إضافة المحتوى" : "Failed to add material"));
    }
  });

  // Navigation & view states
  const [activeSection, setActiveSection] = useState<string>("info");
  const [collapsedChapters, setCollapsedChapters] = useState<Record<number, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetChapterForAdd, setTargetChapterForAdd] = useState<number>(1);
  const [doctorPreviewDeactivated, setDoctorPreviewDeactivated] = useState<boolean>(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScannedSuccess, setQrScannedSuccess] = useState(false);

  // New item form state
  const [newType, setNewType] = useState<"slides" | "notes" | "material" | "activity" | "assignment" | "quiz" | "exam">("slides");
  const [newTitle, setNewTitle] = useState("");
  const [newTitleAr, setNewTitleAr] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTotalPoints, setNewTotalPoints] = useState<number>(10);

  const resetNewItemForm = () => {
    setNewTitle("");
    setNewTitleAr("");
    setNewDescription("");
    setNewFileName("");
    setNewDueDate("");
    setNewTotalPoints(10);
  };

  const toggleChapter = (chapterNum: number) => {
    setCollapsedChapters(prev => ({ ...prev, [chapterNum]: !prev[chapterNum] }));
  };

  const handleOpenAddModal = (chapterNum: number = 1) => {
    setTargetChapterForAdd(chapterNum);
    setIsAddModalOpen(true);
  };

  const handleSaveMaterial = () => {
    if (!newTitle.trim()) {
      toast.error(isRtl ? "يرجى كتابة عنوان للمحتوى" : "Please enter a title");
      return;
    }
    addMaterialMutation.mutate({
      courseId,
      chapterNumber: targetChapterForAdd,
      chapterTitle: `Chapter ${targetChapterForAdd}`,
      chapterTitleAr: `الفصل ${targetChapterForAdd}`,
      type: newType,
      title: newTitle.trim(),
      titleAr: newTitleAr.trim() || undefined,
      description: newDescription.trim() || undefined,
      fileName: newFileName.trim() || undefined,
      dueDate: newDueDate || undefined,
      totalPoints: newTotalPoints,
    });
  };

  if (!user) return null;

  // Fallback defaults if query is loading or static
  const course = templateData?.course || {
    id: courseId,
    code: courseId === 33 ? "CS101" : courseId === 42 ? "CS202" : "CS201",
    name: courseId === 33 ? "Introduction to Computing" : courseId === 42 ? "Object Oriented Programming" : "Data Structures",
    nameAr: courseId === 33 ? "مقدمة في الحوسبة" : courseId === 42 ? "البرمجة كائنية التوجه" : "تراكيب البيانات",
    credits: 3,
    description: "Fundamental data structures including balanced binary search trees (AVL), graphs, hash tables, and algorithm asymptotic analysis.",
    modality: "in_person",
    textbookTitle: "Introduction to Algorithms & Data Structures (ZUJ Edition)",
    textbookCover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
    syllabusUrl: `/syllabi/CS201_Syllabus_2026.pdf`,
  };

  const enrollment = templateData?.enrollment || {
    status: course.code === "CS101" ? "completed" : "in_progress",
    isCompleted: course.code === "CS101",
    isLocked: course.code === "CS101",
    grade: course.code === "CS101" ? "A" : null,
    completedSemester: course.code === "CS101" ? "Fall 2025/2026" : null,
  };

  // Doctors resolution with deactivated override
  let rawDoctor = templateData?.doctors?.[0] || {
    id: 101,
    name: "Dr. Ahmad Khalil",
    nameAr: "د. أحمد خليل",
    title: "Associate Professor of AI & Software Systems",
    email: "a.khalil@zuj.edu.jo",
    officeNumber: "Faculty of IT - Room 302",
    phone: "+962 6 429 1511 ext. 302",
    isActive: true,
    isDeactivated: false,
  };

  if (course.code === "CS101" || doctorPreviewDeactivated) {
    rawDoctor = {
      id: 999,
      name: "Dr. Samir Al-Najjar",
      nameAr: "د. سمير النجار",
      title: "Former Assistant Professor of Computer Science",
      email: null,
      officeNumber: null,
      phone: null,
      isActive: false,
      isDeactivated: true,
      contactNotice: "Faculty member has departed university / instructor account deactivated. Contact details unavailable.",
    };
  }

  const attendance = templateData?.attendance || {
    rate: 93,
    present: 13,
    total: 14,
    absent: 1,
    maxAbsences: 4,
    isDeprivationRisk: false,
  };

  const chapters = templateData?.chapters || [];
  const announcements = templateData?.announcements || [];
  const schedule = templateData?.schedule || [];
  const modality = getZujCourseModality(course.code, course.modality);
  const isDoctorUser = user.role === "advisor" || user.role === "admin";

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16">
        
        {/* Navigation Breadcrumb & Quick Actions */}
        <motion.div {...fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/schedule")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isRtl ? "الجدول الدراسي" : "Schedule"}</span>
            </button>
            <span className="text-slate-500">/</span>
            <button
              onClick={() => setLocation("/courses")}
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              {isRtl ? "مساقاتي" : "My Courses"}
            </button>
            <span className="text-slate-500">/</span>
            <span className="text-xs font-bold text-white font-mono">{formatZujCourseCode(course.code)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle to demonstrate Deactivated Doctor rule */}
            <button
              onClick={() => setDoctorPreviewDeactivated(!doctorPreviewDeactivated)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 ${
                doctorPreviewDeactivated
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-slate-800 text-slate-300 border-white/10 hover:text-white"
              }`}
              title="Demonstrate how deactivated faculty members appear on courses"
            >
              {doctorPreviewDeactivated ? <UserX className="w-3.5 h-3.5 text-rose-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{doctorPreviewDeactivated ? "Faculty Deactivated [Active Demo]" : "Simulate Deactivated Doctor"}</span>
            </button>

            {/* Doctor Add Content Trigger - Strictly for Doctors/Instructors */}
            {isDoctorUser && !enrollment.isLocked && (
              <button
                onClick={() => handleOpenAddModal(1)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 active:scale-95 border border-emerald-400/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? "إضافة محتوى (دكتور)" : "Add Content (Doctor)"}</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* ─── Locked / Archived Completed Course Banner ─── */}
        {enrollment.isLocked && (
          <motion.div
            {...fadeInUp}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 border border-amber-500/40 text-xs flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-amber-200">
                  {isRtl ? "مساق مكتمل ومؤرشف ومقفل (Archived Offering)" : "Archived Semester Offering • Completed Course"}
                </h4>
                <p className="text-[11px] text-slate-300">
                  {isRtl
                    ? `تم اجتياز هذا المساق في ${enrollment.completedSemester || "الفصل الأول 2025/2026"} بنجاح (${enrollment.grade || "A"}). محتوى هذا الفصل مقفل ومحفوظ بشكل دائم ولا يتأثر بالفصول اللاحقة.`
                    : `Completed and passed in ${enrollment.completedSemester || "Fall 2025/2026"} with Grade ${enrollment.grade || "A"}. Content is permanently locked and preserved for academic records.`}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shrink-0">
              ✓ Passed ({enrollment.grade || "A"})
            </Badge>
          </motion.div>
        )}

        {/* ─── Top Course Banner (Template matching Video) ─── */}
        <motion.div
          {...fadeInUp}
          className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/95 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="space-y-3 flex-1">
              {/* Badges strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/40">
                  {formatZujCourseCode(course.code)}
                </span>
                <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg font-semibold">
                  {course.credits} {isRtl ? "ساعات معتمدة" : "Credit Hours"}
                </span>
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
                {enrollment.isCompleted ? (
                  <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>{isRtl ? "سجل مؤرشف ومقفل" : "Archived Record"}</span>
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isRtl ? "الفصل الحالي نشط" : "Active Semester"}</span>
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isRtl ? (course as any).nameAr || course.name : course.name}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                {course.description}
              </p>

              {/* Progress bar (Directly from video: "Your progress: 68%") */}
              <div className="pt-2 max-w-md space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{isRtl ? "نسبة إنجاز المساق" : "Your progress"}</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {enrollment.isCompleted ? "100%" : "68%"}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                    style={{ width: enrollment.isCompleted ? "100%" : "68%" }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions (QR Attend, What-If) */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <button
                onClick={() => setIsQrScannerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/30 active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>{isRtl ? "تسجيل الحضور بالـ QR" : "Scan Classroom QR"}</span>
              </button>

              <button
                onClick={() => setLocation("/grades")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>{isRtl ? "محاكي العلامات What-If" : "What-If Simulator"}</span>
              </button>

              <a
                href={course.syllabusUrl || "#syllabus"}
                download
                className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{isRtl ? "تحميل الخطة الرسمية" : "Download Syllabus"}</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block text-[10px]">{isRtl ? "أستاذ المساق" : "Instructor"}</span>
              <span className="font-bold text-white text-xs flex items-center gap-1 mt-0.5">
                <span>{rawDoctor.name}</span>
                {rawDoctor.isDeactivated && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded font-bold">[Deactivated]</span>
                )}
              </span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block text-[10px]">{isRtl ? "القاعة الدراسية" : "Classroom"}</span>
              <span className="font-bold text-white text-xs mt-0.5 block">
                {schedule[0]?.roomNumber || "Hall 41"} • {schedule[0]?.buildingName || "IT Faculty"}
              </span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block text-[10px]">{isRtl ? "نسبة الحضور" : "Attendance Rate"}</span>
              <span className="font-bold text-emerald-400 text-xs mt-0.5 block">
                {attendance.rate}% ({attendance.present}/{attendance.total})
              </span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block text-[10px]">{isRtl ? "حالة الحرمان (المادة 14)" : "Article 14 Status"}</span>
              <span className={`font-bold text-xs mt-0.5 block ${attendance.isDeprivationRisk ? "text-rose-400" : "text-emerald-300"}`}>
                {attendance.absent} / {attendance.maxAbsences} {isRtl ? "غيابات" : "Absences"} {attendance.isDeprivationRisk ? "⚠️" : "✓"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── Main Two-Column Layout (Sidebar + Course Content) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* ─── Left Sidebar: Table of Contents & Course Calendar (From Video) ─── */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Table of Contents Box */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 sticky top-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-emerald-400" />
                  <span>{isRtl ? "فهرس المساق والمحتويات" : "Table of contents"}</span>
                </h3>
              </div>

              {/* Jump Links matching video */}
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setActiveSection("info")}
                  className={`w-full text-start p-2 rounded-xl transition-all flex items-center gap-2 ${
                    activeSection === "info"
                      ? "bg-emerald-600 text-white font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isRtl ? "معلومات المساق والخطة" : "Course Information and Syllabus"}</span>
                </button>

                <button
                  onClick={() => setActiveSection("attendance")}
                  className={`w-full text-start p-2 rounded-xl transition-all flex items-center gap-2 ${
                    activeSection === "attendance"
                      ? "bg-emerald-600 text-white font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">{isRtl ? "كشف الحضور والغياب" : "Attendance (كشف الحضور)"}</span>
                </button>

                {chapters.map((ch: any) => (
                  <button
                    key={ch.chapterNumber}
                    onClick={() => {
                      setActiveSection(`ch-${ch.chapterNumber}`);
                      const el = document.getElementById(`chapter-card-${ch.chapterNumber}`);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-start p-2 rounded-xl transition-all flex items-center justify-between ${
                      activeSection === `ch-${ch.chapterNumber}`
                        ? "bg-emerald-600 text-white font-bold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">Chapter {ch.chapterNumber}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">({ch.items?.length || 0})</span>
                  </button>
                ))}
              </div>

              {/* Course Calendar Mini Widget */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>November 2026</span>
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    2026/2027-1
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-mono text-slate-400 pt-1">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  <span className="text-slate-600">26</span><span className="text-slate-600">27</span><span className="text-slate-600">28</span><span className="text-slate-600">29</span><span className="text-slate-600">30</span><span className="text-slate-600">31</span><span className="text-emerald-400 font-bold">1</span>
                  <span>2</span><span className="bg-emerald-500/30 text-emerald-200 rounded font-bold">3</span><span className="bg-blue-500/30 text-blue-200 rounded font-bold">4</span><span>5</span><span>6</span><span>7</span><span className="bg-amber-500/30 text-amber-200 rounded font-bold">8</span>
                  <span>9</span><span className="bg-emerald-500/30 text-emerald-200 rounded font-bold">10</span><span className="bg-rose-500/30 text-rose-200 rounded font-bold">11</span><span>12</span><span>13</span><span>14</span><span>15</span>
                </div>
                <p className="text-[9px] text-slate-400 text-center pt-1">
                  Highlighted days indicate lectures, lab sessions & deadlines.
                </p>
              </div>
            </div>
          </div>

          {/* ─── Right Main Content Area ─── */}
          <div className="lg:col-span-3 space-y-6">

            {/* 1. Course Information and Syllabus Section (Matching recording) */}
            <div id="section-course-info" className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-extrabold text-white">Course Information and Syllabus</h3>
                </div>
                <Badge variant="outline" className="border-white/10 text-slate-300 text-xs">
                  {formatZujCourseCode(course.code)}
                </Badge>
              </div>

              {/* Textbook Cover & Lecturer Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {/* Textbook Card */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-center">
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/5">
                    <img
                      src={course.textbookCover}
                      alt={course.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{course.textbookTitle}</h4>
                  <p className="text-[10px] text-slate-400">Official Course Textbook & Reference</p>
                </div>

                {/* ─── DOCTORS INFO CARD (WITH DEACTIVATED FACULTY HANDLING) ─── */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-slate-950 border border-emerald-500/25 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Lecturers' Names and Emails:</span>
                    </h4>
                    {rawDoctor.isDeactivated ? (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] font-bold">
                        ⚠️ Deactivated Faculty
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                        Active Faculty
                      </Badge>
                    )}
                  </div>

                  {/* Doctor Profile Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        {/* Doctor Name with [Deactivated] badge if applicable */}
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-white">
                            {rawDoctor.name}
                          </h5>
                          {rawDoctor.isDeactivated && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              [Deactivated]
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{rawDoctor.title}</p>
                      </div>
                    </div>

                    {/* Conditional Contact & Office Information */}
                    {rawDoctor.isDeactivated ? (
                      /* DEACTIVATED DOCTOR: ALL OTHER INFO IS HIDDEN AND NOT AVAILABLE */
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-rose-300">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Contact Information Unavailable</span>
                        </p>
                        <p className="text-[11px] text-rose-200/90 leading-relaxed">
                          This faculty member has departed the university or their teaching assignment has been discontinued.
                          Office location, university email, and direct scheduling are deactivated.
                        </p>
                      </div>
                    ) : (
                      /* ACTIVE DOCTOR: FULL OFFICE, EMAIL & SCHEDULE PULLED FROM PROFILE */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-slate-300 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Faculty Office Number:</span>
                          <span className="text-white font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{rawDoctor.officeNumber}</span>
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Official University Email:</span>
                          <span className="text-emerald-400 font-mono font-bold truncate block">
                            {rawDoctor.email}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5 sm:col-span-2">
                          <span className="text-[10px] text-slate-400 block font-semibold">Office Hours & Consultation:</span>
                          <span className="text-white font-semibold">
                            Sunday & Tuesday: 11:00 AM – 12:00 PM • Wednesday (Virtual): 03:00 PM – 04:00 PM
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Brief Description & Course Learning Outcomes (From Video) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Brief Description:</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {course.description} Advanced algorithmic modules equip students to resolve complex computational bottlenecks, evaluate asymptotic growth, and build self-balancing search trees.
                </p>

                {/* Course Learning Outcomes (CLO to PLO Matrix Table matching video) */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-white">Course Learning Outcomes (CLOs) Matrix:</h4>
                  <div className="rounded-xl border border-white/10 overflow-hidden text-[11px]">
                    <table className="w-full text-start">
                      <thead className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
                        <tr>
                          <th className="p-2.5 text-start">Domain</th>
                          <th className="p-2.5 text-start">Course Learning Outcome (CLO)</th>
                          <th className="p-2.5 text-start">Program Outcome</th>
                          <th className="p-2.5 text-start">Assessment Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-bold text-white">Knowledge</td>
                          <td className="p-2.5">Analyze worst-case and amortized time bounds using Big-O notations.</td>
                          <td className="p-2.5 font-mono text-emerald-400">PLO 1.1</td>
                          <td className="p-2.5">Quizzes & Midterm Exam</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-bold text-white">Skills</td>
                          <td className="p-2.5">Implement single and double tree rotations on self-balancing AVL trees.</td>
                          <td className="p-2.5 font-mono text-emerald-400">PLO 2.3</td>
                          <td className="p-2.5">Programming Labs & Homework</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-bold text-white">Competence</td>
                          <td className="p-2.5">Select optimal data structures for memory-constrained and real-time systems.</td>
                          <td className="p-2.5 font-mono text-emerald-400">PLO 3.2</td>
                          <td className="p-2.5">Comprehensive Final Exam</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Course Announcements Board (From Video) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>📢 Announcements (لوحة الإعلانات)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">1 Notice</span>
                </div>
                {announcements.map((a: any) => (
                  <div key={a.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{a.title}</span>
                      <span className="text-[10px] text-slate-400">{a.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{a.content}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold block">Posted by: {a.author}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Attendance Section (كشف الحضور والغياب - From Video) */}
            <div id="section-attendance" className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-extrabold text-white">كشف الحضور والغياب (Course Attendance Tracker)</h3>
                    <p className="text-xs text-slate-400">Article 14 Compliance • Max 4 Absences Allowed (15% limit)</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsQrScannerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR In Class</span>
                </button>
              </div>

              {/* Article 14 Meter */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/25 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Logged Absences: <strong className="text-emerald-400">{attendance.absent}</strong> / {attendance.maxAbsences} allowed
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">{attendance.rate}% Rate</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(100, (attendance.absent / attendance.maxAbsences) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>✓ 13 Present</span>
                  <span>1 Late</span>
                  <span className="text-emerald-400 font-bold">Academic Standing: Regular & Safe</span>
                </div>
              </div>
            </div>

            {/* ─── 3. Chapters / Modules (Slides, Notes, Assignments, Quizzes, Exams) ─── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>Course Chapters & Learning Modules (الوحدات والشرائح)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    All lecture slides, reading notes, activities, quizzes, assignments and exams grouped systematically.
                  </p>
                </div>

                {isDoctorUser && !enrollment.isLocked && (
                  <button
                    onClick={() => handleOpenAddModal(1)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? "إضافة للمساق" : "+ Add to Course"}</span>
                  </button>
                )}
              </div>

              {/* Chapters Accordion Cards */}
              <div className="space-y-3">
                {chapters.map((ch: any) => {
                  const isCollapsed = collapsedChapters[ch.chapterNumber];
                  return (
                    <div
                      key={ch.chapterNumber}
                      id={`chapter-card-${ch.chapterNumber}`}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 overflow-hidden transition-all"
                    >
                      {/* Chapter Accordion Header */}
                      <div
                        onClick={() => toggleChapter(ch.chapterNumber)}
                        className="p-4 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between cursor-pointer border-b border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                            Ch {ch.chapterNumber}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-white">{ch.title}</h4>
                            <p className="text-[11px] text-slate-400">{ch.titleAr}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                            {ch.items?.length || 0} items
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                        </div>
                      </div>

                      {/* Chapter Content Items */}
                      {!isCollapsed && (
                        <div className="p-4 space-y-2.5">
                          {ch.items && ch.items.length > 0 ? (
                            ch.items.map((item: any) => (
                              <div
                                key={item.id}
                                className="p-3 rounded-xl bg-slate-950/60 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                              >
                                <div className="flex items-start gap-3">
                                  {/* Type-based icon badge */}
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    item.type === "slides"
                                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                      : item.type === "assignment"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : item.type === "quiz"
                                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      : item.type === "exam"
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  }`}>
                                    {item.type === "slides" ? (
                                      <FileText className="w-4 h-4" />
                                    ) : item.type === "assignment" ? (
                                      <FileCheck className="w-4 h-4" />
                                    ) : item.type === "quiz" ? (
                                      <HelpCircle className="w-4 h-4" />
                                    ) : item.type === "exam" ? (
                                      <GraduationCap className="w-4 h-4" />
                                    ) : (
                                      <BookOpen className="w-4 h-4" />
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                                        {item.title}
                                      </h5>
                                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                                        item.type === "slides"
                                          ? "bg-purple-500/15 text-purple-300"
                                          : item.type === "assignment"
                                          ? "bg-amber-500/15 text-amber-300"
                                          : item.type === "quiz"
                                          ? "bg-blue-500/15 text-blue-300"
                                          : item.type === "exam"
                                          ? "bg-rose-500/15 text-rose-300"
                                          : "bg-emerald-500/15 text-emerald-300"
                                      }`}>
                                        {item.type}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                                    
                                    {/* Metadata: points & due date */}
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-1">
                                      {item.fileName && <span>📁 {item.fileName} ({item.fileSize || "2.4 MB"})</span>}
                                      {item.dueDate && <span className="text-amber-400 font-mono">⏰ Due: {item.dueDate}</span>}
                                      {item.totalPoints > 0 && <span className="text-emerald-400 font-bold">🎯 {item.totalPoints} pts</span>}
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                  {item.type === "assignment" ? (
                                    enrollment?.status === "completed" || enrollment?.isLocked ? (
                                      <button
                                        disabled
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.error("Course is completed. Submissions are permanently closed."); }}
                                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-500 border border-white/5 text-[11px] font-semibold cursor-not-allowed select-none opacity-50"
                                        title="Submissions closed (Course Completed)"
                                      >
                                        🔒 Submissions Closed
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setLocation("/assignments")}
                                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold"
                                      >
                                        Submit Solution →
                                      </button>
                                    )
                                  ) : item.type === "quiz" ? (
                                    enrollment?.status === "completed" || enrollment?.isLocked ? (
                                      <button
                                        disabled
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.error("Course is completed. Quiz environment is closed."); }}
                                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-500 border border-white/5 text-[11px] font-semibold cursor-not-allowed select-none opacity-50"
                                        title="Quiz closed (Course Completed)"
                                      >
                                        🔒 Quiz Closed
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => toast.info("Opening timed Quiz environment...")}
                                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold"
                                      >
                                        Take Quiz →
                                      </button>
                                    )
                                  ) : item.type === "exam" ? (
                                    <span className="text-[10px] text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded">
                                      Hall 41 • 30 Pts
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => toast.success(`Downloading ${item.fileName}...`)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 border border-white/10"
                                    >
                                      <Download className="w-3 h-3 text-emerald-400" />
                                      <span>Download</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500 italic p-2 text-center">No materials added in this chapter yet.</p>
                          )}

                          {/* Quick inline Add Button for doctors */}
                          {isDoctorUser && !enrollment.isLocked && (
                            <button
                              onClick={() => handleOpenAddModal(ch.chapterNumber)}
                              className="w-full py-2 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isRtl ? `إضافة محتوى / نشاط إلى الفصل ${ch.chapterNumber}` : `+ Add Material / Activity to Chapter ${ch.chapterNumber}`}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ─── MODAL: Doctor Add Material, Slides, Notes, Assignment, Quiz, Exam ─── */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md bg-slate-900 border border-emerald-500/40 text-white rounded-3xl p-5 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-white">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Material or Activity to Chapter {targetChapterForAdd}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              {/* Type Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Item Category:</label>
                <div className="grid grid-cols-3 gap-1.5 font-semibold text-[11px]">
                  {[
                    { id: "slides", label: "Slides 📑" },
                    { id: "notes", label: "Notes 📝" },
                    { id: "material", label: "Material 📖" },
                    { id: "activity", label: "Activity 💡" },
                    { id: "assignment", label: "Assignment 📋" },
                    { id: "quiz", label: "Quiz ⏱️" },
                    { id: "exam", label: "Exam 🎓" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewType(cat.id as any)}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        newType === cat.id
                          ? "bg-emerald-600 text-white border-emerald-400 shadow"
                          : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Title (English):</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ch1 Slides: Asymptotic Proofs & Big-O"
                  className="bg-black/40 border-white/10 text-white text-xs h-9"
                />
              </div>

              {/* Arabic Title */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Title (Arabic):</label>
                <Input
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="مثال: شرائح الفصل الأول: نظريات Big-O"
                  dir="rtl"
                  className="bg-black/40 border-white/10 text-white text-xs h-9"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Description / Instructions:</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief summary or submission instructions for students..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white text-xs"
                />
              </div>

              {/* File Attachment Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Attached File Name:</label>
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. Lecture_01_Slides.pdf"
                  className="bg-black/40 border-white/10 text-white text-xs h-9 font-mono"
                />
              </div>

              {/* Additional fields for Assignment / Quiz / Exam */}
              {["assignment", "quiz", "exam"].includes(newType) && (
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Due Date / Exam Date:</label>
                    <Input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="bg-slate-900 border-white/10 text-white text-xs h-8 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Total Points:</label>
                    <Input
                      type="number"
                      value={newTotalPoints}
                      onChange={(e) => setNewTotalPoints(Number(e.target.value) || 10)}
                      className="bg-slate-900 border-white/10 text-white text-xs h-8 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-white/5 border-white/10 text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveMaterial}
                disabled={addMaterialMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {addMaterialMutation.isPending ? "Adding..." : "Add to Course Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ─── MODAL: In-Class QR Attendance Scanner ─── */}
        <Dialog open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen}>
          <DialogContent className="sm:max-w-sm bg-slate-900 border border-blue-500/40 text-white rounded-3xl p-5 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2 text-white">
                <QrCode className="w-4 h-4 text-blue-400" />
                <span>Classroom QR Attendance Scanner</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-center">
              <div className="h-44 rounded-2xl bg-black border border-blue-500/40 flex flex-col items-center justify-center p-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-2 animate-bounce">
                  📷
                </div>
                <p className="text-xs font-bold text-white">Scanning Room Projector...</p>
                <p className="text-[10px] text-slate-400 font-mono">Checking TOTP token & Hall 41 Geofence</p>
                {qrScannedSuccess && (
                  <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center p-3 text-emerald-300">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1" />
                    <p className="font-bold text-xs">Attendance Verified!</p>
                    <p className="text-[10px] text-slate-300">Logged for {course.code} with Dr. Ahmad Khalil</p>
                  </div>
                )}
              </div>

              <div className="p-2 rounded-xl bg-slate-950 text-[10px] text-slate-400 border border-white/5 space-y-0.5">
                <p>📍 Location: <strong>Hall 41 (Verified inside room)</strong></p>
                <p>🛡️ Anti-Forwarding: <strong>Dynamic 8s Rotation Active</strong></p>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setQrScannedSuccess(true);
                  setTimeout(() => {
                    setIsQrScannerOpen(false);
                    setQrScannedSuccess(false);
                    toast.success("Attendance verified successfully!");
                  }, 1200);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Simulate Camera Capture
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
