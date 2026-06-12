import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  HelpCircle,
  Search,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  FileText,
  BookOpen,
  Save,
  X,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const emptyFaq = {
  question: "",
  questionAr: "",
  answer: "",
  answerAr: "",
  category: "",
  categoryAr: "",
  isActive: true,
};

export default function AdvisorFAQs() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [viewFaq, setViewFaq] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyFaq });

  const utils = trpc.useUtils();
  const { data: faqsData, isLoading, error } = trpc.faqs.advisorList.useQuery({ limit: 100 });
  const { data: stats } = trpc.faqs.getStats.useQuery();
  const { data: categoriesData } = trpc.faqs.getCategories.useQuery();

  const createFaq = trpc.faqs.create.useMutation({
    onSuccess: () => {
      utils.faqs.advisorList.invalidate();
      utils.faqs.getStats.invalidate();
      utils.faqs.getCategories.invalidate();
      setShowForm(false);
      setForm({ ...emptyFaq });
      toast.success(t("advisor.faqCreated") || "FAQ created successfully");
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const updateFaq = trpc.faqs.update.useMutation({
    onSuccess: () => {
      utils.faqs.advisorList.invalidate();
      utils.faqs.getStats.invalidate();
      setEditingFaq(null);
      setForm({ ...emptyFaq });
      toast.success(t("advisor.faqUpdated") || "FAQ updated successfully");
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const deleteFaq = trpc.faqs.delete.useMutation({
    onSuccess: () => {
      utils.faqs.advisorList.invalidate();
      utils.faqs.getStats.invalidate();
      setDeleteTarget(null);
      toast.success(t("advisor.faqDeleted") || "FAQ deleted successfully");
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const faqs = faqsData?.data ?? [];
  const categories = categoriesData ?? [];

  const filtered = useMemo(() => {
    return faqs.filter((faq: any) => {
      const matchesSearch =
        !search ||
        faq.question?.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(search.toLowerCase()) ||
        faq.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqs, search, selectedCategory]);

  const openAdd = () => {
    setEditingFaq(null);
    setForm({ ...emptyFaq });
    setShowForm(true);
  };

  const openEdit = (faq: any) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      questionAr: faq.questionAr,
      answer: faq.answer,
      answerAr: faq.answerAr,
      category: faq.category,
      categoryAr: faq.categoryAr,
      isActive: faq.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.question.trim() || !form.answer.trim() || !form.category.trim()) {
      toast.error(t("advisor.fillRequiredFields") || "Please fill all required fields");
      return;
    }
    if (editingFaq) {
      updateFaq.mutate({ id: editingFaq.id, ...form });
    } else {
      createFaq.mutate(form);
    }
  };

  const statCards = [
    { label: t("advisor.totalFAQs"), value: stats?.total ?? 0, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/15" },
    { label: t("advisor.publishedFAQs"), value: stats?.published ?? 0, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/15" },
    { label: t("advisor.draftFAQs"), value: stats?.draft ?? 0, icon: Eye, color: "text-amber-400", bg: "bg-amber-500/15" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <motion.div {...fadeInUp} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-violet-400" />
              {t("advisor.faqs")}
            </h1>
            <p className="text-slate-400 mt-1 max-w-xl">
              {t("advisor.faqsDesc")}
            </p>
          </div>
          <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 me-2" />
            {t("advisor.addFaq")}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div {...fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative max-w-md flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t("advisor.searchFaqs")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedCategory === "all"
                    ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                    : "bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.07]"
                }`}
              >
                {t("common.all")}
              </button>
              {categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedCategory === cat
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                      : "bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.07]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <motion.div {...fadeInUp} className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="text-red-200 font-medium">{t("errors.serverError")}</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 mb-4">{t("advisor.noFaqs")}</p>
            <Button onClick={openAdd} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/[0.07]">
              <Plus className="w-4 h-4 me-2" />{t("advisor.addFaq")}
            </Button>
          </motion.div>
        ) : (
          <ScrollArea className="h-[calc(100vh-420px)]">
            <div className="space-y-4 pe-2">
              <AnimatePresence>
                {filtered.map((faq: any) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-medium px-2 py-0.5 rounded border bg-violet-500/15 text-violet-300 border-violet-500/20">
                            {faq.category}
                          </span>
                          {faq.isActive ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-300 border-emerald-500/20">
                              {t("advisor.published")}
                            </span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded border bg-amber-500/15 text-amber-300 border-amber-500/20">
                              {t("advisor.draft")}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {faq.question}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => setViewFaq(faq)} size="icon" variant="ghost" className="w-8 h-8 text-slate-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => openEdit(faq)} size="icon" variant="ghost" className="w-8 h-8 text-slate-400 hover:text-blue-400">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => setDeleteTarget(faq)} size="icon" variant="ghost" className="w-8 h-8 text-slate-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFaq ? t("advisor.editFaq") : t("advisor.addFaq")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.question")} *</label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder={t("advisor.questionPlaceholder")}
                className="bg-white/[0.04] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.questionAr")}</label>
              <Input
                value={form.questionAr}
                onChange={(e) => setForm({ ...form, questionAr: e.target.value })}
                placeholder={t("advisor.questionArPlaceholder")}
                className="bg-white/[0.04] border-white/10 text-white"
                dir="rtl"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.answer")} *</label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder={t("advisor.answerPlaceholder")}
                className="bg-white/[0.04] border-white/10 text-white min-h-[100px]"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.answerAr")}</label>
              <Textarea
                value={form.answerAr}
                onChange={(e) => setForm({ ...form, answerAr: e.target.value })}
                placeholder={t("advisor.answerArPlaceholder")}
                className="bg-white/[0.04] border-white/10 text-white min-h-[100px]"
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t("advisor.category")} *</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder={t("advisor.categoryPlaceholder")}
                  className="bg-white/[0.04] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t("advisor.categoryAr")}</label>
                <Input
                  value={form.categoryAr}
                  onChange={(e) => setForm({ ...form, categoryAr: e.target.value })}
                  placeholder={t("advisor.categoryArPlaceholder")}
                  className="bg-white/[0.04] border-white/10 text-white"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-white/20 bg-white/[0.04]"
              />
              <label htmlFor="isActive" className="text-sm text-slate-300">
                {t("advisor.publishFaq")}
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={createFaq.isPending || updateFaq.isPending} className="flex-1 bg-violet-600 hover:bg-violet-700">
                <Save className="w-4 h-4 me-2" />
                {editingFaq ? t("common.save") : t("common.create")}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/[0.07]">
                <X className="w-4 h-4 me-2" />{t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewFaq} onOpenChange={() => setViewFaq(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("advisor.faqDetail")}</DialogTitle>
          </DialogHeader>
          {viewFaq && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium px-2 py-0.5 rounded border bg-violet-500/15 text-violet-300 border-violet-500/20">{viewFaq.category}</span>
                {viewFaq.isActive ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-300 border-emerald-500/20">{t("advisor.published")}</span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded border bg-amber-500/15 text-amber-300 border-amber-500/20">{t("advisor.draft")}</span>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{t("advisor.question")}</p>
                <p className="text-sm text-white">{viewFaq.question}</p>
              </div>
              {viewFaq.questionAr && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t("advisor.questionAr")}</p>
                  <p className="text-sm text-white" dir="rtl">{viewFaq.questionAr}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-1">{t("advisor.answer")}</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{viewFaq.answer}</p>
              </div>
              {viewFaq.answerAr && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t("advisor.answerAr")}</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap" dir="rtl">{viewFaq.answerAr}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("advisor.confirmDeleteFaq")}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {deleteTarget?.question}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.07]">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteFaq.mutate(deleteTarget.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
