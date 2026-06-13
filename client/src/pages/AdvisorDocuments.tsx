import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  FolderOpen,
  Search,
  ExternalLink,
  AlertTriangle,
  FileText,
  File,
  Plus,
  Trash2,
  UploadCloud,
  X,
  CheckCircle2,
  Loader2,
  Globe,
  Link2,
  BookOpen,
  RotateCw,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

const fileIconColors: Record<string, string> = {
  pdf: "text-red-400 bg-red-500/15",
  csv: "text-emerald-400 bg-emerald-500/15",
  doc: "text-blue-400 bg-blue-500/15",
  docx: "text-blue-400 bg-blue-500/15",
  link: "text-violet-400 bg-violet-500/15",
  default: "text-slate-400 bg-slate-500/15",
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  true: { label: "Indexed", color: "text-emerald-300", bg: "bg-emerald-500/15", icon: CheckCircle2 },
  false: { label: "Processing", color: "text-amber-300", bg: "bg-amber-500/15", icon: Loader2 },
};

export default function AdvisorDocuments() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", category: "", file: null as File | null });
  const [linkForm, setLinkForm] = useState({ title: "", category: "", url: "", indexForAI: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: docsData, isLoading, error } = trpc.documents.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.documents.getStats.useQuery();
  const { data: officialResources, isLoading: officialLoading } = trpc.documents.getOfficialResources.useQuery();

  const uploadDoc = trpc.documents.upload.useMutation({
    onSuccess: (data) => {
      utils.documents.list.invalidate();
      utils.documents.getStats.invalidate();
      setShowUpload(false);
      setUploadForm({ title: "", category: "", file: null });
      if (data.warning) toast.warning(data.warning);
      else toast.success(t("advisor.documentUploaded") || "Document uploaded successfully");
    },
    onError: (err) => toast.error(err.message || t("errors.serverError")),
  });

  const deleteDoc = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      utils.documents.getStats.invalidate();
      utils.documents.getOfficialResources.invalidate();
      setDeleteTarget(null);
      toast.success(t("advisor.documentDeleted") || "Document deleted successfully");
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const importResource = trpc.documents.importOfficialResource.useMutation({
    onSuccess: (data) => {
      utils.documents.list.invalidate();
      utils.documents.getStats.invalidate();
      utils.documents.getOfficialResources.invalidate();
      if (data.alreadyImported) toast.info(t("advisor.alreadyImported") || "Already imported");
      else toast.success(t("advisor.resourceImported") || "Resource imported successfully");
    },
    onError: (err) => toast.error(err.message || t("errors.serverError")),
  });

  const addLink = trpc.documents.addOfficialLink.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      utils.documents.getStats.invalidate();
      setShowAddLink(false);
      setLinkForm({ title: "", category: "", url: "", indexForAI: false });
      toast.success(t("advisor.linkAdded") || "Official link added successfully");
    },
    onError: (err) => toast.error(err.message || t("errors.serverError")),
  });

  const retryIndexing = trpc.documents.retryDocumentIndexing.useMutation({
    onSuccess: (data) => {
      utils.documents.list.invalidate();
      utils.documents.getStats.invalidate();
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const documents = docsData?.data ?? [];

  const fileTypes = useMemo(() => {
    const types = new Set(documents.map((d: any) => d.fileType));
    return Array.from(types);
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((doc: any) => {
      const matchesSearch =
        !search ||
        doc.title?.toLowerCase().includes(search.toLowerCase()) ||
        doc.category?.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === "all" || doc.fileType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [documents, search, selectedType]);

  const officialAvailable = officialResources?.filter((r: any) => !r.isImported) ?? [];

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString(); } catch { return dateStr; }
  };

  const handleFileSelect = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "csv", "docx"];
    if (!ext || !allowed.includes(ext)) {
      toast.error(t("advisor.invalidFileType") || "Only PDF, CSV, and DOCX files are allowed");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("advisor.fileTooLarge") || "File must be under 20MB");
      return;
    }
    setUploadForm((prev) => ({ ...prev, file, title: prev.title || file.name.replace(/\.[^/.]+$/, "") }));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title.trim() || !uploadForm.category.trim()) {
      toast.error(t("advisor.fillRequiredFields") || "Please fill all required fields and select a file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      const ext = uploadForm.file!.name.split(".").pop()?.toLowerCase() as "pdf" | "csv" | "docx";
      uploadDoc.mutate({ title: uploadForm.title.trim(), fileContent: base64, fileType: ext, category: uploadForm.category.trim() });
    };
    reader.readAsDataURL(uploadForm.file);
  };

  const handleAddLink = () => {
    if (!linkForm.title.trim() || !linkForm.category.trim() || !linkForm.url.trim()) {
      toast.error(t("advisor.fillRequiredFields") || "Please fill all required fields");
      return;
    }
    addLink.mutate({ title: linkForm.title.trim(), category: linkForm.category.trim(), url: linkForm.url.trim(), indexForAI: linkForm.indexForAI });
  };

  const statCards = [
    { label: t("advisor.totalDocuments"), value: stats?.total ?? 0, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/15" },
    { label: t("advisor.indexedDocuments"), value: stats?.indexed ?? 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15" },
    { label: t("advisor.processingDocuments"), value: stats?.processing ?? 0, icon: Loader2, color: "text-amber-400", bg: "bg-amber-500/15" },
    { label: t("advisor.failedDocuments"), value: stats?.failed ?? 0, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/15" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <motion.div {...fadeInUp} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-emerald-400" />
              {t("advisor.documents")}
            </h1>
            <p className="text-slate-400 mt-1 max-w-xl">
              {t("advisor.documentsDesc")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddLink(true)} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/[0.07]">
              <Link2 className="w-4 h-4 me-2" />
              {t("advisor.addOfficialLink")}
            </Button>
            <Button onClick={() => setShowUpload(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 me-2" />
              {t("advisor.uploadDocument")}
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
              placeholder={t("advisor.searchDocuments")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          {fileTypes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedType === "all"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.07]"
                }`}
              >
                {t("common.all")}
              </button>
              {fileTypes.map((type: string) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedType === type
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.07]"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Section A: My Documents */}
        <motion.div {...fadeInUp} className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {t("advisor.myDocuments") || "My Documents"}
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <motion.div {...fadeInUp} className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-red-200 font-medium">{t("errors.serverError")}</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">{t("advisor.noDocumentsYet") || "No uploaded or imported documents yet."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((doc: any) => {
                  const iconColor = fileIconColors[doc.fileType] || fileIconColors.default;
                  const status = statusConfig[String(doc.isProcessed)] || statusConfig.false;
                  const StatusIcon = status.icon;
                  const isLink = doc.fileType === "link";
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl flex items-center gap-4 group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
                        {isLink ? <Globe className="w-5 h-5" /> : <File className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white truncate max-w-[90px] sm:max-w-none">{doc.title}</h3>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-white/[0.06] text-slate-300 border-white/10 uppercase shrink-0">
                            {doc.fileType}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-300 border-emerald-500/20 shrink-0">
                            {doc.category}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${status.bg} ${status.color} border-white/10 flex items-center gap-1 shrink-0`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{t("advisor.uploadedOn")} {formatDate(doc.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-blue-300 hover:bg-white/[0.1] border border-white/10 transition-colors shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t("advisor.openDocument")}</span>
                          </a>
                        )}
                        {!doc.isProcessed && (
                          <Button
                            onClick={() => retryIndexing.mutate(doc.id)}
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 text-slate-400 hover:text-amber-400 shrink-0"
                            title={t("advisor.retryIndexing") || "Retry indexing"}
                          >
                            <RotateCw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => setDeleteTarget(doc)}
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Section B: Official Faculty Resources */}
        <motion.div {...fadeInUp}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-violet-400" />
            {t("advisor.officialFacultyResources") || "Official Faculty Resources"}
            <span className="text-xs font-normal text-slate-500 ms-2">({officialAvailable.length} {t("advisor.available") || "available"})</span>
          </h2>
          {officialLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 h-40 animate-pulse" />
              ))}
            </div>
          ) : officialAvailable.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">{t("advisor.allResourcesImported") || "All official resources have been imported."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {officialAvailable.map((res: any) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl flex flex-col"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white line-clamp-2">{res.title}</h3>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-violet-500/15 text-violet-300 border-violet-500/20 mt-1 inline-block">
                          {res.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-3 flex-1">{res.description}</p>
                    <div className="text-[10px] text-slate-500 mb-3 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {t("advisor.officialUniversitySource") || "Official University Source"}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-blue-300 hover:bg-white/[0.1] border border-white/10 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t("advisor.openLink") || "Open Link"}
                      </a>
                      <Button
                        onClick={() => importResource.mutate({ resourceId: res.id, indexForAI: false })}
                        disabled={importResource.isPending}
                        variant="outline"
                        className="flex-1 border-white/10 text-slate-300 hover:bg-white/[0.07] text-xs py-2"
                      >
                        {t("advisor.import") || "Import"}
                      </Button>
                      <Button
                        onClick={() => importResource.mutate({ resourceId: res.id, indexForAI: true })}
                        disabled={importResource.isPending}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-xs py-2"
                      >
                        {t("advisor.importAndIndex") || "Import & Index"}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upload Modal */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("advisor.uploadDocument")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-white/20 bg-white/[0.04] hover:bg-white/[0.07]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">
                {uploadForm.file ? uploadForm.file.name : t("advisor.dragDropFile")}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t("advisor.supportedFormats") || "PDF, CSV, DOCX — Max 20MB"}
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.documentTitle")} *</label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder={t("advisor.documentTitlePlaceholder")}
                className="bg-white/[0.04] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.documentCategory")} *</label>
              <Input
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                placeholder={t("advisor.documentCategoryPlaceholder")}
                className="bg-white/[0.04] border-white/10 text-white"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUpload}
                disabled={uploadDoc.isPending || !uploadForm.file}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {uploadDoc.isPending ? (
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4 me-2" />
                )}
                {t("advisor.upload")}
              </Button>
              <Button onClick={() => setShowUpload(false)} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/[0.07]">
                <X className="w-4 h-4 me-2" />{t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Official Link Modal */}
      <Dialog open={showAddLink} onOpenChange={setShowAddLink}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("advisor.addOfficialLink")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.documentTitle")} *</label>
              <Input
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                placeholder={t("advisor.documentTitlePlaceholder")}
                className="bg-white/[0.04] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.documentCategory")} *</label>
              <Input
                value={linkForm.category}
                onChange={(e) => setLinkForm({ ...linkForm, category: e.target.value })}
                placeholder={t("advisor.documentCategoryPlaceholder")}
                className="bg-white/[0.04] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t("advisor.officialUrl") || "Official URL"} *</label>
              <Input
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                placeholder="https://www.zuj.edu.jo/..."
                className="bg-white/[0.04] border-white/10 text-white"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {t("advisor.allowedDomains") || "Only zuj.edu.jo URLs are allowed"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="indexForAI"
                checked={linkForm.indexForAI}
                onChange={(e) => setLinkForm({ ...linkForm, indexForAI: e.target.checked })}
                className="rounded border-white/20 bg-white/[0.04]"
              />
              <label htmlFor="indexForAI" className="text-sm text-slate-300">
                {t("advisor.indexForAI") || "Index for AI knowledge base"}
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddLink} disabled={addLink.isPending} className="flex-1 bg-violet-600 hover:bg-violet-700">
                {addLink.isPending ? (
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4 me-2" />
                )}
                {t("common.add")}
              </Button>
              <Button onClick={() => setShowAddLink(false)} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/[0.07]">
                <X className="w-4 h-4 me-2" />{t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("advisor.confirmDeleteDocument")}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {deleteTarget?.title}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.07]">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteDoc.mutate(deleteTarget.id)}
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
