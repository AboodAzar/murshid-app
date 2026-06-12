import { useState } from "react";
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
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestResetMutation = trpc.passwordReset.requestReset.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("auth.emailRequired"));
      return;
    }

    setIsLoading(true);
    try {
      await requestResetMutation.mutateAsync({ email });
      setSubmitted(true);
      toast.success(t("auth.resetEmailSent"));
    } catch (error: any) {
      toast.error(error.message || t("auth.resetFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => setLocation("/login")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t("auth.backToLogin")}
        </button>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-2xl">
              {t("auth.forgotPassword")}
            </CardTitle>
            <CardDescription>
              {submitted
                ? t("auth.checkEmailDescription")
                : t("auth.enterEmailToReset")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-slate-300 font-medium">
                    {t("auth.emailSent")}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {t("auth.checkEmailInstructions")} {email}
                  </p>
                </div>
                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {t("auth.backToLogin")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("auth.email")}
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
                </Button>

                <p className="text-xs text-slate-400 text-center">
                  {t("auth.resetLinkExpires")}
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-xs text-slate-400 text-center">
            {t("auth.noResetEmail")} <br />
            <a
              href="mailto:support@murshid.edu"
              className="text-blue-400 hover:text-blue-300"
            >
              support@murshid.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
