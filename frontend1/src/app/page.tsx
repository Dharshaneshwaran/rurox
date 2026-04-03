"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setStoredAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ADMIN" | "TEACHER">("ADMIN");
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 font-body flex items-center justify-center p-4 sm:p-8">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 border border-blue-200 mb-6">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">R</div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Ruroxz Teaching Hub</h1>
          <p className="text-slate-600 font-medium">Smart scheduling & teacher management</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-3 mb-8 p-1 bg-slate-100 rounded-full">
          <button
            onClick={() => { setActiveTab("ADMIN"); setError(null); }}
            className={cn(
              "flex-1 py-3 px-4 rounded-full font-bold text-sm transition-all duration-300",
              activeTab === "ADMIN" 
                ? "bg-white text-slate-900 shadow-md shadow-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Admin
          </button>
          <button
            onClick={() => { setActiveTab("TEACHER"); setError(null); }}
            className={cn(
              "flex-1 py-3 px-4 rounded-full font-bold text-sm transition-all duration-300",
              activeTab === "TEACHER" 
                ? "bg-white text-slate-900 shadow-md shadow-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Teacher
          </button>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900">Password</label>
                <button 
                  type="button" 
                  onClick={() => {}}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2 accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Keep me signed in</span>
            </label>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Signup Link */}
          {activeTab === "TEACHER" && (
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                New teacher?{" "}
                <Link href="/teacher/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Request Account
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-700 font-semibold">
            © 2026 Ruroxz Systems. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
