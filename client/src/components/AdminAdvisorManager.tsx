import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Mail,
  Shield,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export default function AdminAdvisorManager() {
  const { t } = useI18n();
  const [advisorSearch, setAdvisorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [expandedAdvisor, setExpandedAdvisor] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: advisorsData = [], isLoading: advisorsLoading } =
    trpc.admin.getAdvisorsWithStudents.useQuery();

  const { data: unassignedStudents = [], isLoading: unassignedLoading } =
    trpc.admin.getUnassignedStudents.useQuery();

  const assignMutation = trpc.admin.assignAdvisor.useMutation({
    onSuccess: () => {
      utils.admin.getAdvisorsWithStudents.invalidate();
      utils.admin.getUnassignedStudents.invalidate();
      utils.admin.dashboard.invalidate();
      toast.success("Assignment updated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update assignment");
    },
  });

  const filteredAdvisors = useMemo(() => {
    return advisorsData.filter(
      (a) =>
        !advisorSearch ||
        a.name?.toLowerCase().includes(advisorSearch.toLowerCase()) ||
        a.email.toLowerCase().includes(advisorSearch.toLowerCase())
    );
  }, [advisorsData, advisorSearch]);

  const filteredUnassigned = useMemo(() => {
    return unassignedStudents.filter(
      (s) =>
        !studentSearch ||
        s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [unassignedStudents, studentSearch]);

  const handleAssign = (studentId: number, advisorId: number | null) => {
    assignMutation.mutate({ studentId, advisorId });
  };

  return (
    <div className="space-y-6">
      {/* Advisors with Students */}
      <motion.div {...fadeInUp}>
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Advisors &amp; Assigned Students
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {filteredAdvisors.length} advisors,{" "}
                  {filteredAdvisors.reduce(
                    (acc, a) => acc + a.students.length,
                    0
                  )}{" "}
                  assigned students
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <Input
                  placeholder="Search advisors…"
                  value={advisorSearch}
                  onChange={(e) => setAdvisorSearch(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 w-full sm:w-56 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {advisorsLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-slate-800/50 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredAdvisors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Shield className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No advisors found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filteredAdvisors.map((advisor) => {
                  const isExpanded = expandedAdvisor === advisor.id;
                  return (
                    <div key={advisor.id}>
                      <button
                        onClick={() =>
                          setExpandedAdvisor(isExpanded ? null : advisor.id)
                        }
                        className="w-full grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {advisor.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || advisor.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-white truncate">
                            {advisor.name ?? "(No name)"}
                          </p>
                          <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {advisor.email}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {advisor.students.length} students
                        </Badge>
                        <div className="flex items-center justify-center w-8">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 pl-16">
                              {advisor.students.length === 0 ? (
                                <p className="text-sm text-slate-500 py-2">
                                  No students assigned to this advisor.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {advisor.students.map((student) => (
                                    <div
                                      key={student.id}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                                          <GraduationCap className="w-4 h-4 text-sky-400" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-white truncate">
                                            {student.name ?? "(No name)"}
                                          </p>
                                          <p className="text-xs text-slate-500 truncate">
                                            {student.email}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleAssign(student.id, null)
                                        }
                                        disabled={assignMutation.isPending}
                                        className="h-7 px-2 border-slate-700 bg-transparent hover:bg-rose-900/40 hover:border-rose-700 text-slate-400 hover:text-rose-400 text-xs shrink-0"
                                      >
                                        <UserX className="w-3.5 h-3.5 mr-1" />
                                        Unassign
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Unassigned Students */}
      <motion.div {...fadeInUp}>
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  Unassigned Students
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {filteredUnassigned.length} students without an advisor
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <Input
                  placeholder="Search students…"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 w-full sm:w-56 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {unassignedLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-slate-800/50 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredUnassigned.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <UserCheck className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">
                  All students have an assigned advisor
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filteredUnassigned.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 px-6 py-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {student.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || student.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {student.name ?? "(No name)"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {student.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        onValueChange={(val) =>
                          handleAssign(student.id, Number(val))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-slate-800 border-slate-700 w-44">
                          <SelectValue placeholder="Assign advisor…" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {advisorsData.map((advisor) => (
                            <SelectItem
                              key={advisor.id}
                              value={String(advisor.id)}
                              className="text-xs"
                            >
                              {advisor.name ?? advisor.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
