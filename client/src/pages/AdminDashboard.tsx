import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  BookOpen,
  MessageSquare,
  Search,
  Shield,
  GraduationCap,
  UserCheck,
  UserX,
  Edit3,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  MoreVertical,
  TrendingUp,
  Activity,
  Database,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Logo from "@/components/Logo";
import DashboardLayout from "@/components/DashboardLayout";
import AdminAdvisorManager from "@/components/AdminAdvisorManager";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/* ─────────────────────────── helpers ─────────────────────────── */

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const analyticsData = [
  { month: "Jan", students: 120, advisors: 8, conversations: 450 },
  { month: "Feb", students: 135, advisors: 9, conversations: 520 },
  { month: "Mar", students: 155, advisors: 10, conversations: 680 },
  { month: "Apr", students: 180, advisors: 12, conversations: 820 },
  { month: "May", students: 210, advisors: 14, conversations: 950 },
  { month: "Jun", students: 245, advisors: 15, conversations: 1100 },
];

const aiStatsData = [
  { date: "Mon", avgResponseTime: 2.3, accuracy: 94 },
  { date: "Tue", avgResponseTime: 2.1, accuracy: 95 },
  { date: "Wed", avgResponseTime: 2.4, accuracy: 93 },
  { date: "Thu", avgResponseTime: 2.0, accuracy: 96 },
  { date: "Fri", avgResponseTime: 2.2, accuracy: 94 },
  { date: "Sat", avgResponseTime: 2.5, accuracy: 92 },
  { date: "Sun", avgResponseTime: 2.3, accuracy: 95 },
];

type Role = "student" | "advisor" | "admin";
type FilterRole = Role | "all";

interface UserRow {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: Date;
  lastSignedIn?: Date;
  isEmailVerified?: boolean;
  phone?: string | null;
  bio?: string | null;
  advisorId?: number | null;
  departmentId?: number | null;
}

const roleMeta: Record<Role, { label: string; color: string; icon: React.ReactNode }> = {
  admin: {
    label: "Admin",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: <Shield className="w-3 h-3" />,
  },
  advisor: {
    label: "Advisor",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    icon: <UserCheck className="w-3 h-3" />,
  },
  student: {
    label: "Student",
    color: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    icon: <GraduationCap className="w-3 h-3" />,
  },
};

