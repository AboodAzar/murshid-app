import fs from "fs";
import path from "path";

const files = [
  "client/src/pages/AdvisorDashboard.tsx",
  "client/src/pages/AdvisorStudentProfile.tsx",
  "client/src/pages/AdvisorStudents.tsx",
  "client/src/pages/Assignments.tsx",
  "client/src/pages/Attendance.tsx",
  "client/src/pages/Grades.tsx",
  "client/src/pages/MyCourses.tsx",
  "client/src/pages/Progress.tsx",
  "client/src/pages/Schedule.tsx",
  "client/src/pages/StudentDashboard.tsx",
  "client/src/pages/StudyPlan.tsx",
];

for (const f of files) {
  const fullPath = path.join(process.cwd(), f);
  const content = fs.readFileSync(fullPath, "utf8");
  // Replace the exact pattern
  const oldPattern = 'user?.role === "advisor"';
  const newPattern = '(user?.role === "advisor" || user?.role === "admin")';
  
  if (!content.includes(oldPattern)) {
    console.log(`⚠️ Pattern not found in ${f}`);
    continue;
  }
  
  const newContent = content.replaceAll(oldPattern, newPattern);
  fs.writeFileSync(fullPath, newContent);
  console.log(`✅ Fixed ${f}`);
}

// Also fix DashboardLayout.tsx advisor nav dead link
const dashboardLayoutPath = path.join(process.cwd(), "client/src/components/DashboardLayout.tsx");
const dashboardContent = fs.readFileSync(dashboardLayoutPath, "utf8");

// Replace the dead advisor FAQs link with a proper one or remove it
const fixedDashboard = dashboardContent.replace(
  `{ icon: FileText, labelKey: "advisor.faqsAndDocs", path: "/advisor" },`,
  `{ icon: FileText, labelKey: "faqs.title", path: "/faq" },`
);

// Fix admin nav to have better paths
const fixedDashboard2 = fixedDashboard.replace(
  `admin: [
    { icon: LayoutDashboard, labelKey: "admin.dashboard", path: "/admin" },
    { icon: Users, labelKey: "student.dashboard", path: "/dashboard" },
    { icon: Users, labelKey: "chat.title", path: "/chat" },
  ],`,
  `admin: [
    { icon: LayoutDashboard, labelKey: "admin.dashboard", path: "/admin" },
    { icon: Users, labelKey: "student.dashboard", path: "/dashboard" },
    { icon: BookOpen, labelKey: "student.myCourses", path: "/courses" },
    { icon: CalendarDays, labelKey: "student.schedule", path: "/schedule" },
    { icon: FileText, labelKey: "faqs.title", path: "/faq" },
    { icon: Megaphone, labelKey: "student.announcements", path: "/announcements" },
    { icon: MapPin, labelKey: "map.title", path: "/campus" },
    { icon: Users, labelKey: "chat.title", path: "/chat" },
  ],`
);

if (fixedDashboard2 !== dashboardContent) {
  fs.writeFileSync(dashboardLayoutPath, fixedDashboard2);
  console.log(`✅ Fixed DashboardLayout navigation`);
} else {
  console.log(`⚠️ DashboardLayout patterns not found`);
}

console.log("\nDone!");
