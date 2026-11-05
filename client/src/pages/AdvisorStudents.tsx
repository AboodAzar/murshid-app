import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { formatUniversityId, formatGpaDisplay } from "@/lib/academicUtils";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  GraduationCap,
  Mail,
  ChevronRight,
  Search,
  UserCheck,
  IdCard,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export default function AdvisorStudents() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const { data: students, isLoading } = trpc.advisor.getAssignedStudents.useQuery();

  const studentList = students ?? [];
  const filtered = studentList.filter(
    (s: any) =>
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <motion.div
          {...fadeInUp}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              {t("advisor.myStudents")}
            </h1>
            <p className="text-slate-400 mt-1">
              {t("advisor.assignedStudentsDesc")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <UserCheck className="w-5 h-5" />
            <span className="text-sm">
              {filtered.length} {t("advisor.students")}
            </span>
          </div>
        </motion.div>

        <motion.div {...fadeInUp} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t("advisor.searchStudents")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 h-32 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            {...fadeInUp}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-12 text-center"
          >
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">
              {t("advisor.noStudentsAssigned")}
            </h3>
            <p className="text-slate-400 mt-2">
              {t("advisor.contactAdminToAssign")}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((student: any, index: number) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl hover:bg-white/[0.07] transition-colors cursor-pointer"
                onClick={() => {
                  localStorage.setItem("advisorSelectedStudentId", String(student.id));
                  window.location.href = "/dashboard";
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {student.name || t("common.unnamed")}
                        </h3>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <IdCard className="w-3 h-3" />
                          <span>{formatUniversityId(student)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{student.email}</span>
                      </div>
                      {student.gpa && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {formatGpaDisplay(student.gpa).primaryScore}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatGpaDisplay(student.gpa).secondaryScale}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors rtl:rotate-180" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
