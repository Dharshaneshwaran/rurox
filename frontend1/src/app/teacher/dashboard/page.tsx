/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { TimetableEntry, Substitution, SpecialClass } from "@/lib/types";
import TimetableGrid from "@/components/TimetableGrid";
import AddSubjectModal from "@/components/AddSubjectModal";
import SectionCard from "@/components/SectionCard";
import SubstitutionList from "@/components/SubstitutionList";
import SpecialClassesList from "@/components/SpecialClassesList";

export default function TeacherDashboardPage() {
  const { token, user, loading, clear } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [specialClasses, setSpecialClasses] = useState<SpecialClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [addingSubject, setAddingSubject] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const timetableData = await apiFetch<{ timetables: TimetableEntry[] }>(
        "/api/timetables/mine",
        {},
        token
      );
      const substitutionData = await apiFetch<{ substitutions: Substitution[] }>(
        "/api/substitutions",
        {},
        token
      );
      const specialData = await apiFetch<{ specialClasses: SpecialClass[] }>(
        "/api/special-classes",
        {},
        token
      );

      setTimetables(timetableData.timetables);
      setSubstitutions(substitutionData.substitutions);
      setSpecialClasses(specialData.specialClasses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadData();
    }
  }, [loading, loadData]);

  const handleAddSubject = (day: string, period: number) => {
    setSelectedDay(day);
    setSelectedPeriod(period);
    setModalOpen(true);
  };

  const handleConfirmAddSubject = async (subject: string, className: string, room: string) => {
    if (!token || !user?.teacherId) return;
    setAddingSubject(true);
    try {
      await apiFetch(
        "/api/timetables",
        {
          method: "POST",
          body: JSON.stringify({
            teacherId: user.teacherId,
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
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add subject");
    } finally {
      setAddingSubject(false);
    }
  };

  const timetableWithSubs = useMemo(() => {
    const marked = [...timetables];
    substitutions.forEach((sub) => {
      if (sub.replacementTeacher?.name && user?.teacherId) {
        marked.push({
          day: sub.day,
          period: sub.period,
          subject: "Substitution",
          className: "Assigned",
          room: null,
          isSubstitution: true,
        });
      }
    });
    return marked;
  }, [timetables, substitutions, user?.teacherId]);

  if (loading) {
    return <div className="p-8 text-sm text-zinc-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f5f1_0%,_#f0efe8_45%,_#e8e3d8_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Teacher Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              Hello{user?.name ? `, ${user.name}` : ""}
            </h1>
          </div>
          <button
            onClick={() => {
              clear();
              window.location.href = "/";
            }}
            className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white"
          >
            Sign out
          </button>
        </header>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <SectionCard
          title="Weekly Timetable"
          subtitle="Substitutions are highlighted"
        >
          <TimetableGrid 
            entries={timetableWithSubs} 
            onAddSubject={handleAddSubject}
            isTeacher={true}
          />
        </SectionCard>

        <AddSubjectModal
          isOpen={modalOpen}
          day={selectedDay}
          period={selectedPeriod}
          onClose={() => setModalOpen(false)}
          onAdd={handleConfirmAddSubject}
          loading={addingSubject}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Special Classes" subtitle="Extra sessions and events">
            <SpecialClassesList items={specialClasses} />
          </SectionCard>
          <SectionCard title="Substitution Alerts" subtitle="Your assigned covers">
            <SubstitutionList substitutions={substitutions} />
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
