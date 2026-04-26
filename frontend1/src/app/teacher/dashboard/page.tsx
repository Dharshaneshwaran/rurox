"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddSubjectModal from "@/components/AddSubjectModal";
import AddSpecialClassModal from "@/components/AddSpecialClassModal";
import SectionCard from "@/components/SectionCard";
import SpecialClassesList from "@/components/SpecialClassesList";
import SubstitutionList from "@/components/SubstitutionList";
import TeacherLayout from "@/components/TeacherLayout";
import TimetableGrid from "@/components/TimetableGrid";
import { BookIcon, CalendarIcon, ClockIcon, SwapIcon } from "@/components/icons";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { SpecialClass, Substitution, TimetableEntry, Teacher } from "@/lib/types";

const SKELETON_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function TimetableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-border/70 bg-surface">
      <div className="grid grid-cols-[94px_repeat(5,minmax(0,1fr))] border-b border-border/70 bg-surface-subtle">
        <div className="border-r border-border/70 px-4 py-4">
          <div className="h-3 w-12 animate-pulse rounded-full bg-border/70" />
        </div>
        {SKELETON_DAYS.map((day) => (
          <div key={day} className="border-r border-border/70 px-4 py-4 last:border-r-0">
            <div className="h-3 w-16 animate-pulse rounded-full bg-border/70" />
          </div>
        ))}
      </div>

      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-[94px_repeat(5,minmax(0,1fr))] border-b border-border/60 last:border-b-0"
        >
          <div className="border-r border-border/60 px-4 py-6">
            <div className="mx-auto h-5 w-5 animate-pulse rounded-full bg-border/70" />
          </div>
          {SKELETON_DAYS.map((day) => (
            <div
              key={`${day}-${rowIndex}`}
              className="border-r border-border/60 p-3 last:border-r-0"
            >
              <div className="h-[102px] animate-pulse rounded-[22px] border border-border/60 bg-surface-subtle/70 p-4">
                <div className="h-5 w-20 rounded-full bg-border/70" />
                <div className="mt-3 h-4 w-12 rounded-full bg-border/60" />
                <div className="mt-5 h-3 w-24 rounded-full bg-border/60" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function TeacherDashboardPage() {
  const router = useRouter();
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
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [specialModalOpen, setSpecialModalOpen] = useState(false);
  const [addingSpecialClass, setAddingSpecialClass] = useState(false);
  const [subLoadingId, setSubLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setDashboardLoading(true);
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
      const teachersData = await apiFetch<{ teachers: Teacher[] }>(
        "/api/teachers",
        {},
        token
      );

      setTimetables(timetableData.timetables);
      setSubstitutions(substitutionData.substitutions);
      setSpecialClasses(specialData.specialClasses);
      setTeachers(teachersData.teachers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setDashboardLoading(false);
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

  const handleAddSpecialClass = async (data: any) => {
    if (!token || !user?.teacherId) return;
    setAddingSpecialClass(true);
    try {
      await apiFetch(
        "/api/special-classes",
        {
          method: "POST",
          body: JSON.stringify({
            ...data,
            teacherId: user.teacherId,
          }),
        },
        token
      );
      setSpecialModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add special class");
    } finally {
      setAddingSpecialClass(false);
    }
  };

  const handleAcceptSub = async (id: string) => {
    if (!token) return;
    setSubLoadingId(id);
    try {
      await apiFetch(`/api/substitutions/${id}/accept`, { method: "POST" }, token);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setSubLoadingId(null);
    }
  };

  const handleRejectSub = async (id: string) => {
    if (!token) return;
    setSubLoadingId(id);
    try {
      await apiFetch(`/api/substitutions/${id}/reject`, { method: "POST" }, token);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setSubLoadingId(null);
    }
  };

  const handleEntryClick = (entry: TimetableEntry) => {
    if (entry.schoolClassId) {
      router.push(`/teacher/classes/${entry.schoolClassId}`);
    } else if (entry.className) {
      // Fallback for mock data or entries without schoolClassId
      // We can search for the class by name or just alert
      // For now, let's try to navigate to a generic search or handle it
      console.log("No schoolClassId for entry:", entry);
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
          variant="command"
          backgroundImage="/teacher.png"
          eyebrow="Teacher dashboard"
          title={`Hello${user?.name ? `, ${user.name}` : ""}`}
          description="Review your week, monitor special sessions, and keep open timetable slots filled without losing sight of assigned cover work."
          meta={
            <>
              <Badge variant="accent" className="bg-white/10 text-white border-white/20">Live timetable</Badge>
              <Badge variant="neutral" className="bg-white/5 text-zinc-300 border-white/10">{openSlots} open slots this week</Badge>
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
            backgroundImage="/teacher_2.png"
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
            backgroundImage="/substitution.png"
          />
          <StatCard
            label="Special classes"
            value={String(specialClasses.length)}
            detail="Additional sessions and extra events."
            tone={specialClasses.length ? "success" : "default"}
            icon={<BookIcon className="h-5 w-5" />}
            backgroundImage="/teacher.png"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            backgroundImage="/teacher_2.png"
            className="min-w-0 overflow-hidden"
            title="Weekly timetable"
            subtitle="Review the full week and add classes directly into any open slot."
          >
            {dashboardLoading ? (
              <TimetableSkeleton />
            ) : (
              <TimetableGrid 
                entries={timetableWithSubs} 
                onAddSubject={handleAddSubject} 
                onEntryClick={handleEntryClick}
              />
            )}
          </SectionCard>

          <div className="space-y-6">
            <SectionCard
              backgroundImage="/substitution.png"
              title="Substitution alerts"
              subtitle="Your assigned cover periods appear here as soon as they are confirmed."
            >
              <SubstitutionList
                substitutions={substitutions}
                onAccept={handleAcceptSub}
                onReject={handleRejectSub}
                currentTeacherId={user?.teacherId ?? undefined}
                loadingId={subLoadingId}
              />
            </SectionCard>

            <SectionCard
              title="Special classes"
              subtitle="Additional sessions, events, and timetable exceptions."
              actions={
                <Button variant="secondary" size="sm" onClick={() => setSpecialModalOpen(true)}>
                  mon to fri only one class
                </Button>
              }
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
        <AddSpecialClassModal
          isOpen={specialModalOpen}
          onClose={() => setSpecialModalOpen(false)}
          onAdd={handleAddSpecialClass}
          loading={addingSpecialClass}
          teachers={teachers}
        />
      </div>
    </TeacherLayout>
  );
}
