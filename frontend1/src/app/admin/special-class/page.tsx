"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Teacher } from "@/lib/types";

export default function SpecialClassAssignmentPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [notes, setNotes] = useState("");
  const [substituteTeacherId, setSubstituteTeacherId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
      apiFetch<{ teachers: Teacher[] }>("/api/teachers", {}, token)
        .then((data) => setTeachers(data.teachers))
        .catch((err) => console.error("Failed to load teachers", err));
    }
  }, [authLoading, token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !className.trim() || !date || !fromTime || !toTime) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiFetch(
        "/api/special-classes",
        {
          method: "POST",
          body: JSON.stringify({
            subject: subject.trim(),
            className: className.trim(),
            date,
            fromTime,
            toTime,
            notes: notes.trim() || undefined,
            substituteTeacherId: substituteTeacherId || undefined,
          }),
        },
        token
      );
      setSuccess(true);
      setSubject("");
      setClassName("");
      setDate(new Date().toISOString().slice(0, 10));
      setFromTime("");
      setToTime("");
      setNotes("");
      setSubstituteTeacherId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign special class.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex overflow-hidden">
      {/* Asymmetric Background Split - Left Side (Information & Images) */}
      <div className="hidden lg:flex lg:w-1/2 spine-gradient flex-col items-center justify-center p-12 relative overflow-y-auto">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-12 h-full w-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-stone-500/20 h-full"></div>
            ))}
          </div>
        </div>

        <div className="z-10 w-full max-w-xl">
          <div className="mb-10 text-left">
            <h1 className="font-headline text-5xl font-extrabold text-white tracking-tighter mb-4">Special Class Assignment</h1>
            <div className="h-1 w-12 bg-white/20 mb-6"></div>
            <p className="font-body text-stone-400 text-lg leading-relaxed mb-8">
              Schedule specialized out-of-band classes, extra revisions, and targeted educational sessions instantly. Ensure optimal resource allocation with the architectural ledger.
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4 auto-rows-[200px]">
            <div className="border border-white/10 rounded-lg overflow-hidden relative group">
              <img
                src="/sign_up.jpeg"
                alt="Sign Up"
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
            </div>
            <div className="border border-white/10 rounded-lg overflow-hidden relative group">
              <img
                src="/substitution.png"
                alt="Substitution"
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
            </div>
            <div className="border border-white/10 rounded-lg overflow-hidden relative group">
              <img
                src="/teacher.png"
                alt="Teacher"
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
            </div>
            <div className="border border-white/10 rounded-lg overflow-hidden relative group">
              <img
                src="/teacher_2.png"
                alt="Teacher 2"
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
            </div>
          </div>
        </div>

        <div className="absolute top-8 left-12 cursor-pointer z-50">
          <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="font-label text-xs uppercase tracking-widest">Back to Dashboard</span>
          </button>
        </div>

        <div className="absolute bottom-8 left-12">
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-stone-600">© 2026 Ruroxz Timetable Assignment Systems. All rights reserved.</p>
        </div>
      </div>

      {/* Main Workspace Page - Right Side (Form) */}
      <main className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 hero-gradient overflow-y-auto">
        <div className="w-full max-w-[500px] flex flex-col my-auto py-12">
          {/* Branding Mobile Only */}
          <div className="lg:hidden mb-8 text-center flex flex-col items-center">
            <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span className="font-label text-xs uppercase tracking-widest">Dashboard</span>
            </button>
            <h1 className="font-headline text-3xl font-extrabold text-inverse-surface tracking-tighter">Special Class Assignment</h1>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-2">Extra Session Allocation</p>
          </div>

          {/* Focus Container */}
          <div className="bg-surface-container-lowest p-8 rounded shadow-sm border border-surface-container-high relative">
            <div className="mb-8 border-b border-surface-container-high pb-6">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-background">Schedule Session</h2>
              <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
                Define the parameters for the specialized class. You may optionally request a specific teacher to cover this session.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="subject">Subject</label>
                <div className="relative group">
                  <input
                    className="w-full h-10 bg-surface border border-outline-variant/30 focus:border-transparent focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-outline-variant rounded-sm"
                    id="subject"
                    placeholder="e.g. Physics Revision"
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="className">Class Name</label>
                <div className="relative group">
                  <input
                    className="w-full h-10 bg-surface border border-outline-variant/30 focus:border-transparent focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-outline-variant rounded-sm"
                    id="className"
                    placeholder="e.g. 12th Grade Science"
                    required
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="date">Date</label>
                <div className="relative group">
                  <input
                    className="w-full h-10 bg-surface border border-outline-variant/30 focus:border-transparent focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-outline-variant rounded-sm"
                    id="date"
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="fromTime">From Time</label>
                  <div className="relative group">
                    <input
                      className="w-full h-10 bg-surface border border-outline-variant/30 focus:border-transparent focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-outline-variant rounded-sm"
                      id="fromTime"
                      required
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="toTime">To Time</label>
                  <div className="relative group">
                    <input
                      className="w-full h-10 bg-surface border border-outline-variant/30 focus:border-transparent focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-outline-variant rounded-sm"
                      id="toTime"
                      required
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="notes">Notes (Optional)</label>
                <div className="relative group">
                  <input
                    className="w-full h-10 bg-surface border border-outline-variant/30 focus:border-transparent focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all placeholder:text-outline-variant rounded-sm"
                    id="notes"
                    placeholder="e.g. Bring calculators"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="substitute">Requested Substitute (Optional)</label>
                <div className="relative group">
                  <select
                    className="w-full h-10 bg-surface border border-outline-variant/30 focus:border-transparent focus:ring-1 focus:ring-primary text-sm font-body px-3 transition-all text-on-surface rounded-sm"
                    id="substitute"
                    value={substituteTeacherId}
                    onChange={(e) => setSubstituteTeacherId(e.target.value)}
                  >
                    <option value="">None</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : null}

              {success ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                  <p className="text-sm text-green-700">Special class scheduled successfully.</p>
                </div>
              ) : null}

              <div className="pt-4">
                <button
                  className="w-full h-10 milled-button text-on-primary font-label text-[11px] uppercase tracking-[0.15em] font-bold rounded shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "SCHEDULING..." : "SCHEDULE CLASS"}
                  <span className="material-symbols-outlined text-sm">event_available</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
