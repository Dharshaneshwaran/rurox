"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setStoredAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ADMIN" | "TEACHER">("ADMIN");
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

      if (activeTab === "ADMIN" && data.user.role !== "ADMIN") {
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }
      if (activeTab === "TEACHER" && data.user.role !== "TEACHER") {
        setError("This account is not approved for teacher access.");
        setLoading(false);
        return;
      }

      setStoredAuth(data.token, data.user);
      router.push(activeTab === "ADMIN" ? "/admin/dashboard" : "/teacher/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-body">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-[#1b1c1e] text-white p-16 xl:p-24 relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="max-w-xl z-10 relative">
          <h1 className="text-5xl xl:text-6xl font-display font-bold mb-6 tracking-tight">Ruroxz Time Management</h1>
          <div className="w-12 h-1 bg-white/20 mb-8"></div>

          <p className="text-lg xl:text-xl text-[#8E959E] mb-12 leading-relaxed">
            Smart timetable management—automated assignments, instant substitutions, zero confusion.
          </p>

          <div className="space-y-4">
            <div className="bg-[#242629] border border-white/5 p-6 rounded-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/70"></div>
                </div>
                <h3 className="font-semibold text-white">Real-time Allocation</h3>
              </div>
              <p className="text-sm text-[#8E959E] pl-9">.....</p>
            </div>

            <div className="bg-[#242629] border border-white/5 p-6 rounded-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white">Enterprise Security</h3>
              </div>
              <p className="text-sm text-[#8E959E] pl-9">.....</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-16 xl:left-24 text-[10px] uppercase tracking-[0.2em] text-[#8E959E]/50">
          © 2026 Ruroxz Timetable Assignment Systems. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col bg-[#F9FAFB] relative overflow-y-auto">
        <div className="flex-1 flex flex-col px-8 sm:px-16 pt-16 pb-8 max-w-[600px] w-full mx-auto justify-center">

          {/* Tabs */}
          <div className="flex gap-6 border-b border-[#E2E8F0] mb-12 uppercase text-xs tracking-widest font-semibold text-[#8E959E]">
            <button
              onClick={() => { setActiveTab("ADMIN"); setError(null); }}
              className={`pb-4 border-b-2 transition-colors ${activeTab === "ADMIN" ? "border-black text-black" : "border-transparent hover:text-black/70"}`}
            >
              Administrator Login
            </button>
            <button
              onClick={() => { setActiveTab("TEACHER"); setError(null); }}
              className={`pb-4 border-b-2 transition-colors ${activeTab === "TEACHER" ? "border-black text-black" : "border-transparent hover:text-black/70"}`}
            >
              Teacher Portal
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white border text-left border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-sm p-10 pb-8 mb-10">
            <h2 className="text-2xl font-semibold text-[#111827] mb-2 font-display">Sign In</h2>
            <p className="text-sm text-[#6B7280] mb-8">Enter your credentials to access the ledger.</p>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B5563] mb-2">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  className="w-full bg-[#F3F4F6] border-none text-sm px-4 py-3 focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-[#9CA3AF]"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B5563]">
                    Security Token
                  </label>
                  <a href="#" className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] hover:text-[#4B5563]">Recover?</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F3F4F6] border-none text-sm px-4 py-3 focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-[#9CA3AF]"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="session" className="w-3.5 h-3.5 border-gray-300 rounded-sm text-black focus:ring-black" />
                <label htmlFor="session" className="text-xs text-[#6B7280]">
                  Maintain active session for 8 hours
                </label>
              </div>

              {error && (
                <div className="text-xs text-red-500 bg-red-50 p-3 rounded-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4B4B4B] hover:bg-[#333333] text-white text-[11px] font-bold uppercase tracking-[0.15em] py-4 px-4 transition-colors flex justify-center items-center gap-2"
              >
                {loading ? "INITIALIZING..." : activeTab === "ADMIN" ? "INITIALIZE ACCESS →" : "ACCESS PORTAL →"}
              </button>

              {activeTab === "TEACHER" && (
                <div className="mt-4 text-center">
                  <Link href="/teacher/signup" className="text-xs text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest font-semibold border-b border-transparent hover:border-blue-800 pb-0.5">
                    Don't have an account? Sign up
                  </Link>
                </div>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
              <p className="text-[10px] text-center text-[#9CA3AF] leading-relaxed max-w-[280px] mx-auto">
                Authorized Personnel Only. All session activities are logged for auditing and security compliance within the Ruroxz Time Management framework.
              </p>
            </div>
          </div>

          {/* Support Links */}
          <div className="flex justify-between items-center px-4 w-full mb-12">
            <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280] flex items-center gap-2 hover:text-black transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              SYSTEM SUPPORT
            </button>
            <div className="w-1 h-1 rounded-full bg-[#D1D5DB]"></div>
            <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280] flex items-center gap-2 hover:text-black transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              PUBLIC DIRECTORY
            </button>
          </div>

        </div>


      </div>
    </div>
  );
}
