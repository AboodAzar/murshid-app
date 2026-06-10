import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp, Bell, MessageSquare, Award } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function StudentDashboard() {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const [userName, setUserName] = useState("Student");
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>();
  const isAdminView = user?.role === "admin";

  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    } else {
      const stored = localStorage.getItem("userName");
      if (stored) {
        setUserName(stored);
      }
    }
  }, [user]);

  // Fetch student data
  const { data: dashboard, isLoading: dashboardLoading } =
    trpc.student.dashboard.useQuery(
      isAdminView && selectedStudentId ? { studentId: selectedStudentId } : undefined
    );
  const { data: recommendations } = trpc.courses.getRecommendations.useQuery(
    undefined,
    { enabled: user?.role === "student" }
  );
  const { data: notifications } = trpc.notifications.list.useQuery({
    unreadOnly: true,
    limit: 5,
  });
  const { data: announcements = [] } = trpc.announcements.list.useQuery();

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-400">{t("common.loading")}</p>
        </div>
      </DashboardLayout>
    );
  }

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
          <h1 className="text-4xl font-bold">{t("student.dashboard")}</h1>
          <p className="text-slate-500">
            {isAdminView
              ? `Admin read-only view${dashboard?.student?.name ? `: ${dashboard.student.name}` : ""}`
              : `${t("common.welcome")}, ${userName}!`}
          </p>
        </motion.div>

        {isAdminView && dashboard?.availableStudents?.length ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Admin Student View</CardTitle>
              <CardDescription>
                Select a student to review academic progress in read-only mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={String(selectedStudentId ?? dashboard.student?.id ?? "")}
                onValueChange={value => setSelectedStudentId(Number(value))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {dashboard.availableStudents.map(student => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name || student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ) : null}

        {/* Stats Grid */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: t("student.gpa"),
              value: dashboard?.stats.gpa ?? "0.00",
              icon: Award,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: t("student.completedHours"),
              value: String(dashboard?.stats.earnedCredits ?? 0),
              icon: BookOpen,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: t("student.totalHours"),
              value: String(dashboard?.stats.totalCredits ?? 0),
              icon: TrendingUp,
              color: "from-green-500 to-emerald-500",
            },
            {
              label: t("student.currentSemester"),
              value: String(dashboard?.stats.currentSemester ?? 0),
              icon: Award,
              color: "from-orange-500 to-red-500",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
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
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Courses and Recommendations */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList
                className={`grid w-full ${isAdminView ? "grid-cols-1" : "grid-cols-2"} bg-slate-800`}
              >
                <TabsTrigger value="courses">
                  {t("student.courses")}
                </TabsTrigger>
                {!isAdminView ? (
                  <TabsTrigger value="recommendations">
                    {t("student.recommendations")}
                  </TabsTrigger>
                ) : null}
              </TabsList>

              <TabsContent value="courses" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("student.currentCourses")}</CardTitle>
                    <CardDescription>
                      {t("student.enrolledCourses")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-20" />
                        ))}
                      </div>
                    ) : dashboard?.courses && dashboard.courses.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.courses.map(course => (
                          <div
                            key={course.id}
                            className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">
                                  {course.code
                                    ? `${course.code} - ${course.name}`
                                    : `${t("student.course")} ${course.courseId}`}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {t("student.semester")} {course.semester}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  course.status === "completed"
                                    ? "bg-green-500/20 text-green-400"
                                    : course.status === "in_progress"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-slate-500/20 text-slate-400"
                                }`}
                              >
                                {course.status}
                              </span>
                            </div>
                            {course.status === "completed" && course.grade && (
                              <p className="text-sm text-slate-300">
                                {t("student.grade")}: {course.grade}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">{t("common.noResults")}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {!isAdminView ? (
                <TabsContent value="recommendations" className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle>{t("student.recommendations")}</CardTitle>
                      <CardDescription>
                        {t("student.aiRecommendations")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recommendations && recommendations.length > 0 ? (
                        <div className="space-y-4">
                          {recommendations.map(course => (
                            <div
                              key={course.id}
                              className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold">{course.name}</p>
                                  <p className="text-sm text-slate-400">
                                    {course.code}
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                                  {course.credits} {t("student.credits")}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                {t("student.enrollCourse")}
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400">{t("common.noResults")}</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ) : null}
            </Tabs>

            {/* Graduation Progress */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>{t("student.graduationProgress")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {t("student.completedHours")}
                      </span>
                      <span className="text-sm text-slate-400">
                        {dashboard?.stats.earnedCredits ?? 0} /{" "}
                        {dashboard?.stats.totalCredits ?? 0}
                      </span>
                    </div>
                    <Progress value={dashboard?.stats.progress ?? 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {dashboard?.stats.progress ?? 0}%
                      </p>
                      <p className="text-xs text-slate-400">
                        {t("common.complete")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-400">
                        {dashboard?.stats.semestersLeft ?? 0}
                      </p>
                      <p className="text-xs text-slate-400">{t("student.semestersLeft")}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {dashboard?.stats.gpa ?? "0.00"}
                      </p>
                      <p className="text-xs text-slate-400">{t("student.currentGPA")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={fadeInUp} className="space-y-6">
            {!isAdminView ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("common.quickActions")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                    variant="default"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t("student.aiAssistant")}
                  </Button>
                  <Button
                    className="w-full bg-slate-700 hover:bg-slate-600 justify-start"
                    variant="outline"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t("student.studyPlan")}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {/* Recent Notifications */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.slice(0, 5).map(announcement => (
                      <div
                        key={announcement.id}
                        className="p-3 bg-slate-700/50 rounded-lg text-sm border-l-2 border-cyan-500"
                      >
                        <p className="font-medium text-slate-200">
                          {announcement.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {announcement.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">{t("common.noResults")}</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {t("student.notifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className="p-3 bg-slate-700/50 rounded-lg text-sm border-l-2 border-blue-500"
                      >
                        <p className="font-medium text-slate-200">
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">
                    {t("notifications.noNotifications")}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
