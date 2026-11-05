import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity, Database, Cookie, User, AlertCircle, CheckCircle2, RefreshCw,
  Server, Lock, KeyRound, Shield
} from "lucide-react";

const fadeInUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export default function AuthDebug() {
  const [testEmail, setTestEmail] = useState("test@std-zuj.edu.jo");
  const [testPassword, setTestPassword] = useState("password123");
  const [testName, setTestName] = useState("Test Student");
  const [testRole, setTestRole] = useState<"student" | "advisor" | "admin">("student");

  const debugQuery = trpc.auth.debug.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const createTestUser = trpc.auth.createTestUser.useMutation({
    onSuccess: () => { debugQuery.refetch(); },
  });
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => { debugQuery.refetch(); meQuery.refetch(); },
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { debugQuery.refetch(); meQuery.refetch(); },
  });

  const diag = debugQuery.data;
  const me = meQuery.data;

  const steps = diag?.steps || [];

  const statusIcon = (status: string) => {
    if (status === "ok") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === "failed" || status === "invalid") return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (status === "missing" || status === "null" || status === "skipped") return <AlertCircle className="w-4 h-4 text-amber-400" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div {...fadeInUp}>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-emerald-400" />
            Authentication Debugger
          </h1>
          <p className="text-slate-400 mt-1">Trace the full authentication flow and diagnose login failures.</p>
        </motion.div>

        {/* Diagnostics Panel */}
        <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Server Diagnostics
            </h2>
            <Button onClick={() => debugQuery.refetch()} variant="outline" size="sm" className="border-white/10 text-slate-300">
              <RefreshCw className="w-4 h-4 me-1" /> Refresh
            </Button>
          </div>

          {debugQuery.isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />)}</div>
          ) : debugQuery.error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
              <AlertCircle className="w-5 h-5 inline me-2" />
              {debugQuery.error.message}
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
                  {statusIcon(s.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white capitalize">{s.step}</p>
                    {s.status !== "ok" && (
                      <p className="text-xs text-slate-400">{s.status}{s.detail ? `: ${s.detail}` : ""}{s.reason ? ` (${s.reason})` : ""}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.status === "ok" ? "bg-emerald-500/15 text-emerald-400" : s.status === "failed" || s.status === "invalid" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {diag && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.04]">
                <p className="text-xs text-slate-400">Database Connected</p>
                <p className="text-sm font-medium text-white">{diag.dbConnected ? "Yes" : "No"}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04]">
                <p className="text-xs text-slate-400">Total Users</p>
                <p className="text-sm font-medium text-white">{diag.userCount ?? "Unknown"}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04]">
                <p className="text-xs text-slate-400">Cookie Present</p>
                <p className="text-sm font-medium text-white">{diag.cookiePresent}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04]">
                <p className="text-xs text-slate-400">JWT Valid</p>
                <p className="text-sm font-medium text-white">{diag.jwtValid ? "Yes" : "No / No Cookie"}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Sample Users */}
        {diag?.sampleUsers && diag.sampleUsers.length > 0 && (
          <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Sample Users in Database
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-white/10">
                    <th className="pb-2 pe-4">ID</th>
                    <th className="pb-2 pe-4">Email</th>
                    <th className="pb-2 pe-4">Name</th>
                    <th className="pb-2 pe-4">Role</th>
                    <th className="pb-2 pe-4">Verified</th>
                    <th className="pb-2 pe-4">Active</th>
                    <th className="pb-2">Has Password</th>
                  </tr>
                </thead>
                <tbody>
                  {diag.sampleUsers.map((u: any) => (
                    <tr key={u.id} className="border-b border-white/5 text-slate-300">
                      <td className="py-2 pe-4">{u.id}</td>
                      <td className="py-2 pe-4">{u.email}</td>
                      <td className="py-2 pe-4">{u.name || "—"}</td>
                      <td className="py-2 pe-4"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs">{u.role}</span></td>
                      <td className="py-2 pe-4">{u.isEmailVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}</td>
                      <td className="py-2 pe-4">{u.isActive ? "Yes" : "No"}</td>
                      <td className="py-2">{u.hasPassword ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Current Auth State */}
        <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-violet-400" />
            Current Authentication State
          </h2>
          {meQuery.isLoading ? (
            <div className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
          ) : me ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Authenticated</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-xs text-slate-400">User ID</p>
                  <p className="text-sm font-medium text-white">{me.id}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-white">{me.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="text-sm font-medium text-white">{me.name || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04]">
                  <p className="text-xs text-slate-400">Role</p>
                  <p className="text-sm font-medium text-white"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs">{me.role}</span></p>
                </div>
              </div>
              <Button onClick={() => logoutMutation.mutate()} variant="outline" className="mt-2 border-white/10 text-slate-300">
                <Lock className="w-4 h-4 me-2" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300">Not authenticated (no valid session)</span>
            </div>
          )}
        </motion.div>

        {/* Test Login */}
        <motion.div {...fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-rose-400" />
            Test Login
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Email" className="bg-white/[0.04] border-white/10 text-white" />
            <Input value={testPassword} onChange={(e) => setTestPassword(e.target.value)} placeholder="Password" type="password" className="bg-white/[0.04] border-white/10 text-white" />
          </div>
          <div className="flex gap-2 mb-3">
            <Input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="Name (for creation)" className="bg-white/[0.04] border-white/10 text-white flex-1" />
            <select value={testRole} onChange={(e) => setTestRole(e.target.value as any)} className="h-9 rounded-md bg-white/[0.04] border border-white/10 text-white text-sm px-3">
              <option value="student">Student</option>
              <option value="advisor">Advisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => loginMutation.mutate({ email: testEmail, password: testPassword })} className="bg-emerald-600 hover:bg-emerald-500">
              <KeyRound className="w-4 h-4 me-2" /> Test Login
            </Button>
            <Button onClick={() => createTestUser.mutate({ email: testEmail, password: testPassword, name: testName, role: testRole })} variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              <Server className="w-4 h-4 me-2" /> Create Test User
            </Button>
          </div>
          {loginMutation.error && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 inline me-2" />
              Login failed: {loginMutation.error.message}
            </div>
          )}
          {loginMutation.data?.success && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 inline me-2" />
              Login successful! User: {loginMutation.data.user?.email} ({loginMutation.data.user?.role})
            </div>
          )}
          {createTestUser.data?.success && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 inline me-2" />
              {createTestUser.data.message} (ID: {createTestUser.data.userId})
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
