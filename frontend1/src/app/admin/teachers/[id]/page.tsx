/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Teacher, TimetableEntry } from "@/lib/types";
import SectionCard from "@/components/SectionCard";
import AdminLayout from "@/components/AdminLayout";
import TimetableGrid from "@/components/TimetableGrid";
import AddSubjectModal from "@/components/AddSubjectModal";

export default function TeacherDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const { token, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  
  const [teacher, setTeacher] = useState<Teacher & { timetables: TimetableEntry[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [addingSubject, setAddingSubject] = useState(false);

  const loadTeacher = useCallback(async () => {
    if (!token || !teacherId) return;
    setError(null);
    try {
      const { teachers } = await apiFetch<{ teachers: (Teacher & { timetables: TimetableEntry[] })[] }>(
        "/api/teachers",
        {},
        token
      );
      const found = teachers.find((t) => t.id === teacherId);
      if (found) {
        setTeacher(found);
      } else {
        setError("Teacher not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teacher details");
    }
  }, [token, teacherId]);

  useEffect(() => {
    if (!loading) {
      void loadTeacher();
    }
  }, [loading, loadTeacher]);

  const handleAddSubject = (day: string, period: number) => {
    if (period > 8) {
       alert("Maximum 8 periods supported");
       return;
    }
    setSelectedDay(day);
    setSelectedPeriod(period);
    setModalOpen(true);
  };

  const handleConfirmAddSubject = async (subject: string, className: string, room: string) => {
    if (!token || !teacherId) return;
    setAddingSubject(true);
    try {
      await apiFetch(
        "/api/timetables",
        {
          method: "POST",
          body: JSON.stringify({
            teacherId,
            day: selectedDay,
            period: selectedPeriod,
            subject,
            className,
            room: room || null,
          }),
        },
        token
      );
      setModalOpen(false);
      await loadTeacher();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add subject");
    } finally {
      setAddingSubject(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!token || !teacherId) return;
    if (!confirm(`Are you sure you want to delete ${teacher?.name}? This action cannot be undone.`)) {
      return;
    }
    try {
      await apiFetch(`/api/teachers/${teacherId}`, { method: "DELETE" }, token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete teacher");
    }
  };

  if (loading || (!teacher && !error)) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center p-8 text-sm text-zinc-500">
          Loading teacher profile...
        </div>
      </AdminLayout>
    );
  }

  if (error && !teacher) {
    return (
      <AdminLayout>
        <div className="mx-auto flex w-full max-w-6xl flex-col px-8 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-700">Error</h2>
            <p className="mb-6 mt-2 text-red-600">{error}</p>
            <Link
              href="/admin/dashboard"
              className="rounded-full bg-red-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-8 py-12">
        <header className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-3xl font-bold text-amber-700 shadow-inner">
              {teacher?.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Teacher Profile
              </p>
              <h1 className="mt-1 text-3xl font-bold text-zinc-900">
                {teacher?.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                  ID: {teacher?.id.slice(-6)}
                </span>
                <span className="inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {teacher?.workload} total substitutions
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteTeacher}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete Teacher
            </button>
            <Link
              href="/admin/substitutions"
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Mark Absent
            </Link>
          </div>
        </header>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="grid gap-6 md:grid-cols-3">
          <SectionCard title="Assigned Subjects">
            <div className="flex flex-wrap gap-2">
              {teacher?.subjects.map((sub) => (
                <span
                  key={sub}
                  className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700"
                >
                  {sub}
                </span>
              ))}
              {teacher?.subjects.length === 0 && (
                <span className="text-sm text-zinc-500 italic">No subjects configured</span>
              )}
            </div>
          </SectionCard>
          
          <div className="md:col-span-2">
            <SectionCard title="Weekly Schedule" subtitle="Click any empty slot to assign a class">
              <TimetableGrid 
                entries={teacher?.timetables || []} 
                onAddSubject={handleAddSubject}
                isTeacher={false}
              />
            </SectionCard>
          </div>
        </section>

        <AddSubjectModal
          isOpen={modalOpen}
          day={selectedDay}
          period={selectedPeriod}
          onClose={() => setModalOpen(false)}
          onAdd={handleConfirmAddSubject}
          loading={addingSubject}
        />
      </div>
    </AdminLayout>
  );
}
