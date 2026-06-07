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
          <ProtectedRoute requiredRole={["student", "admin"]}>
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

      <Route path={"/admin"}>
        {() => (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>

      <Route path={"/chat"}>
        {() => (
          <ProtectedRoute>
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

      <Route path={"/404"} component={NotFound} />
      <Route path={"/unauthorized"} component={NotFound} />

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
