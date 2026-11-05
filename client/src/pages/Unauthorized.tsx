import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LayoutDashboard, Home, LogOut, ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { language } = useI18n();

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "advisor":
        return "/advisor";
      case "student":
      default:
        return "/dashboard";
    }
  };

  const handleReturnDashboard = () => {
    setLocation(getDashboardPath());
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/login");
    } catch {
      setLocation("/login");
    }
  };

  const isArabic = language === "ar";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[130px]" />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl text-center">
          {/* Header Brand */}
          <div className="flex justify-center mb-6">
            <Logo size={48} />
          </div>

          {/* Shield Icon with glowing background */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-10 h-10 text-rose-400" />
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>403 • Forbidden / غير مصرح</span>
          </div>

          {/* Bilingual Titles */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Access Restricted
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-300 mb-4" dir="rtl">
            غير مصرح بالدخول
          </h2>

          {/* Bilingual Descriptions */}
          <div className="space-y-3 text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            <p>
              This section is restricted and requires elevated role privileges
              (such as Academic Advisor or System Administrator). Your current account
              does not have permission to access this resource.
            </p>
            <p className="text-slate-400/90" dir="rtl">
              هذه الصفحة مخصصة للمرشدين الأكاديميين أو مسؤولي النظام فقط. حسابك الحالي لا
              يمتلك الصلاحيات الكافية للوصول إليها.
            </p>
          </div>

          {/* User Role Pill if logged in */}
          {user && (
            <div className="mb-8 p-3 rounded-xl bg-slate-900/60 border border-white/5 inline-flex items-center gap-3 text-xs text-slate-300">
              <span className="text-slate-400">
                {isArabic ? "المستخدم الحالي:" : "Signed in as:"}
              </span>
              <span className="font-semibold text-white">{user.name || user.email}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 capitalize font-mono text-[11px]">
                {user.role}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={handleReturnDashboard}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-700/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isArabic ? "العودة إلى لوحة التحكم" : "Return to Dashboard"}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleGoHome}
              className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>{isArabic ? "الصفحة الرئيسية" : "Home"}</span>
            </Button>

            {user && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full sm:w-auto text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{isArabic ? "تبديل الحساب" : "Switch Account"}</span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
