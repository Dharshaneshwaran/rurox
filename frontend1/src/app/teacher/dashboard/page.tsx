"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddSubjectModal from "@/components/AddSubjectModal";
import SectionCard from "@/components/SectionCard";
import SpecialClassesList from "@/components/SpecialClassesList";
import SubstitutionList from "@/components/SubstitutionList";
import TeacherLayout from "@/components/TeacherLayout";
import TimetableGrid from "@/components/TimetableGrid";
import { BookIcon, CalendarIcon, ClockIcon, SwapIcon } from "@/components/icons";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { SpecialClass, Substitution, TimetableEntry } from "@/lib/types";

export default function TeacherDashboardPage() {
  const { token, user, loading } = useAuth({
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

  const handleConfirmAddSubject = async (
    subject: string,
    className: string,
    room: string
  ) => {
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
          className: "Assigned cover",
          room: null,
          isSubstitution: true,
        });
      }
    });
    return marked;
  }, [substitutions, timetables, user?.teacherId]);

  const openSlots = Math.max(40 - timetables.length, 0);

  return (
    <TeacherLayout>
      <div className="px-4 py-6 sm:px-8 lg:px-10 xl:px-12">
        <PageHeader
          eyebrow="Teacher dashboard"
          title={`Hello${user?.name ? `, ${user.name}` : ""}`}
          description="Review your week, monitor special sessions, and keep open timetable slots filled without losing sight of assigned cover work."
          meta={
            <>
              <Badge variant="accent">Live timetable</Badge>
              <Badge variant="neutral">{openSlots} open slots this week</Badge>
            </>
          }
        />

        {error ? (
          <div className="mt-6 border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Scheduled classes"
            value={String(timetables.length)}
            detail="Core timetable entries assigned to your week."
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Open slots"
            value={String(openSlots)}
            detail="Free periods that can still be filled."
            icon={<ClockIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Substitution alerts"
            value={String(substitutions.length)}
            detail="Cover assignments currently assigned to you."
            tone={substitutions.length ? "accent" : "default"}
            icon={<SwapIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Special classes"
            value={String(specialClasses.length)}
            detail="Additional sessions and extra events."
            tone={specialClasses.length ? "success" : "default"}
            icon={<BookIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <SectionCard
            title="Weekly timetable"
            subtitle="Review the full week and add classes directly into any open slot."
          >
            <TimetableGrid entries={timetableWithSubs} onAddSubject={handleAddSubject} />
          </SectionCard>

          <div className="space-y-6">
            <SectionCard
              title="Substitution alerts"
              subtitle="Your assigned cover periods appear here as soon as they are confirmed."
            >
              <SubstitutionList substitutions={substitutions} />
            </SectionCard>

            <SectionCard
              title="Special classes"
              subtitle="Additional sessions, events, and timetable exceptions."
            >
              <SpecialClassesList items={specialClasses} />
            </SectionCard>
          </div>
        </div>

        <AddSubjectModal
          isOpen={modalOpen}
          day={selectedDay}
          period={selectedPeriod}
          onClose={() => setModalOpen(false)}
          onAdd={handleConfirmAddSubject}
          loading={addingSubject}
        />
      </div>
    </TeacherLayout>
  );
}
