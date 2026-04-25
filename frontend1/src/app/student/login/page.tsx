"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { setStoredAuth } from "@/hooks/useAuth";
import type { User } from "@/lib/types";

export default function StudentLoginPage() {
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

      if (data.user.role !== "STUDENT") {
        setError("This account is not a student account.");
        setLoading(false);
        return;
      }

      setStoredAuth(data.token, data.user);
      router.push("/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 spine-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-12 h-full w-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-stone-500/20 h-full"></div>
            ))}
          </div>
        </div>
        <div className="z-10 max-w-md">
          <div className="mb-8">
            <h1 className="font-headline text-5xl font-extrabold text-white tracking-tighter mb-4">Timeassignment@ruroxz</h1>
            <div className="h-1 w-12 bg-white/20 mb-6"></div>
            <p className="font-body text-stone-300 text-lg leading-relaxed">
              Student access for schedule visibility, learning continuity, and classroom updates in one place.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4 rounded bg-white/5 border border-white/10 p-4">
              <span className="material-symbols-outlined text-stone-300">school</span>
              <div>
                <p className="text-white font-semibold text-sm">Student-ready workspace</p>
                <p className="text-stone-400 text-xs mt-1">Access school-facing information from a clean dashboard.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded bg-white/5 border border-white/10 p-4">
              <span className="material-symbols-outlined text-stone-300">notifications_active</span>
              <div>
                <p className="text-white font-semibold text-sm">Connected updates</p>
                <p className="text-stone-400 text-xs mt-1">Stay aligned with timetable-linked notifications and access controls.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 hero-gradient">
        <div className="w-full max-w-[400px] flex flex-col">
          <div className="lg:hidden mb-12 text-center">
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-[var(--color-text)]">Timeassignment@ruroxz</h1>
            <p className="font-label mt-2 text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">Student Access Portal</p>
          </div>

          <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => router.push("/admin/login")}
              className="flex-shrink-0 group flex flex-col items-start opacity-40 hover:opacity-100 transition-opacity"
            >
              <span className="font-label text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">Administrator Login</span>
              <span className="mt-1 h-[2px] w-full scale-x-0 bg-border transition-transform origin-left group-hover:scale-x-100"></span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/teacher/login")}
              className="flex-shrink-0 group flex flex-col items-start opacity-40 hover:opacity-100 transition-opacity"
            >
              <span className="font-label text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">Teacher Portal</span>
              <span className="mt-1 h-[2px] w-full scale-x-0 bg-border transition-transform origin-left group-hover:scale-x-100"></span>
            </button>
            <button className="flex-shrink-0 group flex flex-col items-start" type="button">
              <span className="font-label text-[11px] uppercase tracking-wider text-primary font-bold">Student Portal</span>
              <span className="mt-1 h-[2px] w-full scale-x-100 bg-primary transition-transform origin-left"></span>
            </button>
            <div className="flex-grow h-[1px] bg-border/40 mb-[2px]"></div>
          </div>

          <div className="bg-white p-8 rounded shadow-sm border border-border relative">
            <div className="mb-8">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Student Sign In</h2>
              <p className="font-body text-xs text-muted-foreground mt-1">Use your student credentials to access your workspace.</p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest text-muted-foreground font-semibold" htmlFor="email">Student Email</label>
                <input
                  className="w-full h-10 bg-surface-subtle border border-border focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-muted-foreground rounded-md"
                  id="email"
                  name="email"
                  placeholder="student@school.edu"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest text-muted-foreground font-semibold" htmlFor="password">Password</label>
                <input
                  className="w-full h-10 bg-surface-subtle border border-border focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-muted-foreground rounded-md"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                className="w-full h-10 milled-button font-label text-[11px] uppercase tracking-[0.15em] font-bold rounded shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "INITIALIZING..." : "OPEN STUDENT HUB"}
                <span className="material-symbols-outlined text-sm">login</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="font-body text-[10px] text-muted-foreground leading-relaxed">
                Student access is intended for timetable visibility and school-linked updates within the Ruroxz platform.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
