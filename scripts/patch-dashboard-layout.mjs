import fs from "fs";

let code = fs.readFileSync("client/src/components/DashboardLayout.tsx", "utf8");

// Update menuItemsByRole.student order
const oldStudentMenu = `  student: [
    { icon: LayoutDashboard, labelKey: "student.dashboard", path: "/dashboard" },
    { icon: BookOpen, labelKey: "student.myCourses", path: "/courses" },
    { icon: CalendarDays, labelKey: "student.schedule", path: "/schedule" },
    { icon: FileText, labelKey: "student.assignments", path: "/assignments" },
    { icon: Award, labelKey: "student.grades", path: "/grades" },
    { icon: CheckCircle2, labelKey: "student.attendance", path: "/attendance" },
    { icon: Megaphone, labelKey: "student.announcements", path: "/announcements" },
    { icon: BarChart3, labelKey: "student.achievements", path: "/achievements" },
    { icon: Target, labelKey: "student.progress", path: "/progress" },
    { icon: BrainCircuit, labelKey: "analytics.title", path: "/analytics" },
    { icon: Clock, labelKey: "student.studyPlan", path: "/study-plan" },
    { icon: MapPin, labelKey: "map.title", path: "/campus" },
    { icon: Sparkles, labelKey: "chat.title", path: "/chat" },
  ],`;

const newStudentMenu = `  student: [
    { icon: LayoutDashboard, labelKey: "student.dashboard", path: "/dashboard" },
    { icon: CalendarDays, labelKey: "student.schedule", path: "/schedule" },
    { icon: Sparkles, labelKey: "chat.title", path: "/chat" },
    { icon: FileText, labelKey: "student.assignments", path: "/assignments" },
    { icon: CheckCircle2, labelKey: "student.attendance", path: "/attendance" },
    { icon: BookOpen, labelKey: "student.myCourses", path: "/courses" },
    { icon: Award, labelKey: "student.grades", path: "/grades" },
    { icon: Megaphone, labelKey: "student.announcements", path: "/announcements" },
    { icon: BarChart3, labelKey: "student.achievements", path: "/achievements" },
    { icon: Target, labelKey: "student.progress", path: "/progress" },
    { icon: BrainCircuit, labelKey: "analytics.title", path: "/analytics" },
    { icon: Clock, labelKey: "student.studyPlan", path: "/study-plan" },
    { icon: MapPin, labelKey: "map.title", path: "/campus" },
  ],`;

if (code.includes(oldStudentMenu)) {
  code = code.replace(oldStudentMenu, newStudentMenu);
} else {
  code = code.replace(oldStudentMenu.replace(/\n/g, "\r\n"), newStudentMenu.replace(/\n/g, "\r\n"));
}

// Update mobileNavItems for students
const oldMobileItems = `    return [
      { icon: LayoutDashboard, label: t("student.dashboard") || "الرئيسية", path: "/dashboard", tab: undefined, highlight: false },
      { icon: CalendarDays, label: t("student.schedule") || "الجدول", path: "/schedule", tab: undefined, highlight: false },
      { icon: Sparkles, label: "Oliver AI", path: "/chat", tab: undefined, highlight: true },
      { icon: Award, label: t("student.grades") || "العلامات", path: "/grades", tab: undefined, highlight: false },
      { icon: MapPin, label: t("map.title") || "الخريطة", path: "/campus", tab: undefined, highlight: false },
    ];`;

const newMobileItems = `    return [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", tab: undefined, highlight: false },
      { icon: CalendarDays, label: "Schedule", path: "/schedule", tab: undefined, highlight: false },
      { icon: Sparkles, label: "Oliver AI", path: "/chat", tab: undefined, highlight: true },
      { icon: FileText, label: "Assignments", path: "/assignments", tab: undefined, highlight: false },
      { icon: CheckCircle2, label: "Attendence", path: "/attendance", tab: undefined, highlight: false },
    ];`;

if (code.includes(oldMobileItems)) {
  code = code.replace(oldMobileItems, newMobileItems);
} else {
  code = code.replace(oldMobileItems.replace(/\n/g, "\r\n"), newMobileItems.replace(/\n/g, "\r\n"));
}

fs.writeFileSync("client/src/components/DashboardLayout.tsx", code, "utf8");
console.log("Successfully patched DashboardLayout.tsx with hotkeys: Dashboard, Schedule, Oliver AI, Assignments, Attendence!");
