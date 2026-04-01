"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setStoredAuth } from "@/hooks/useAuth";
import type { User } from "@/lib/types";
import { LockIcon, MailIcon, ShieldIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import AppMark from "@/components/ui/AppMark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      if (data.user.role !== "ADMIN") {
        setError("CLEARANCE LEVEL INSUFFICIENT.");
        setLoading(false);
        return;
      }

      setStoredAuth(data.token, data.user);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ACCESS DENIED: NODE SYNCHRONIZATION FAILED.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-theme bg-[#020617] h-screen w-screen overflow-hidden relative flex flex-col items-center justify-center p-6 selection:bg-primary/20">
      {/* Institutional Blueprint Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]" />
         <div className="absolute inset-0 page-shell opacity-40" />
         <div className="absolute top-1/2 left-0 w-full h-px bg-white/[0.03]" />
         <div className="absolute left-1/2 top-0 w-px h-full bg-white/[0.03]" />
      </div>

      {/* Entry Module */}
      <main className="relative z-10 w-full max-w-[480px]">
        <div className="card-reveal p-12 border border-white/5 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          
          <div className="flex flex-col items-center text-center mb-12">
             <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] mb-8">
                <AppMark hideText inverse className="scale-75" />
             </div>
             <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase leading-none">Ruroxz Core</h1>
             <p className="mt-3 text-[10px] font-black uppercase tracking-[0.6em] text-slate-500">Security Deployment Node</p>
          </div>

          {error && (
            <div className="mb-8 p-6 rounded-2xl bg-danger/5 border border-danger/10 text-[10px] font-black uppercase tracking-widest text-danger italic text-center animate-shake">
               ERR: {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 px-1">Clearance Identity</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors">
                  <MailIcon className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-white/5 bg-white/5 pl-14 pr-6 text-[14px] font-black tracking-tight text-white placeholder:text-slate-700 focus:border-primary/50 focus:outline-none transition-all"
                  placeholder="admin@institutional.hub"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 px-1">Security Token</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors">
                  <LockIcon className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-white/5 bg-white/5 pl-14 pr-6 text-[14px] font-black tracking-tight text-white placeholder:text-slate-700 focus:border-primary/50 focus:outline-none transition-all"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="accent"
              className="h-16 w-full shadow-[0_10px_40px_rgba(16,185,129,0.3)] transition-all active:scale-95"
            >
              <div className="flex items-center justify-center gap-3">
                <ShieldIcon className="h-5 w-5" />
                <span className="font-black uppercase tracking-widest text-[12px]">{loading ? "Synchronizing..." : "Infiltrate System"}</span>
              </div>
            </Button>
          </form>

          <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
             <button type="button" onClick={() => router.push('/teacher/login')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Personnel Portal</button>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800 italic">SYSTEM STATUS: ACTIVE</span>
          </div>
        </div>

        <p className="mt-12 text-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
          © 2026 Ruroxz Systems. All Session Nodes Logged.
        </p>
      </main>
    </div>
  );
}
