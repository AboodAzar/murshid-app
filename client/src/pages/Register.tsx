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
import { ArrowRight, Mail, Lock, User } from "lucide-react";
import { trpc } from "@/lib/trpc";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function Register() {
  const { t, dir } = useI18n();
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = trpc.auth.register.useMutation();
  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (page === 1) {
      if (!formData.name || !formData.email) {
        setError(t("auth.validationError"));
        return;
      }
      setPage(2);
      return;
    }

    if (page === 2) {
      if (formData.password !== formData.confirmPassword) {
        setError(t("auth.passwordMismatch"));
        return;
      }

      setIsLoading(true);
      try {
        const result = await registerMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        if (result.success) {
          if (result.requireVerification) {
            setPage(3);
            return;
          }
          // Redirect based on role if no verification needed
          if (result.user?.role === "student") setLocation("/dashboard");
          else if (result.user?.role === "advisor") setLocation("/advisor");
          else if (result.user?.role === "admin") setLocation("/admin");
        }
      } catch (err: any) {
        const errorMessage = err?.message || t("auth.registrationFailed");
        setError(errorMessage);
        console.error("Registration error:", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (page === 3) {
      if (otp.length !== 6) {
        setError("Please enter the 6-digit code");
        return;
      }

      setIsLoading(true);
      try {
        const result = await verifyEmailMutation.mutateAsync({
          email: formData.email,
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

        {/* Register Card */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">
              {t("auth.createAccount")}
            </CardTitle>
            <CardDescription>{t("auth.createAccountDesc")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {page === 1 ? (
                <>
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      {t("auth.fullName")}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        type="text"
                        name="name"
                        placeholder={t("auth.namePlaceholder")}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      {t("auth.email")}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        name="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </>
              ) : page === 2 ? (
                <>
                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      {t("auth.confirmPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                        required
                        disabled={isLoading}
                      />
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
                      <span className="text-blue-400 font-semibold">{formData.email}</span>
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

              {/* Navigation Buttons */}
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
                  className={`flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 text-base font-semibold ${page === 1 ? "w-full" : ""}`}
                >
                  {page === 1 ? t("common.next") : page === 2 ? t("auth.createAccount") : "Verify Email"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Login Link */}
              <p className="text-center text-slate-400">
                {t("auth.alreadyHaveAccount")}{" "}
                <a
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {t("auth.signIn")}
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
