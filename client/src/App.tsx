import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StudentDashboard from "./pages/StudentDashboard";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AIChatPage from "./pages/AIChatPage";
import CampusNavigation from "./pages/CampusNavigation";
import MyCourses from "./pages/MyCourses";
import CourseDetails from "./pages/CourseDetails";
import Schedule from "./pages/Schedule";
import Assignments from "./pages/Assignments";
import Grades from "./pages/Grades";
import Attendance from "./pages/Attendance";
import Announcements from "./pages/Announcements";
import Achievements from "./pages/Achievements";
import Progress from "./pages/Progress";
import StudyPlan from "./pages/StudyPlan";
import AcademicAnalytics from "./pages/AcademicAnalytics";
import AdvisorStudents from "./pages/AdvisorStudents";
import AdvisorStudentProfile from "./pages/AdvisorStudentProfile";
import AdvisorAppointments from "./pages/AdvisorAppointments";
import AdvisorAIReview from "./pages/AdvisorAIReview";
import AuthDebug from "./pages/AuthDebug";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />

      {/* Protected Routes with Role-Based Access */}
      <Route path={"/dashboard"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <StudentDashboard />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/advisor"}>
        {() => (
          <ProtectedRoute requiredRole="advisor">
            <AdvisorDashboard />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/advisor/students"}>
        {() => (
          <ProtectedRoute requiredRole="advisor">
            <AdvisorStudents />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/advisor/student-profile"}>
        {() => (
          <ProtectedRoute requiredRole="advisor">
            <AdvisorStudentProfile />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/advisor/appointments"}>
        {() => (
          <ProtectedRoute requiredRole="advisor">
            <AdvisorAppointments />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/advisor/ai-review"}>
        {() => (
          <ProtectedRoute requiredRole="advisor">
            <AdvisorAIReview />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/admin"}>
        {() => (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/chat"}>
        {() => (
          <ProtectedRoute requiredRole="student">
            <AIChatPage />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/campus"}>
        {() => (
          <ProtectedRoute>
            <CampusNavigation />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/courses"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <MyCourses />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/courses/:courseId"}>
        {(params) => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <CourseDetails />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/schedule"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <Schedule />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/assignments"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <Assignments />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/grades"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <Grades />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/attendance"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <Attendance />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/announcements"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <Announcements />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/achievements"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <Achievements />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/progress"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <Progress />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/study-plan"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <StudyPlan />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/analytics"}>
        {() => (
          <ProtectedRoute requiredRole={["student", "advisor"]}>
            <AcademicAnalytics />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/404"} component={NotFound} />
      <Route path={"/unauthorized"} component={NotFound} />

      <Route path={"/auth-debug"}>
        {() => (
          <ProtectedRoute requiredRole="admin">
            <AuthDebug />
          </ProtectedRoute>
        )}
      </Route>

      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
