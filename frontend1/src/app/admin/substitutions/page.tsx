/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Teacher, Substitution } from "@/lib/types";
import SectionCard from "@/components/SectionCard";
import SubstitutionList from "@/components/SubstitutionList";

const days = ["MON", "TUE", "WED", "THU", "FRI"] as const;

export default function SubstitutionManagementPage() {
  const { token, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
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
      const teacherData = await apiFetch<{ teachers: Teacher[] }>(
        "/api/teachers",
        {},
        token
      );
      const substitutionData = await apiFetch<{ substitutions: Substitution[] }>(
        "/api/substitutions",
        {},
        token
      );
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

  const handleManual = async () => {
    if (!token) return;
    setError(null);
    await apiFetch(
      "/api/substitutions/manual",
      {
        method: "POST",
        body: JSON.stringify(manualForm),
      },
      token
    );
    loadData();
  };

  const handleAuto = async () => {
    if (!token) return;
    setError(null);
    await apiFetch(
      "/api/substitutions/auto",
      {
        method: "POST",
        body: JSON.stringify(autoForm),
      },
      token
    );
    loadData();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f5f1_0%,_#f0efe8_45%,_#e8e3d8_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Substitution Management
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              Assign coverage quickly
            </h1>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-flex h-11 items-center rounded-full border border-zinc-300 px-5 text-sm font-semibold text-zinc-800 transition hover:border-zinc-800"
          >
            Back to Dashboard
          </Link>
        </header>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Manual substitution" subtitle="Assign a specific teacher">
            <div className="space-y-4">
              <select
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                value={manualForm.absentTeacherId}
                onChange={(event) =>
                  setManualForm((prev) => ({
                    ...prev,
                    absentTeacherId: event.target.value,
                  }))
                }
              >
                <option value="">Absent teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                value={manualForm.replacementTeacherId}
                onChange={(event) =>
                  setManualForm((prev) => ({
                    ...prev,
                    replacementTeacherId: event.target.value,
                  }))
                }
              >
                <option value="">Replacement teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                  value={manualForm.day}
                  onChange={(event) =>
                    setManualForm((prev) => ({
                      ...prev,
                      day: event.target.value as typeof manualForm.day,
                    }))
                  }
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={manualForm.period}
                  onChange={(event) =>
                    setManualForm((prev) => ({
                      ...prev,
                      period: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                />
              </div>

              <input
                type="date"
                value={manualForm.date}
                onChange={(event) =>
                  setManualForm((prev) => ({ ...prev, date: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />

              <button
                onClick={handleManual}
                className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Assign manually
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Auto substitution" subtitle="Find the best available teacher">
            <div className="space-y-4">
              <select
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                value={autoForm.absentTeacherId}
                onChange={(event) =>
                  setAutoForm((prev) => ({
                    ...prev,
                    absentTeacherId: event.target.value,
                  }))
                }
              >
                <option value="">Absent teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                  value={autoForm.day}
                  onChange={(event) =>
                    setAutoForm((prev) => ({
                      ...prev,
                      day: event.target.value as typeof autoForm.day,
                    }))
                  }
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={autoForm.period}
                  onChange={(event) =>
                    setAutoForm((prev) => ({
                      ...prev,
                      period: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                />
              </div>

              <input
                type="date"
                value={autoForm.date}
                onChange={(event) =>
                  setAutoForm((prev) => ({ ...prev, date: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />

              <button
                onClick={handleAuto}
                className="w-full rounded-full border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900"
              >
                Auto-assign
              </button>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Recent substitutions" subtitle="Monitor assignments">
          <SubstitutionList substitutions={substitutions} />
        </SectionCard>
      </main>
    </div>
  );
}
