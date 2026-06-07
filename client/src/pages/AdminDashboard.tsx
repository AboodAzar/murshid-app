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
} from "recharts";
import {
  Users,
  BookOpen,
  Building2,
  TrendingUp,
  MessageSquare,
  Settings,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
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

export default function AdminDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [announcementForm, setAnnouncementForm] = useState({
    id: 0,
    title: "",
    titleAr: "",
    content: "",
    contentAr: "",
  });
  const { data: dashboard } = trpc.admin.dashboard.useQuery();
  const { data: announcements = [] } = trpc.announcements.list.useQuery();
  const users = dashboard?.users ?? [];
  const stats = dashboard?.stats;
  const utils = trpc.useUtils();
  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: () => utils.announcements.list.invalidate(),
  });
  const updateAnnouncement = trpc.announcements.update.useMutation({
    onSuccess: () => utils.announcements.list.invalidate(),
  });
  const deleteAnnouncement = trpc.announcements.delete.useMutation({
    onSuccess: () => utils.announcements.list.invalidate(),
  });

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

    setAnnouncementForm({
      id: 0,
      title: "",
      titleAr: "",
      content: "",
      contentAr: "",
    });
  };

  if (!user || user.role !== "admin") return null;

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
          <h1 className="text-4xl font-bold">{t("admin.dashboard")}</h1>
          <p className="text-slate-500">{t("admin.systemOverview")}</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {[
            {
              label: t("admin.totalUsers"),
              value: String(stats?.totalUsers ?? 0),
              icon: Users,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: t("admin.totalStudents"),
              value: String(stats?.totalStudents ?? 0),
              icon: Users,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: t("admin.totalAdvisors"),
              value: String(stats?.totalAdvisors ?? 0),
              icon: Users,
              color: "from-green-500 to-emerald-500",
            },
            {
              label: t("admin.totalCourses"),
              value: String(stats?.totalCourses ?? 0),
              icon: BookOpen,
              color: "from-orange-500 to-red-500",
            },
            {
              label: t("admin.aiConversations"),
              value: String(stats?.totalDocuments ?? 0),
              icon: MessageSquare,
              color: "from-indigo-500 to-blue-500",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 mb-2">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} p-2 opacity-80`}
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
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800">
              <TabsTrigger value="analytics">
                {t("admin.analytics")}
              </TabsTrigger>
              <TabsTrigger value="aiStats">
                {t("admin.aiStatistics")}
              </TabsTrigger>
              <TabsTrigger value="users">
                {t("admin.userManagement")}
              </TabsTrigger>
              <TabsTrigger value="announcements">
                Announcements
              </TabsTrigger>
              <TabsTrigger value="settings">
                {t("admin.systemSettings")}
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>Platform Growth</CardTitle>
                    <CardDescription>
                      User and conversation trends over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                        />
                        <Legend />
                        <Bar dataKey="students" fill="#3b82f6" />
                        <Bar dataKey="advisors" fill="#8b5cf6" />
                        <Bar dataKey="conversations" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* AI Statistics Tab */}
            <TabsContent value="aiStats" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("admin.aiStatistics")}</CardTitle>
                    <CardDescription>
                      AI response performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={aiStatsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                          }}
                          labelStyle={{ color: "#e2e8f0" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="avgResponseTime"
                          stroke="#3b82f6"
                          name="Avg Response Time (s)"
                        />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#10b981"
                          name="Accuracy (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("admin.averageResponseTime")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-400">2.25s</p>
                    <p className="text-sm text-slate-400 mt-2">
                      ↓ 5% from last week
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Accuracy Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-400">94.1%</p>
                    <p className="text-sm text-slate-400 mt-2">
                      ↑ 2% from last week
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("admin.userManagement")}</CardTitle>
                    <CardDescription>
                      Manage platform users and roles
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                    />

                    <div className="space-y-3">
                      {users
                        .filter(u =>
                          `${u.name ?? ""} ${u.email}`
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map(u => (
                        <div
                          key={u.id}
                          className="p-4 bg-slate-700/50 rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-sm text-slate-400">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                u.role === "admin"
                                  ? "bg-red-500/20 text-red-400"
                                  : u.role === "advisor"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {u.role}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                u.isActive
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-slate-500/20 text-slate-400"
                              }`}
                            >
                              {u.isActive ? "active" : "inactive"}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="announcements" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>
                      Create and manage platform announcements
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Title"
                        value={announcementForm.title}
                        onChange={e =>
                          setAnnouncementForm({
                            ...announcementForm,
                            title: e.target.value,
                          })
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                      <Input
                        placeholder="Arabic title"
                        value={announcementForm.titleAr}
                        onChange={e =>
                          setAnnouncementForm({
                            ...announcementForm,
                            titleAr: e.target.value,
                          })
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <Textarea
                      placeholder="Content"
                      value={announcementForm.content}
                      onChange={e =>
                        setAnnouncementForm({
                          ...announcementForm,
                          content: e.target.value,
                        })
                      }
                      className="bg-slate-700 border-slate-600"
                    />
                    <Textarea
                      placeholder="Arabic content"
                      value={announcementForm.contentAr}
                      onChange={e =>
                        setAnnouncementForm({
                          ...announcementForm,
                          contentAr: e.target.value,
                        })
                      }
                      className="bg-slate-700 border-slate-600"
                    />
                    <Button
                      onClick={saveAnnouncement}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!announcementForm.title || !announcementForm.content}
                    >
                      {announcementForm.id ? "Update" : "Create"} Announcement
                    </Button>

                    <div className="space-y-3">
                      {announcements.map(announcement => (
                        <div
                          key={announcement.id}
                          className="p-4 bg-slate-700/50 rounded-lg flex justify-between gap-4"
                        >
                          <div>
                            <p className="font-semibold">{announcement.title}</p>
                            <p className="text-sm text-slate-400">
                              {announcement.content}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600"
                              onClick={() =>
                                setAnnouncementForm({
                                  id: announcement.id,
                                  title: announcement.title,
                                  titleAr: announcement.titleAr,
                                  content: announcement.content,
                                  contentAr: announcement.contentAr,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-red-400"
                              onClick={() =>
                                deleteAnnouncement.mutate(announcement.id)
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("admin.systemSettings")}</CardTitle>
                    <CardDescription>
                      Configure system-wide settings
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Platform Name
                      </label>
                      <Input
                        defaultValue="Murshid"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Max File Upload Size (MB)
                      </label>
                      <Input
                        type="number"
                        defaultValue="50"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">AI Model</label>
                      <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                        <option>GPT-4</option>
                        <option>GPT-3.5 Turbo</option>
                        <option>Claude 3</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium">Enable Notifications</p>
                        <p className="text-sm text-slate-400">
                          Send real-time alerts to users
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium">Maintenance Mode</p>
                        <p className="text-sm text-slate-400">
                          Temporarily disable platform access
                        </p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      {t("common.save")} Settings
                    </Button>
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
