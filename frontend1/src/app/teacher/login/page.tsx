"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setStoredAuth } from "@/hooks/useAuth";
import type { User } from "@/lib/types";

export default function TeacherLoginPage() {
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
    <div className="bg-surface text-on-surface min-h-screen flex overflow-hidden">
      {/* Asymmetric Background Split */}
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
            <p className="font-body text-stone-400 text-lg leading-relaxed">
              Smart timetable management—automated assignments, instant substitutions, zero confusion.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4 p-4 rounded bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-stone-400">speed</span>
              <div>
                <p className="text-white font-semibold text-sm">Real-time Allocation</p>
                <p className="text-stone-500 text-xs mt-1">.....</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-stone-400">verified_user</span>
              <div>
                <p className="text-white font-semibold text-sm">Enterprise Security</p>
                <p className="text-stone-500 text-xs mt-1">.....</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-12">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-stone-600">© 2026 Ruroxz Timetable Assignment Systems. All rights reserved.</p>
        </div>
      </div>

      {/* Main Workspace Page */}
      <main className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 hero-gradient">
        <div className="w-full max-w-[400px] flex flex-col">
          {/* Branding Mobile Only */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="font-headline text-3xl font-extrabold text-inverse-surface tracking-tighter">Timeassignment@ruroxz</h1>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-2">Resource Management Portal</p>
          </div>

          {/* Role Selection (Asymmetric Tabs) */}
          <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            <button
              type="button"
              onClick={() => router.push('/admin/login')}
              className="flex-shrink-0 group flex flex-col items-start opacity-40 hover:opacity-100 transition-opacity"
            >
              <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant">Administrator Login</span>
              <span className="h-[2px] w-full bg-outline-variant mt-1 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </button>
            <button className="flex-shrink-0 group flex flex-col items-start" type="button">
              <span className="font-label text-[11px] uppercase tracking-wider text-primary font-bold">Teacher Portal</span>
              <span className="h-[2px] w-full bg-primary mt-1 scale-x-100 transition-transform origin-left"></span>
            </button>
            <div className="flex-grow h-[1px] bg-outline-variant/20 mb-[2px]"></div>
          </div>

          {/* Focus Container */}
          <div className="bg-surface-container-lowest p-8 rounded shadow-sm border border-surface-container-high relative">
            <div className="mb-8">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-background">Sign In</h2>
              <p className="font-body text-xs text-on-surface-variant mt-1">Enter your credentials to access the ledger.</p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="email" >Institutional Email</label>
                <div className="relative group">
                  <input
                    className="w-full h-9 bg-surface-container-low border-0 focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-outline-variant"
                    id="email"
                    name="email"
                    placeholder="name@school.edu"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary group-focus-within:w-full transition-all duration-300"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="password">Security Token</label>
                </div>
                <div className="relative group">
                  <input
                    className="w-full h-9 bg-surface-container-low border-0 focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-outline-variant"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary group-focus-within:w-full transition-all duration-300"></div>
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              {/* Options */}
              <div className="flex items-center gap-2 py-2">
                <input className="w-3 h-3 rounded-none border-outline-variant text-primary focus:ring-0 focus:ring-offset-0" id="remember" type="checkbox" />
                <label className="font-body text-[11px] text-on-surface-variant select-none" htmlFor="remember">Maintain active session for 8 hours</label>
              </div>

              {/* Primary CTA */}
              <button
                className="w-full h-9 milled-button text-on-primary font-label text-[11px] uppercase tracking-[0.15em] font-bold rounded shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "INITIALIZING..." : "INITIALIZE ACCESS"}
                <span className="material-symbols-outlined text-sm">login</span>
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-8 pt-6 border-t border-surface-container-high text-center">
              <p className="font-body text-[10px] text-on-surface-variant leading-relaxed">
                Authorized Personnel Only. All session activities are logged for auditing and security compliance within the Timeassignment@ruroxz framework.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Floating Image - Editorial Quality */}
        <div className="mt-20 w-full max-w-2xl hidden md:block opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="grid grid-cols-3 gap-1 h-24 overflow-hidden rounded-sm">
            <img alt="Clean modern office architecture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANNgODKlhCLrnvGrLOpu6L-Al5UndlfJZKhe-MVeP_-p9zA34bpaESfeejvVBKJ2ZFXK1PM4bsxl6R-ucJMAsVQPiOkBowzSsDLdCPxC75aYqcayeFzrORNnXpo3xENdgPbfqHUWhkSOq68xoIhGuZN93RT_yUuuM-vfIh5nrEpwgUSwAzRxAkR4Tkqe7nYqO8jO0gntv9nYdjwtuULlJmDhas3taSN2s1I-gdlA49EpRbhJCfirwQOIZ9WUNxPwrI-vcwU7LSgFo" />
            <img alt="Structured library" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8kdtqmiKVxmERklbu55t4uCoXebe8x0Edfx1qM0mvoBmI4-WYIrFKLEI8lCwawu6LGZEL6mpyEsOL8VNJlsiRe8g1lsA9x1umuPJTDKckiAsL0LnOhdycfcZBMRJQCaTTYduLV6xZttJlilHJMngG2Bax8YK6o-3gg9Bqanh3CqHrZOk8RfUwZ8aLejP3xBWi1N2RnYDbGlUNQNUN4gpPCGmtn8lqbb_ySa5-QCFLjGBSYTpPvmUMFBzNJxiO7HmXOxGLfgI5tfM" />
            <img alt="Professional planner" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDENQCdnwbwaaX7pw1QI_w4KWw90oIIx6cOPLWyYgL8q6NzvXZSIoY57KyQ04Gne_zJM4cko2tW6rkNk3XCr7W-60-gcvp_NEwtLhZiahT8MQexQT8staSgsWK9l-n7ZiJ5a_7RzmBA4V2EKExwjM7K0Sp9l5-E5nDujMrzsXDW184FTFUn5d0UfY6rgkY9--58OqT3kgGozDP8tzvGGbpiXbIKUJZf9ri64INfyjwrlvrPIeo1ssTD6_J5AVJGR1tanyf8r3ggoZQ" />
          </div>
        </div>
      </main>
    </div>
  );
}
