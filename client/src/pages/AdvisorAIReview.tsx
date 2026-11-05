import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Users, ChevronRight, Bot, User } from "lucide-react";

const fadeInUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export default function AdvisorAIReview() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const { data: students = [] } = trpc.advisor.getAssignedStudents.useQuery();
  const { data: conversations = [], isLoading } = trpc.advisor.getStudentConversations.useQuery(
    { studentId: selectedStudentId! }, { enabled: !!selectedStudentId }
  );

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <motion.div {...fadeInUp}>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-emerald-400" />
            {t("advisor.aiConversationReview")}
          </h1>
          <p className="text-slate-400 mt-1">{t("advisor.aiReviewDesc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <motion.div {...fadeInUp} className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl h-fit">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-slate-400" />{t("advisor.myStudents")}</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {students.map((s: any) => (
                <button key={s.id} onClick={() => { setSelectedStudentId(s.id); setSelectedConversation(null); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-start transition-colors ${selectedStudentId === s.id ? "bg-emerald-600/20 border border-emerald-500/30" : "bg-white/[0.04] hover:bg-white/[0.07]"}`}>
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center"><User className="w-4 h-4 text-slate-300" /></div>
                  <span className="text-sm font-medium text-white">{s.name || s.email}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 ms-auto rtl:rotate-180" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Conversations */}
          <motion.div {...fadeInUp} className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            {!selectedStudentId ? (
              <div className="text-center py-16">
                <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">{t("advisor.selectStudentToReview")}</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />)}</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16">
                <Bot className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">{t("advisor.noConversations")}</p>
              </div>
            ) : !selectedConversation ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400 mb-2">{conversations.length} {t("advisor.conversations")}</h3>
                {conversations.map((c: any) => (
                  <div key={c.id} onClick={() => setSelectedConversation(c)}
                    className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{c.title || t("advisor.untitledConversation")}</p>
                      <span className="text-xs text-slate-500">{new Date(c.updatedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{c.messages?.length || 0} {t("advisor.messages")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setSelectedConversation(null)} className="text-sm text-emerald-400 hover:text-emerald-300">← {t("common.back")}</button>
                <h3 className="text-lg font-semibold text-white">{selectedConversation.title || t("advisor.untitledConversation")}</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pe-2">
                  {selectedConversation.messages?.map((msg: any, idx: number) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "" : ""}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-emerald-500/15" : "bg-emerald-500/15"}`}>
                        {msg.role === "user" ? <User className="w-3.5 h-3.5 text-emerald-400" /> : <Bot className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className={`p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-white/[0.04] text-white" : "bg-emerald-500/5 text-slate-200 border border-emerald-500/10"}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
