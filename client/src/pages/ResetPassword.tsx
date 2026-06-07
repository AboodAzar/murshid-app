import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
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
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const resetPasswordMutation = trpc.passwordReset.resetPassword.useMutation();

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");

    if (!resetToken) {
      setError(t("auth.noTokenProvided"));
      setTokenValid(false);
      return;
    }

    setToken(resetToken);
    setTokenValid(true); // Assume valid, will verify on submit
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error(t("auth.passwordRequired"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("auth.passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordMutation.mutateAsync({
        token,
        newPassword: password,
      });
      if (!result.success) {
        throw new Error(result.message || t("auth.resetFailed"));
      }
      setSuccess(true);
      toast.success(t("auth.passwordResetSuccess"));

      // Redirect to login after 2 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || t("auth.resetFailed"));
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl w-full max-w-md">
          <CardContent className="pt-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
            <p className="text-center text-slate-400 mt-4">
              {t("auth.verifyingToken")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl w-full max-w-md">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/20 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <CardTitle className="text-2xl">{t("auth.invalidToken")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button
              onClick={() => setLocation("/forgot-password")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {t("auth.requestNewLink")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl w-full max-w-md">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/20 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <CardTitle className="text-2xl">
              {t("auth.passwordResetSuccess")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              {t("auth.redirectingToLogin")}
            </p>
            <Button
              onClick={() => setLocation("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {t("auth.goToLogin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 mb-4">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-2xl">
              {t("auth.resetPassword")}
            </CardTitle>
            <CardDescription>{t("auth.enterNewPassword")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("auth.newPassword")}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("auth.confirmPassword")}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? t("auth.resetting") : t("auth.resetPassword")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
