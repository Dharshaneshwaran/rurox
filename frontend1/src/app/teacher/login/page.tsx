"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { setStoredAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<{ token: string; user: User }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      if (data.user.role !== "TEACHER") {
        setError("This account is not a teacher.");
        setLoading(false);
        return;
      }

      setStoredAuth(data.token, data.user);
      router.push("/teacher/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-theme flex min-h-screen w-full bg-[#020617] font-body selection:bg-primary/30 selection:text-white">
      {/* Left Panel - Hero Branding */}
      <div className="hidden lg:flex flex-col justify-center w-[45%] bg-[#020617] p-16 xl:p-24 relative overflow-hidden">
        {/* Dynamic Glows */}
        <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[60%] w-[60%] bg-accent/20 blur-[120px] rounded-full" />

        <div className="max-w-xl z-20 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Teacher Portal Active</span>
          </div>

          <h1 className="text-6xl xl:text-7xl font-bold mb-8 tracking-tighter text-white leading-[0.95]">
            ruroxz <span className="text-primary italic">Teacher</span> Access
          </h1>

          <p className="text-xl text-slate-400 mb-14 leading-relaxed max-w-lg">
            Manage your teaching schedule and Substitution status with 
            <span className="text-white"> real-time updates</span> and 
            <span className="text-white"> instant classroom</span> coordination.
          </p>

          <div className="space-y-6">
            <div className="group relative overflow-hidden p-8 rounded-[32px] border border-white/5 bg-white/[0.03] backdrop-blur-xl transition-all hover:bg-white/[0.05] hover:border-white/10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Smart Schedule</h3>
                  <p className="text-sm text-slate-500 mt-1">Intelligent timetable synchronization across all your assigned slots.</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden p-8 rounded-[32px] border border-white/5 bg-white/[0.03] backdrop-blur-xl transition-all hover:bg-white/[0.05] hover:border-white/10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Instant Alerts</h3>
                  <p className="text-sm text-slate-500 mt-1">Receive immediate push notifications for coverage requests and period changes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-16 xl:left-24 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
          <span>Ruroxz Systems</span>
          <div className="h-1 w-1 rounded-full bg-slate-800" />
          <span>Institutional Node beta</span>
        </div>
      </div>

      {/* Right Panel - Interactive Login */}
      <div className="flex-1 flex flex-col bg-[#020617] relative lg:border-l lg:border-white/5 shadow-[-40px_0_80px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-hero-gradient opacity-10 pointer-events-none" />

        <div className="flex-1 flex flex-col px-8 sm:px-24 pt-20 pb-12 max-w-[800px] w-full mx-auto justify-center z-10">
          
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white tracking-tight leading-none mb-4">Secure Teacher Login</h2>
            <p className="text-slate-400 text-lg">Access your academic hub to manage period deployments.</p>
          </div>

          <div className="grid grid-cols-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-12">
            <button
              onClick={() => router.push('/')}
              className="py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all text-slate-500 hover:text-white"
            >
              Administrator
            </button>
            <button
              className="py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all bg-white text-slate-900 shadow-xl"
            >
              Teacher Entry
            </button>
          </div>

          <div className="p-1 w-full rounded-[40px] bg-gradient-to-br from-white/10 via-transparent to-white/5 shadow-2xl">
            <div className="bg-[#0f172a]/40 backdrop-blur-3xl rounded-[39px] p-10 sm:p-14 border border-white/5">
              
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                      Staff ID / Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@ruroxz.edu"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                        Security Token
                      </label>
                      <button type="button" className="text-[10px] font-bold text-primary hover:underline transition-all">FORGOT?</button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="session" className="h-5 w-5 bg-white/5 border-white/20 rounded-lg text-primary focus:ring-primary/20 accent-primary" />
                  <label htmlFor="session" className="text-sm text-slate-500 font-medium cursor-pointer">
                    Remember station credentials
                  </label>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-strong text-white text-[13px] font-black uppercase tracking-[0.2em] py-5 px-6 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "INITIALIZING NODE..." : "ESTABLISH ACCESS →"}
                </button>

                <div className="text-center">
                   <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
                     New Hire? <Link href="/teacher/signup" className="text-primary hover:text-white transition-colors">Request Account</Link>
                   </p>
                </div>
              </form>

              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-700 leading-relaxed max-w-[320px] mx-auto">
                  Encrypted Session Monitor Active. 
                  Unauthorized access is strictly audited.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
