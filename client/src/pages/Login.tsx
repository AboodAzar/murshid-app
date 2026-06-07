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
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
      try {
        const result = await loginMutation.mutateAsync({
          email,
          password,
        });

        if (result.success) {
          if (result.requireVerification) {
            setPage(2);
            return;
          }
          if (result.user?.role === "student") setLocation("/dashboard");
          else if (result.user?.role === "advisor") setLocation("/advisor");
          else if (result.user?.role === "admin") setLocation("/admin");
        }
      } catch (err: any) {
        const errorMessage = err?.message || t("auth.invalidCredentials");
        setError(errorMessage);
        console.error("Login error:", err);
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
      try {
        const result = await verifyEmailMutation.mutateAsync({
          email,
          code: otp,
        });

        if (result.success && result.user) {
          if (result.user.role === "student") setLocation("/dashboard");
          else if (result.user.role === "advisor") setLocation("/advisor");
          else if (result.user.role === "admin") setLocation("/admin");
        }
      } catch (err: any) {
        setError(err?.message || "Invalid verification code");
        console.error("Verification error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 ${dir === "rtl" ? "rtl" : "ltr"}`}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
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
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl">
              م
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t("common.appName")}
            </span>
          </div>
          <p className="text-slate-400">{t("common.appDescription")}</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">{t("auth.login")}</CardTitle>
            <CardDescription>{t("auth.signIn")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {page === 1 ? (
                <>
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      {t("auth.email")}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
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
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                        disabled={isLoading}
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
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Check your email</h3>
                    <p className="text-slate-400 text-sm">
                      We've sent a 6-digit verification code to<br/>
                      <span className="text-blue-400 font-semibold">{email}</span>
                    </p>
                    
                    <div className="pt-4">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-2xl tracking-widest bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 h-14"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                    disabled={isLoading}
                  />
                  <span className="text-slate-300">{t("auth.rememberMe")}</span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
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
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {t("common.previous")}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 text-base font-semibold`}
                >
                  {isLoading ? t("common.loading") : page === 1 ? t("auth.signIn") : "Verify Email"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-slate-400">
                {t("auth.dontHaveAccount")}{" "}
                <a
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {t("auth.signUp")}
                </a>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Language Switcher */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setLanguage("en")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              language === "en"
                ? "bg-blue-600 text-white"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
            disabled={isLoading}
          >
            {t("common.english")}
          </button>
          <button
            onClick={() => setLanguage("ar")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              language === "ar"
                ? "bg-blue-600 text-white"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
            disabled={isLoading}
          >
            {t("common.arabic")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
