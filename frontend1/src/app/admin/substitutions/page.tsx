/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  Teacher,
  Substitution,
  FullDaySuggestionResponse,
  PeriodSuggestion,
} from "@/lib/types";
import SectionCard from "@/components/SectionCard";
import SubstitutionList from "@/components/SubstitutionList";

const days = ["MON", "TUE", "WED", "THU", "FRI"] as const;

type Step = "select" | "review" | "confirmed";

import AdminLayout from "@/components/AdminLayout";

export default function SubstitutionManagementPage() {
  const { token, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);

  // Full-day flow state
  const [step, setStep] = useState<Step>("select");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [suggestions, setSuggestions] = useState<FullDaySuggestionResponse | null>(null);
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);

  // Advanced mode
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualForm, setManualForm] = useState({
    absentTeacherId: "",
    replacementTeacherId: "",
    day: "MON",
    period: 1,
    date: new Date().toISOString().slice(0, 10),
  });
  const [autoForm, setAutoForm] = useState({
    absentTeacherId: "",
    day: "MON",
    period: 1,
    date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [teacherData, substitutionData] = await Promise.all([
        apiFetch<{ teachers: Teacher[] }>("/api/teachers", {}, token),
        apiFetch<{ substitutions: Substitution[] }>("/api/substitutions", {}, token),
      ]);
      setTeachers(teacherData.teachers);
      setSubstitutions(substitutionData.substitutions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadData();
    }
  }, [loading, loadData]);

  const handleFindSubstitutes = async () => {
    if (!token || !selectedTeacherId || !selectedDate) return;
    setError(null);
    setLoadingSuggestions(true);
    try {
      const result = await apiFetch<FullDaySuggestionResponse>(
        "/api/substitutions/suggest-full-day",
        {
          method: "POST",
          body: JSON.stringify({
            absentTeacherId: selectedTeacherId,
            date: selectedDate,
          }),
        },
        token
      );
      setSuggestions(result);
      // Pre-fill assignments with suggested teachers
      const initial: Record<number, string> = {};
      result.suggestions.forEach((s: PeriodSuggestion) => {
        if (s.suggestedTeacher) {
          initial[s.period] = s.suggestedTeacher.id;
        }
      });
      setAssignments(initial);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleConfirmAll = async () => {
    if (!token || !suggestions) return;
    setError(null);
    setConfirmingAll(true);
    try {
      const assignmentList = Object.entries(assignments)
        .filter(([, teacherId]) => teacherId)
        .map(([period, teacherId]) => ({
          period: Number(period),
          replacementTeacherId: teacherId,
        }));

      if (assignmentList.length === 0) {
        setError("No assignments selected");
        return;
      }

      const result = await apiFetch<{ count: number }>(
        "/api/substitutions/confirm-full-day",
        {
          method: "POST",
          body: JSON.stringify({
            absentTeacherId: suggestions.absentTeacher.id,
            date: suggestions.date,
            assignments: assignmentList,
          }),
        },
        token
      );
      setConfirmedCount(result.count);
      setStep("confirmed");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm");
    } finally {
      setConfirmingAll(false);
    }
  };

  const handleReset = () => {
    setStep("select");
    setSuggestions(null);
    setAssignments({});
    setConfirmedCount(0);
    setSelectedTeacherId("");
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setError(null);
  };

  const handleManual = async () => {
    if (!token) return;
    setError(null);
    try {
      await apiFetch(
        "/api/substitutions/manual",
        { method: "POST", body: JSON.stringify(manualForm) },
        token
      );
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manual assignment failed");
    }
  };

  const handleAuto = async () => {
    if (!token) return;
    setError(null);
    try {
      await apiFetch(
        "/api/substitutions/auto",
        { method: "POST", body: JSON.stringify(autoForm) },
        token
      );
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto assignment failed");
    }
  };

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  return (
    <AdminLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 py-12">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Substitution Management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-900">
              Manage Teacher Absences
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Mark a teacher absent and assign substitutes for every period
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex items-center gap-3">
          {[
            { key: "select", label: "1. Select Teacher", icon: "👤" },
            { key: "review", label: "2. Review Suggestions", icon: "📋" },
            { key: "confirmed", label: "3. Confirmed", icon: "✅" },
          ].map((s, i) => {
            const isActive = step === s.key;
            const isPast =
              (s.key === "select" && step !== "select") ||
              (s.key === "review" && step === "confirmed");
            return (
              <div key={s.key} className="flex items-center gap-3">
                {i > 0 && (
                  <div
                    className={`h-px w-8 transition-all duration-500 ${
                      isPast ? "bg-amber-500" : "bg-zinc-200"
                    }`}
                  />
                )}
                <div
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-500 ${
                    isActive
                      ? "bg-amber-100/50 text-amber-900 shadow-sm"
                      : isPast
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-white text-zinc-500"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 1: Select Teacher */}
        {step === "select" && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">
                Mark Teacher Absent for the Day
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Select the teacher who is absent and the date. The system will find the best available substitutes for every period.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Absent Teacher
                </label>
                <select
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.subjects.join(", ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Date of Absence
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
              </div>
            </div>

            <button
              onClick={handleFindSubstitutes}
              disabled={!selectedTeacherId || !selectedDate || loadingSuggestions}
              className="mt-6 w-full rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              {loadingSuggestions ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Finding substitutes...
                </span>
              ) : (
                "🔍 Find Substitutes"
              )}
            </button>
          </div>
        )}

        {/* Step 2: Review Suggestions */}
        {step === "review" && suggestions && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">
                    Substitution Plan for{" "}
                    <span className="text-amber-700">
                      {suggestions.absentTeacher.name}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {suggestions.day} •{" "}
                    {new Date(suggestions.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {" • "}
                    {suggestions.suggestions.length} period{suggestions.suggestions.length !== 1 ? "s" : ""} to cover
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
                >
                  ← Change Teacher
                </button>
              </div>

              {suggestions.suggestions.length === 0 ? (
                <div className="rounded-2xl bg-zinc-50 p-8 text-center">
                  <p className="text-lg text-zinc-500">
                    {suggestions.message || "No classes found for this teacher on this day."}
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 rounded-full bg-zinc-200 px-6 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-300"
                  >
                    Go Back
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-2xl border border-zinc-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                        <tr>
                          <th className="px-5 py-3.5">Period</th>
                          <th className="px-5 py-3.5">Class</th>
                          <th className="px-5 py-3.5">Subject</th>
                          <th className="px-5 py-3.5">Room</th>
                          <th className="px-5 py-3.5">Substitute Teacher</th>
                          <th className="px-5 py-3.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suggestions.suggestions.map((s: PeriodSuggestion) => {
                          const currentAssignment = assignments[s.period];
                          const hasSubstitute = Boolean(currentAssignment);
                          return (
                            <tr
                              key={s.period}
                              className="border-t border-zinc-200 transition hover:bg-zinc-50"
                            >
                              <td className="px-5 py-4">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-sm font-bold text-amber-700">
                                  {s.period}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-medium text-zinc-900">
                                {s.className}
                              </td>
                              <td className="px-5 py-4 text-zinc-600">{s.subject}</td>
                              <td className="px-5 py-4 text-zinc-400">{s.room || "—"}</td>
                              <td className="px-5 py-4">
                                {s.allCandidates.length > 0 ? (
                                  <select
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition focus:border-amber-400 focus:outline-none"
                                    value={currentAssignment || ""}
                                    onChange={(e) =>
                                      setAssignments((prev) => ({
                                        ...prev,
                                        [s.period]: e.target.value,
                                      }))
                                    }
                                  >
                                    <option value="">— Skip this period —</option>
                                    {s.allCandidates.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name}
                                        {c.subjectMatch ? " ★" : ""}
                                        {" ("}
                                        {c.subjects.join(", ")}
                                        {", load: "}
                                        {c.workload}
                                        {")"}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-sm italic text-red-600">
                                    No available teachers
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-center">
                                {hasSubstitute ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Ready
                                  </span>
                                ) : s.allCandidates.length === 0 ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    No sub
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                    Skipped
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary bar */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-4">
                    <div className="flex gap-6 text-sm">
                      <span className="text-zinc-500">
                        Total periods:{" "}
                        <span className="font-semibold text-zinc-900">
                          {suggestions.suggestions.length}
                        </span>
                      </span>
                      <span className="text-emerald-700">
                        ✓ Assigned:{" "}
                        <span className="font-semibold">
                          {Object.values(assignments).filter(Boolean).length}
                        </span>
                      </span>
                      <span className="text-yellow-700">
                        ○ Skipped:{" "}
                        <span className="font-semibold">
                          {suggestions.suggestions.length -
                            Object.values(assignments).filter(Boolean).length}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={handleConfirmAll}
                      disabled={
                        confirmingAll ||
                        Object.values(assignments).filter(Boolean).length === 0
                      }
                      className="rounded-xl bg-zinc-900 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {confirmingAll ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />
                          Confirming...
                        </span>
                      ) : (
                        `✓ Confirm ${Object.values(assignments).filter(Boolean).length} Assignment${Object.values(assignments).filter(Boolean).length !== 1 ? "s" : ""}`
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirmed */}
        {step === "confirmed" && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-emerald-900">
              Substitutions Confirmed!
            </h2>
            <p className="mt-2 text-sm text-emerald-700">
              {confirmedCount} substitution{confirmedCount !== 1 ? "s" : ""} have been
              assigned for{" "}
              <span className="font-semibold">
                {selectedTeacher?.name || "the teacher"}
              </span>
            </p>
            <button
              onClick={handleReset}
              className="mt-6 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Mark Another Teacher Absent
            </button>
          </div>
        )}

        {/* Recent Substitutions */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-zinc-900">Recent Substitutions</h3>
            <p className="text-sm text-zinc-500">All assigned substitutions</p>
          </div>
          <SubstitutionList substitutions={substitutions} variant="light" />
        </div>

        {/* Advanced: Per-Period Forms */}
        <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between px-8 py-5 text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Advanced: Per-Period Management
              </h3>
              <p className="text-sm text-zinc-500">
                Manual and single-period auto assignment
              </p>
            </div>
            <span
              className={`text-zinc-400 transition-transform duration-300 ${
                showAdvanced ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {showAdvanced && (
            <div className="border-t border-zinc-100 p-8 bg-zinc-50/50 rounded-b-3xl">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Manual Form */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-700">
                    Manual Substitution
                  </h4>
                  <div className="space-y-3">
                    <select
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                      value={manualForm.absentTeacherId}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          absentTeacherId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Absent teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                      value={manualForm.replacementTeacherId}
                      onChange={(e) =>
                        setManualForm((p) => ({
                          ...p,
                          replacementTeacherId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Replacement teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                        value={manualForm.day}
                        onChange={(e) =>
                          setManualForm((p) => ({ ...p, day: e.target.value }))
                        }
                      >
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={manualForm.period}
                        onChange={(e) =>
                          setManualForm((p) => ({
                            ...p,
                            period: Number(e.target.value),
                          }))
                        }
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                        placeholder="Period"
                      />
                    </div>
                    <input
                      type="date"
                      value={manualForm.date}
                      onChange={(e) =>
                        setManualForm((p) => ({ ...p, date: e.target.value }))
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      onClick={handleManual}
                      className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      Assign Manually
                    </button>
                  </div>
                </div>

                {/* Auto Form */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-700">
                    Auto Substitution (Single Period)
                  </h4>
                  <div className="space-y-3">
                    <select
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                      value={autoForm.absentTeacherId}
                      onChange={(e) =>
                        setAutoForm((p) => ({
                          ...p,
                          absentTeacherId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Absent teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                        value={autoForm.day}
                        onChange={(e) =>
                          setAutoForm((p) => ({ ...p, day: e.target.value }))
                        }
                      >
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={autoForm.period}
                        onChange={(e) =>
                          setAutoForm((p) => ({
                            ...p,
                            period: Number(e.target.value),
                          }))
                        }
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                        placeholder="Period"
                      />
                    </div>
                    <input
                      type="date"
                      value={autoForm.date}
                      onChange={(e) =>
                        setAutoForm((p) => ({ ...p, date: e.target.value }))
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      onClick={handleAuto}
                      className="w-full rounded-xl border border-zinc-200 hover:bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 transition"
                    >
                      Auto-Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
