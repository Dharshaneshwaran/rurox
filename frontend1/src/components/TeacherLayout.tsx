"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useState } from "react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clear, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TC";

  const handleSignOut = () => {
    clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 lg:grid lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col gap-8 px-6 py-8">
        {/* Logo */}
        <Link href="/teacher/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold">
            R
          </div>
          <span className="font-bold text-lg text-slate-900">Ruroxz</span>
        </Link>

        {/* Nav */}
        <div className="flex-1">
          <nav className="flex flex-col gap-2">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm bg-emerald-100 text-emerald-700"
            >
              <span className="text-lg">📅</span>
              My Timetable
            </Link>
          </nav>
        </div>

        {/* User Section */}
        <div className="flex flex-col gap-4 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate text-sm">{user.name}</p>
              <p className="text-xs text-slate-700 font-semibold truncate">Teacher</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="sticky top-0 z-20 lg:hidden bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <Link href="/teacher/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center text-sm font-bold">
            R
          </div>
          <span className="font-bold text-slate-900">Ruroxz</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-6 fixed inset-x-0 top-16 z-10">
          <nav className="flex flex-col gap-2 mb-4">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm bg-emerald-100 text-emerald-700"
            >
              <span className="text-lg">📅</span>
              My Timetable
            </Link>
          </nav>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:col-span-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
