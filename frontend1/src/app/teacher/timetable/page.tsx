"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TeacherLayout from "@/components/TeacherLayout";
import TimetableGrid from "@/components/TimetableGrid";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { TimetableEntry, Substitution } from "@/lib/types";

export default function TeacherTimetablePage() {
  const router = useRouter();
  const { token, user, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
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
      setTimetables(timetableData.timetables);
      setSubstitutions(substitutionData.substitutions.filter(s => s.replacementTeacher?.id === user?.teacherId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timetable");
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.teacherId]);

  useEffect(() => {
    if (!loading) {
      void loadData();
    }
  }, [loading, loadData]);

  const handleEntryClick = (entry: TimetableEntry) => {
    if (entry.schoolClassId) {
      router.push(`/teacher/classes/${entry.schoolClassId}`);
    }
  };

  const timetableWithSubs = [...timetables];
  substitutions.forEach((sub) => {
    timetableWithSubs.push({
      day: sub.day,
      period: sub.period,
      subject: "Substitution",
      className: "Assigned cover",
      room: null,
      isSubstitution: true,
    });
  });

  return (
    <TeacherLayout>
      <div className="px-4 py-6 sm:px-8 lg:px-10 xl:px-12">
        <PageHeader
          variant="command"
          backgroundImage="/teacher_2.png"
          eyebrow="Schedule"
          title="My Weekly Classes"
          description="View your core teaching schedule and any assigned substitution periods for the current week."
        />

        <div className="mt-8">
          <SectionCard
            title="Teaching Schedule"
            subtitle="Full weekly overview of your assigned periods and cover work."
          >
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-sm text-[var(--color-text-muted)] animate-pulse">Loading schedule...</div>
              </div>
            ) : (
              <TimetableGrid entries={timetableWithSubs} onEntryClick={handleEntryClick} />
            )}
          </SectionCard>
        </div>
      </div>
    </TeacherLayout>
  );
}