function formatDate(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

const avatarGradients = [
  "from-sky-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

function getAvatarGradient(id: number) {
  return avatarGradients[id % avatarGradients.length];
}

/* ─────────────────────────── component ─────────────────────────── */

export default function AdminDashboard() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();

  // ── state ──────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: UserRow;
    newRole: Role;
  } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    user: UserRow;
    newStatus: boolean;
  } | null>(null);

  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserRow | null>(null);

  const [editForm, setEditForm] = useState<{ name: string; role: Role }>({
    name: "",
    role: "student",
  });

  const [announcementForm, setAnnouncementForm] = useState({
    id: 0,
    title: "",
    titleAr: "",
    content: "",
    contentAr: "",
  });

  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return ["users", "advisors", "courses", "content", "analytics", "aiStats", "reports"].includes(hash) ? hash : "users";
  });

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["users", "advisors", "courses", "content", "analytics", "aiStats", "reports"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // ── queries ────────────────────────────────────────────
  const utils = trpc.useUtils();
  const { data: dashboard, isLoading } = trpc.admin.dashboard.useQuery();
  const { data: announcements = [] } = trpc.announcements.list.useQuery();
  const { data: coursesData } = trpc.courses.list.useQuery({ limit: 100 });
  const { data: faqsData } = trpc.faqs.list.useQuery({ limit: 100 });
  const { data: advisorInsights } = trpc.analytics.advisorInsights.useQuery();

  const users = useMemo(() => (dashboard?.users ?? []) as UserRow[], [dashboard]);
  const stats = dashboard?.stats;

  const advisorMap = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach(u => {
      if (u.role === "advisor") {
        map.set(u.id, u.name ?? u.email);
      }
    });
    return map;
  }, [users]);

  // ── mutations ──────────────────────────────────────────
  const updateUser = trpc.admin.updateUser.useMutation({
    onMutate: async ({ id, role, isActive, name }) => {
      // Optimistic update
      await utils.admin.dashboard.cancel();
      const prev = utils.admin.dashboard.getData();
      utils.admin.dashboard.setData(undefined, old => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.map(u =>
            u.id === id
              ? {
                  ...u,
                  ...(role !== undefined ? { role } : {}),
                  ...(isActive !== undefined ? { isActive } : {}),
                  ...(name !== undefined ? { name } : {}),
                }
              : u
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) utils.admin.dashboard.setData(undefined, context.prev);
      toast.error("Update failed. Please try again.");
    },
    onSuccess: () => {
      utils.admin.dashboard.invalidate();
    },
  });

  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      toast.success("Announcement created!");
    },
  });
  const updateAnnouncement = trpc.announcements.update.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      toast.success("Announcement updated!");
    },
  });
  const deleteAnnouncement = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      toast.success("Announcement deleted.");
    },
  });

  const deleteUser = trpc.admin.deleteUser.useMutation({
    onMutate: async ({ id }) => {
      await utils.admin.dashboard.cancel();
      const prev = utils.admin.dashboard.getData();
      utils.admin.dashboard.setData(undefined, old => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.filter(u => u.id !== id),
        };
      });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) utils.admin.dashboard.setData(undefined, context.prev);
      toast.error(err.message ?? "Delete failed. Please try again.");
    },
    onSuccess: (_data, vars) => {
      utils.admin.dashboard.invalidate();
      toast.success("User deleted successfully.");
      setPendingDeleteUser(null);
    },
  });

  // ── filtered users ─────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = `${u.name ?? ""} ${u.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? u.isActive : !u.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // ── handlers ──────────────────────────────────────────
  const openEdit = (u: UserRow) => {
    setSelectedUser(u);
    setEditForm({ name: u.name ?? "", role: u.role });
    setEditModalOpen(true);
  };

  const openDetails = (u: UserRow) => {
    setSelectedUser(u);
    setDetailsModalOpen(true);
  };

  const confirmEdit = () => {
    if (!selectedUser) return;
    updateUser.mutate(
      { id: selectedUser.id, name: editForm.name, role: editForm.role },
      {
        onSuccess: () => {
          toast.success(`Updated ${editForm.name || selectedUser.email}`);
          setEditModalOpen(false);
        },
      }
    );
  };

  const confirmRoleChange = () => {
    if (!pendingRoleChange) return;
    const { user, newRole } = pendingRoleChange;
    updateUser.mutate(
      { id: user.id, role: newRole },
      {
        onSuccess: () => {
          toast.success(
            `${user.name ?? user.email} is now ${roleMeta[newRole].label}`
          );
        },
      }
    );
    setPendingRoleChange(null);
  };

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;
    const { user, newStatus } = pendingStatusChange;
    updateUser.mutate(
      { id: user.id, isActive: newStatus },
      {
        onSuccess: () => {
          toast.success(
            `${user.name ?? user.email} is now ${newStatus ? "active" : "inactive"}`
          );
        },
      }
    );
    setPendingStatusChange(null);
  };

  const confirmDelete = () => {
    if (!pendingDeleteUser || !currentUser) return;
    deleteUser.mutate({ id: pendingDeleteUser.id, requesterId: currentUser.id });
  };

  const saveAnnouncement = () => {
    const payload = {
      title: announcementForm.title,
      titleAr: announcementForm.titleAr || announcementForm.title,
      content: announcementForm.content,
      contentAr: announcementForm.contentAr || announcementForm.content,
      priority: "medium" as const,
      targetRole: "all" as const,
      isActive: true,
    };
    if (announcementForm.id) {
      updateAnnouncement.mutate({ id: announcementForm.id, ...payload });
    } else {
      createAnnouncement.mutate(payload);
    }
    setAnnouncementForm({ id: 0, title: "", titleAr: "", content: "", contentAr: "" });
  };

  if (!currentUser || currentUser.role !== "admin") return null;

  /* ── render ────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* ── Header ── */}
        <motion.div {...fadeInUp} className="space-y-1">
          <div className="flex items-center gap-3">
            <Logo size={40} className="rounded-xl shadow-lg shadow-indigo-500/20" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {t("admin.dashboard")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("admin.systemOverview")}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Key Metrics ── */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {[
            {
              label: t("admin.totalUsers"),
              value: stats?.totalUsers ?? 0,
              icon: Users,
              gradient: "from-sky-500 to-indigo-600",
              glow: "shadow-sky-500/20",
            },
            {
              label: t("admin.totalStudents"),
              value: stats?.totalStudents ?? 0,
              icon: GraduationCap,
              gradient: "from-violet-500 to-purple-600",
              glow: "shadow-violet-500/20",
            },
            {
              label: t("admin.totalAdvisors"),
              value: stats?.totalAdvisors ?? 0,
              icon: UserCheck,
              gradient: "from-emerald-500 to-teal-600",
              glow: "shadow-emerald-500/20",
            },
            {
              label: t("admin.totalCourses"),
              value: stats?.totalCourses ?? 0,
              icon: BookOpen,
              gradient: "from-amber-500 to-orange-600",
              glow: "shadow-amber-500/20",
            },
            {
              label: t("admin.aiConversations"),
              value: stats?.totalDocuments ?? 0,
              icon: MessageSquare,
              gradient: "from-rose-500 to-pink-600",
              glow: "shadow-rose-500/20",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="bg-card border-border hover:border-border/80 transition-colors overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold">
                          {isLoading ? (
                            <span className="inline-block w-10 h-7 bg-slate-800 rounded animate-pulse" />
                          ) : (
                            stat.value
                          )}
                        </p>
                      </div>
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.glow}`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Main Tabs ── */}
        <motion.div initial="initial" animate="animate" variants={stagger}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 bg-slate-900/70 border border-border rounded-xl p-1 mb-6">
              {[
                { value: "users", label: t("admin.userManagement"), icon: Users },
                { value: "advisors", label: "Advisors", icon: UserCheck },
                { value: "courses", label: "Courses", icon: BookOpen },
                { value: "content", label: "Content", icon: MessageSquare },
                { value: "analytics", label: t("admin.analytics"), icon: TrendingUp },
                { value: "aiStats", label: t("admin.aiStatistics"), icon: Activity },
                { value: "reports", label: "Reports", icon: Database },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline text-xs">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* ══ USER MANAGEMENT TAB ══ */}
            <TabsContent value="users" className="space-y-5">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-900/70 border-border">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          {t("admin.userManagement")}
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                          {filteredUsers.length} of {users.length} users
                        </CardDescription>
                      </div>

                      {/* Search + Filters */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <div className="relative">
                          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            placeholder="Search by name or email…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="ps-9 bg-accent border-border w-full sm:w-56 text-sm"
                          />
                        </div>

                        <Select
                          value={roleFilter}
                          onValueChange={v => setRoleFilter(v as FilterRole)}
                        >
                          <SelectTrigger className="bg-accent border-border w-full sm:w-36 text-sm">
                            <Filter className="w-3.5 h-3.5 me-1 text-muted-foreground" />
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent className="bg-accent border-border">
                            <SelectItem value="all">All roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="advisor">Advisor</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={statusFilter}
                          onValueChange={v =>
                            setStatusFilter(v as "all" | "active" | "inactive")
                          }
                        >
                          <SelectTrigger className="bg-accent border-border w-full sm:w-36 text-sm">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-accent border-border">
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* Table header */}
                    <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-2.5 border-t border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <span />
                      <span>User</span>
                      <span className="text-center w-24">Role</span>
                      <span className="text-center w-24">Status</span>
                      <span className="text-center w-20">Actions</span>
                      <span className="text-center w-8" />
                    </div>

                    <AnimatePresence>
                      {isLoading ? (
                        <div className="p-6 space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="h-16 rounded-xl bg-accent/50 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                        >
                          <Users className="w-10 h-10 mb-3 opacity-30" />
                          <p className="text-sm">No users match your search</p>
                        </motion.div>
                      ) : (
                        <div className="divide-y divide-border/60">
                          {filteredUsers.map(u => {
                            const meta = roleMeta[u.role];
                            return (
                              <motion.div
                                key={u.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 sm:gap-4 px-6 py-4 hover:bg-accent/30 transition-colors"
                              >
                                {/* Avatar */}
                                <div
                                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(u.id)} flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm`}
                                >
                                  {getInitials(u.name, u.email)}
                                </div>

                                {/* User info */}
                                <div className="min-w-0">
                                  <p className="font-medium text-sm text-white truncate">
                                    {u.name ?? "(No name)"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {u.email}
                                  </p>
                                  {u.role === "student" && u.advisorId && (
                                    <p className="text-[10px] text-emerald-400 truncate mt-0.5">
                                      Advisor: {advisorMap.get(u.advisorId) ?? "Unknown"}
                                    </p>
                                  )}
                                  {u.role === "student" && !u.advisorId && (
                                    <p className="text-[10px] text-amber-400 truncate mt-0.5">
                                      No advisor assigned
                                    </p>
                                  )}
                                </div>

                                {/* Role badge */}
                                <div className="flex sm:justify-center">
                                  <Select
                                    value={u.role}
                                    onValueChange={val => {
                                      if (val === u.role) return;
                                      setPendingRoleChange({
                                        user: u,
                                        newRole: val as Role,
                                      });
                                    }}
                                  >
                                    <SelectTrigger
                                      className={`h-7 text-xs border px-2 gap-1.5 w-28 ${meta.color} bg-transparent hover:bg-white/5`}
                                    >
                                      {meta.icon}
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-accent border-border">
                                      <SelectItem value="student">Student</SelectItem>
                                      <SelectItem value="advisor">Advisor</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Status toggle */}
                                <div className="flex sm:justify-center">
                                  <button
                                    onClick={() =>
                                      setPendingStatusChange({
                                        user: u,
                                        newStatus: !u.isActive,
                                      })
                                    }
                                    className={`flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border transition-all hover:scale-105 ${
                                      u.isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                        : "bg-slate-500/10 text-muted-foreground border-slate-500/30 hover:bg-slate-500/20"
                                    }`}
                                  >
                                    {u.isActive ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                      <XCircle className="w-3 h-3" />
                                    )}
                                    {u.isActive ? "Active" : "Inactive"}
                                  </button>
                                </div>

                                {/* Actions */}
                                <div className="flex sm:justify-center gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDetails(u)}
                                    className="h-7 w-7 p-0 border-slate-700 bg-transparent hover:bg-accent text-muted-foreground hover:text-white"
                                    title="View details"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => openEdit(u)}
                                    className="h-7 w-7 p-0 bg-indigo-600 hover:bg-indigo-500 text-white"
                                    title="Edit user"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>

                                {/* Delete */}
                                <div className="flex sm:justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setPendingDeleteUser(u)}
                                    disabled={u.id === currentUser?.id}
                                    className="h-7 w-7 p-0 border-slate-700 bg-transparent hover:bg-rose-900/40 hover:border-rose-700 text-muted-foreground hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title={
                                      u.id === currentUser?.id
                                        ? "Cannot delete your own account"
                                        : "Delete user"
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ══ ADVISORS TAB ══ */}
            <TabsContent value="advisors" className="space-y-5">
              <AdminAdvisorManager />
            </TabsContent>

            {/* ══ ANALYTICS TAB ══ */}
            <TabsContent value="analytics" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-900/70 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      Platform Growth
                    </CardTitle>
                    <CardDescription>User and conversation trends over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="students" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="advisors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#94a3b8" }} />
                        <YAxis stroke="#475569" tick={{ fill: "#94a3b8" }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                          labelStyle={{ color: "#e2e8f0" }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="students" stroke="#6366f1" fill="url(#students)" strokeWidth={2} />
                        <Area type="monotone" dataKey="advisors" stroke="#8b5cf6" fill="url(#advisors)" strokeWidth={2} />
                        <Bar dataKey="conversations" fill="#06b6d4" opacity={0.7} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ══ AI STATISTICS TAB ══ */}
            <TabsContent value="aiStats" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-900/70 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      {t("admin.aiStatistics")}
                    </CardTitle>
                    <CardDescription>AI response performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={aiStatsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#94a3b8" }} />
                        <YAxis stroke="#475569" tick={{ fill: "#94a3b8" }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                          labelStyle={{ color: "#e2e8f0" }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="avgResponseTime" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="Avg Response Time (s)" />
                        <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} name="Accuracy (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-900/70 border-border">
                  <CardHeader>
                    <CardTitle className="text-base">{t("admin.averageResponseTime")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">2.25s</p>
                    <p className="text-sm text-muted-foreground mt-1">↓ 5% from last week</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/70 border-border">
                  <CardHeader>
                    <CardTitle className="text-base">AI Accuracy Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-400">94.1%</p>
                    <p className="text-sm text-muted-foreground mt-1">↑ 2% from last week</p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ══ CONTENT TAB ══ */}
            <TabsContent value="content" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-900/70 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      {announcementForm.id ? "Edit Announcement" : "Create Announcement"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Title (English)"
                        value={announcementForm.title}
                        onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        className="bg-accent border-border"
                      />
                      <Input
                        placeholder="Title (Arabic)"
                        value={announcementForm.titleAr}
                        onChange={e => setAnnouncementForm({ ...announcementForm, titleAr: e.target.value })}
                        className="bg-accent border-border"
                        dir="rtl"
                      />
                    </div>
                    <Textarea
                      placeholder="Content (English)"
                      value={announcementForm.content}
                      onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      className="bg-accent border-border min-h-24"
                    />
                    <Textarea
                      placeholder="Content (Arabic)"
                      value={announcementForm.contentAr}
                      onChange={e => setAnnouncementForm({ ...announcementForm, contentAr: e.target.value })}
                      className="bg-accent border-border min-h-24"
                      dir="rtl"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={saveAnnouncement}
                        className="bg-indigo-600 hover:bg-indigo-500"
                        disabled={!announcementForm.title || !announcementForm.content}
                      >
                        {announcementForm.id ? "Update" : "Create"} Announcement
                      </Button>
                      {announcementForm.id !== 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setAnnouncementForm({ id: 0, title: "", titleAr: "", content: "", contentAr: "" })}
                          className="border-slate-700"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-3">
                {announcements.map(ann => (
                  <Card key={ann.id} className="bg-card border-border hover:border-border/80 transition-colors">
                    <CardContent className="p-4 flex justify-between gap-4 items-start">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{ann.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 bg-transparent hover:bg-slate-800 text-xs h-7 px-2"
                          onClick={() =>
                            setAnnouncementForm({
                              id: ann.id,
                              title: ann.title,
                              titleAr: ann.titleAr,
                              content: ann.content,
                              contentAr: ann.contentAr,
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 bg-transparent hover:bg-red-900/40 text-red-400 text-xs h-7 px-2"
                          onClick={() => deleteAnnouncement.mutate(ann.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            {/* ══ COURSES TAB ══ */}
            <TabsContent value="courses" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-900/70 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      Course Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {coursesData?.data?.length ?? 0} total courses in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!coursesData ? (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : coursesData.data.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No courses found.</p>
                    ) : (
                      <div className="space-y-2">
                        {coursesData.data.map((course: any) => (
                          <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border/50">
                            <div>
                              <p className="text-sm font-medium text-white">{course.name}</p>
                              <p className="text-xs text-muted-foreground">{course.code} • {course.credits} credits • Semester {course.semester}</p>
                            </div>
                            <Badge variant="outline" className="border-slate-700 text-muted-foreground text-[10px]">
                              {course.isRequired ? "Required" : "Elective"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ══ REPORTS TAB ══ */}
            <TabsContent value="reports" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-900/70 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      Academic Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {advisorInsights ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-accent/50 border border-border/50 text-center">
                          <p className="text-xs text-muted-foreground uppercase">Total Students</p>
                          <p className="text-2xl font-bold text-white mt-1">{advisorInsights.totalStudents}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-accent/50 border border-border/50 text-center">
                          <p className="text-xs text-muted-foreground uppercase">At Risk</p>
                          <p className="text-2xl font-bold text-red-400 mt-1">{advisorInsights.atRiskCount}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-accent/50 border border-border/50 text-center">
                          <p className="text-xs text-muted-foreground uppercase">Average GPA</p>
                          <p className="text-2xl font-bold text-emerald-400 mt-1">{advisorInsights.averageGpa}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* ══ USER DETAILS MODAL ══ */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedUser && (
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(selectedUser.id)} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {getInitials(selectedUser.name, selectedUser.email)}
                </div>
              )}
              <div>
                <p className="font-semibold">{selectedUser?.name ?? "(No name)"}</p>
                <p className="text-xs text-muted-foreground font-normal">{selectedUser?.email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 pt-2">
              <div className="flex gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${roleMeta[selectedUser.role].color}`}>
                  {roleMeta[selectedUser.role].icon}
                  {roleMeta[selectedUser.role].label}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    selectedUser.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-500/10 text-muted-foreground border-slate-500/30"
                  }`}
                >
                  {selectedUser.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </span>
                {selectedUser.isEmailVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-sky-500/10 text-sky-400 border-sky-500/30">
                    <Mail className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {selectedUser.phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    {selectedUser.phone}
                  </div>
                )}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  Joined {formatDate(selectedUser.createdAt)}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  Last signed in {formatDate(selectedUser.lastSignedIn)}
                </div>
              </div>

              {selectedUser.bio && (
                <div className="p-3 bg-slate-800/60 rounded-lg text-sm text-muted-foreground border border-slate-700">
                  {selectedUser.bio}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailsModalOpen(false)}
              className="border-slate-700"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setDetailsModalOpen(false);
                if (selectedUser) openEdit(selectedUser);
              }}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              <Edit3 className="w-3.5 h-3.5 me-1.5" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ EDIT USER MODAL ══ */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update name and role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Full Name
              </label>
              <Input
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter full name"
                className="bg-accent border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Role
              </label>
              <Select
                value={editForm.role}
                onValueChange={val => setEditForm({ ...editForm, role: val as Role })}
              >
                <SelectTrigger className="bg-accent border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-accent border-border">
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="advisor">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-violet-400" />
                      Advisor
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="border-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={updateUser.isPending}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              {updateUser.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ ROLE CHANGE CONFIRMATION ══ */}
      <AlertDialog
        open={!!pendingRoleChange}
        onOpenChange={open => { if (!open) setPendingRoleChange(null); }}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Change Role</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to change{" "}
              <span className="font-semibold text-white">
                {pendingRoleChange?.user.name ?? pendingRoleChange?.user.email}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-white capitalize">
                {pendingRoleChange?.user.role}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-white capitalize">
                {pendingRoleChange?.newRole}
              </span>
              ? This affects their access level immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setPendingRoleChange(null)}
              className="border-slate-700 bg-transparent"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══ STATUS CHANGE CONFIRMATION ══ */}
      <AlertDialog
        open={!!pendingStatusChange}
        onOpenChange={open => { if (!open) setPendingStatusChange(null); }}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatusChange?.newStatus ? "Activate User" : "Deactivate User"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to{" "}
              {pendingStatusChange?.newStatus ? "activate" : "deactivate"}{" "}
              <span className="font-semibold text-white">
                {pendingStatusChange?.user.name ?? pendingStatusChange?.user.email}
              </span>
              ?{" "}
              {!pendingStatusChange?.newStatus &&
                "They will lose access to the platform."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setPendingStatusChange(null)}
              className="border-slate-700 bg-transparent"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={
                pendingStatusChange?.newStatus
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              }
            >
              {pendingStatusChange?.newStatus ? "Activate" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══ DELETE USER CONFIRMATION ══ */}
      <AlertDialog
        open={!!pendingDeleteUser}
        onOpenChange={open => { if (!open) setPendingDeleteUser(null); }}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-2">
              <span className="block">
                You are about to permanently delete{" "}
                <span className="font-semibold text-white">
                  {pendingDeleteUser?.name ?? pendingDeleteUser?.email}
                </span>
                .
              </span>
              <span className="block text-rose-400/80 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                ⚠ This action is irreversible. All data associated with this user will be permanently removed.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setPendingDeleteUser(null)}
              className="border-slate-700 bg-transparent"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteUser.isPending}
              className="bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-600"
            >
              {deleteUser.isPending ? "Deleting…" : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
