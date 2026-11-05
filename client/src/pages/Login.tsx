import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocation } from "wouter";
import Logo from "@/components/Logo";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function Login() {
  const { t, language, setLanguage, dir } = useI18n();
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation();
  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (page === 1) {
      console.log("[Login:Frontend] Attempting login for:", email);
      try {
        const result = await loginMutation.mutateAsync({
          email,
          password,
        });
        console.log("[Login:Frontend] Login response:", result);

        if (result.success) {
          if (result.requireVerification) {
            console.log("[Login:Frontend] Verification required, showing OTP page");
            setPage(2);
            return;
          }
          console.log("[Login:Frontend] Login success, redirecting based on role:", result.user?.role);
          if (result.user?.role === "student") setLocation("/dashboard");
          else if (result.user?.role === "advisor") setLocation("/advisor");
          else if (result.user?.role === "admin") setLocation("/admin");
        }
      } catch (err: any) {
        const errorMessage = err?.message || t("auth.invalidCredentials");
        console.error("[Login:Frontend] Login error:", err);
        console.error("[Login:Frontend] Error message:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (page === 2) {
      if (otp.length !== 6) {
        setError("Please enter the 6-digit code");
        return;
      }
      console.log("[Login:Frontend] Verifying OTP for:", email);
      try {
        const result = await verifyEmailMutation.mutateAsync({
          email,
          code: otp,
        });
        console.log("[Login:Frontend] Verification response:", result);

        if (result.success && result.user) {
          console.log("[Login:Frontend] Verification success, redirecting based on role:", result.user.role);
          if (result.user.role === "student") setLocation("/dashboard");
          else if (result.user.role === "advisor") setLocation("/advisor");
          else if (result.user.role === "admin") setLocation("/admin");
        }
      } catch (err: any) {
        setError(err?.message || "Invalid verification code");
        console.error("[Login:Frontend] Verification error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-br from-[#040e08] via-[#091f12] to-[#040e08] flex items-center justify-center px-4 py-8"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 end-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 start-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Logo size={72} className="rounded-2xl shadow-xl shadow-emerald-500/20" />
            <div className="text-start">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-green-300 to-amber-300 bg-clip-text text-transparent block">
                Oliver
              </span>
              <span className="text-xs font-medium text-emerald-400/90 tracking-wide uppercase">
                ZUJ Academic Guidance
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{t("common.appDescription")}</p>
        </div>

        {/* Login Card */}
        <Card className="bg-card/90 backdrop-blur-2xl border-emerald-500/20 shadow-2xl shadow-emerald-950/50">
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">{t("auth.login")}</CardTitle>
            <CardDescription className="text-slate-400">{t("auth.signIn")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {page === 1 ? (
                <>
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      {t("auth.email")}
                    </label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-3.5 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="ps-10 bg-slate-900/60 border-slate-700/80 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30 h-11"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-3.5 w-5 h-5 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="ps-10 pe-10 bg-slate-900/60 border-slate-700/80 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30 h-11"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-3.5 text-slate-400 hover:text-white"
                        disabled={isLoading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* OTP Input */}
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Check your email</h3>
                    <p className="text-muted-foreground text-sm">
                      We've sent a 6-digit verification code to<br/>
                      <span className="text-emerald-400 font-semibold">{email}</span>
                    </p>
                    
                    <div className="pt-2">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-2xl tracking-widest bg-slate-900/60 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-500 h-14 font-mono"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-sm flex items-start gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500/30"
                    disabled={isLoading}
                  />
                  <span className="text-slate-300">{t("auth.rememberMe")}</span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  {t("auth.forgotPassword")}
                </a>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                {page === 2 && (
                  <Button
                    type="button"
                    onClick={() => setPage(1)}
                    variant="outline"
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    {t("common.previous")}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-base font-semibold shadow-lg shadow-emerald-700/30"
                >
                  {isLoading ? t("common.loading") : page === 1 ? t("auth.signIn") : "Verify Email"}
                  <ArrowRight className="ms-2 w-4 h-4 rtl:rotate-180" />
                </Button>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-muted-foreground text-sm">
                {t("auth.dontHaveAccount")}{" "}
                <a
                  href="/register"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  {t("auth.signUp")}
                </a>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Security & Language Switcher */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Al-Zaytoonah University of Jordan</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                language === "en"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
              disabled={isLoading}
            >
              {t("common.english")}
            </button>
            <button
              onClick={() => setLanguage("ar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                language === "ar"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
              disabled={isLoading}
            >
              {t("common.arabic")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
