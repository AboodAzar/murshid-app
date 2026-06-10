import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileUp,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function AdvisorDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "",
  });
  const utils = trpc.useUtils();
  const { data: faqsResult } = trpc.faqs.list.useQuery({ limit: 100 });
  const { data: documentsResult } = trpc.documents.list.useQuery({ limit: 100 });
  const faqs = faqsResult?.data ?? [];
  const documents = documentsResult?.data ?? [];
  const createFaq = trpc.faqs.create.useMutation({
    onSuccess: () => utils.faqs.list.invalidate(),
  });
  const deleteFaq = trpc.faqs.delete.useMutation({
    onSuccess: () => utils.faqs.list.invalidate(),
  });
  const uploadDocument = trpc.documents.upload.useMutation({
    onSuccess: () => utils.documents.list.invalidate(),
  });
  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => utils.documents.list.invalidate(),
  });

  const handleAddFAQ = () => {
    if (faqForm.question && faqForm.answer && faqForm.category) {
      createFaq.mutate({
        question: faqForm.question,
        questionAr: faqForm.question,
        answer: faqForm.answer,
        answerAr: faqForm.answer,
        category: faqForm.category,
        categoryAr: faqForm.category,
      });
      setFaqForm({ question: "", answer: "", category: "" });
      setShowFaqForm(false);
    }
  };

  const handleDeleteFAQ = (id: number) => {
    deleteFaq.mutate(id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result ?? "");
          const fileContent = result.includes(",") ? result.split(",")[1] : result;
          const extension = file.name.split(".").pop()?.toLowerCase();
          const fileType =
            extension === "pdf" || extension === "csv"
              ? extension
              : "pdf";
          uploadDocument.mutate({
            title: file.name,
            fileContent,
            fileType,
            category: "general",
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (!user || user.role !== "advisor") return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold">{t("advisor.dashboard")}</h1>
          <p className="text-slate-500">
            {t("advisor.overview")}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              label: t("advisor.totalFAQs"),
              value: faqs.length,
              icon: MessageSquare,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: t("advisor.documents"),
              value: documents.length,
              icon: FileUp,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: t("advisor.students"),
              value: "45",
              icon: Users,
              color: "from-green-500 to-emerald-500",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} p-2 opacity-80`}
                      >
                        <Icon className="w-full h-full text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          <Tabs defaultValue="faqs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="faqs">{t("advisor.manageFAQs")}</TabsTrigger>
              <TabsTrigger value="documents">
                {t("advisor.uploadDocuments")}
              </TabsTrigger>
              <TabsTrigger value="conversations">
                {t("advisor.reviewConversations")}
              </TabsTrigger>
            </TabsList>

            {/* FAQs Tab */}
            <TabsContent value="faqs" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{t("advisor.manageFAQs")}</CardTitle>
                      <CardDescription>
                        Create and manage frequently asked questions
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowFaqForm(!showFaqForm)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("advisor.createFAQ")}
                    </Button>
                  </CardHeader>

                  {showFaqForm && (
                    <CardContent className="space-y-4 border-t border-slate-700 pt-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("advisor.question")}
                        </label>
                        <Input
                          placeholder="Enter question..."
                          value={faqForm.question}
                          onChange={e =>
                            setFaqForm({ ...faqForm, question: e.target.value })
                          }
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("advisor.answer")}
                        </label>
                        <Textarea
                          placeholder="Enter answer..."
                          value={faqForm.answer}
                          onChange={e =>
                            setFaqForm({ ...faqForm, answer: e.target.value })
                          }
                          className="bg-slate-700 border-slate-600 min-h-32"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("advisor.category")}
                        </label>
                        <Input
                          placeholder="e.g., Course Planning, Graduation, Fees"
                          value={faqForm.category}
                          onChange={e =>
                            setFaqForm({ ...faqForm, category: e.target.value })
                          }
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddFAQ}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {t("common.save")}
                        </Button>
                        <Button
                          onClick={() => setShowFaqForm(false)}
                          variant="outline"
                          className="border-slate-600"
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </CardContent>
                  )}

                  <CardContent className="space-y-3 pt-6">
                    {faqs.length > 0 ? (
                      faqs.map(faq => (
                        <div
                          key={faq.id}
                          className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-semibold">{faq.question}</p>
                              <p className="text-sm text-slate-400 mt-1">
                                {faq.answer}
                              </p>
                              <span className="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                {faq.category}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                                <Edit2 className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteFAQ(faq.id)}
                                className="p-2 hover:bg-slate-600 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-8">
                        {t("common.noResults")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("advisor.uploadDocuments")}</CardTitle>
                    <CardDescription>
                      Upload university documents to train the AI knowledge base
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <FileUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="font-semibold mb-1">
                        {t("advisor.uploadFile")}
                      </p>
                      <p className="text-sm text-slate-400 mb-4">
                        PDF or CSV files
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.csv"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          asChild
                          className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        >
                          <span>{t("common.add")}</span>
                        </Button>
                      </label>
                    </div>

                    {/* Documents List */}
                    {documents.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">
                          {t("common.recentFiles")}
                        </h3>
                        {documents.map(doc => (
                          <div
                            key={doc.id}
                            className="p-4 bg-slate-700/50 rounded-lg flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-sm text-slate-400">
                                {doc.fileType} •{" "}
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteDocument.mutate(doc.id)}
                              className="p-2 hover:bg-slate-600 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Conversations Tab */}
            <TabsContent value="conversations" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("advisor.reviewConversations")}</CardTitle>
                    <CardDescription>
                      Review AI conversations with students
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">
                                Student Conversation #{i}
                              </p>
                              <p className="text-sm text-slate-400">
                                Today at 2:30 PM
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                              Resolved
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">
                            "How do I choose electives for next semester?"
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
