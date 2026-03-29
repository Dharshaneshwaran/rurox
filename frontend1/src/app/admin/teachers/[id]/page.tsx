"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AddSubjectModal from "@/components/AddSubjectModal";
import AdminLayout from "@/components/AdminLayout";
import SectionCard from "@/components/SectionCard";
import TimetableGrid from "@/components/TimetableGrid";
import { BookIcon, CalendarIcon, ClockIcon, SwapIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { Teacher, TimetableEntry } from "@/lib/types";

export default function TeacherDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;
  const { token, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });

  const [teacher, setTeacher] = useState<(Teacher & { timetables: TimetableEntry[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [addingSubject, setAddingSubject] = useState(false);

  const loadTeacher = useCallback(async () => {
    if (!token || !teacherId) return;
    setError(null);
    try {
      const { teachers } = await apiFetch<{
        teachers: (Teacher & { timetables: TimetableEntry[] })[];
      }>("/api/teachers", {}, token);
      const found = teachers.find((item) => item.id === teacherId);
      if (found) {
        setTeacher(found);
        return;
      }
      setError("Teacher not found.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teacher details");
    }
  }, [teacherId, token]);

  useEffect(() => {
    if (!loading) {
      void loadTeacher();
    }
  }, [loading, loadTeacher]);

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
    if (!confirm(`Delete ${teacher?.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiFetch(`/api/teachers/${teacherId}`, { method: "DELETE" }, token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete teacher");
    }
  };

  const subjectCount = teacher?.subjects.length ?? 0;
  const assignedPeriods = teacher?.timetables.length ?? 0;
  const openSlots = useMemo(
    () => Math.max(40 - assignedPeriods, 0),
    [assignedPeriods]
  );

  if (loading || (!teacher && !error)) {
    return (
      <AdminLayout>
        <div className="px-4 py-10 text-sm text-muted-foreground sm:px-8 lg:px-10">
          Loading teacher profile...
        </div>
      </AdminLayout>
    );
  }

  if (error && !teacher) {
    return (
      <AdminLayout>
        <div className="px-4 py-8 sm:px-8 lg:px-10">
          <div className="border border-danger bg-danger-soft px-6 py-8 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-danger">
              Teacher profile unavailable
            </p>
            <p className="mt-4 text-lg text-foreground">{error}</p>
            <Link
              href="/admin/dashboard"
              className="mt-6 inline-flex border border-danger px-4 py-2 text-sm font-medium text-danger transition hover:bg-red-100"
            >
              Back to teacher directory
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-8 lg:px-10 xl:px-12">
        <PageHeader
          eyebrow="Teacher profile"
          title={teacher?.name ?? "Teacher"}
          description="Review workload, assigned subjects, and weekly timetable structure. Add classes directly into free slots when the weekly plan changes."
          actions={
            <>
              <Link href="/admin/substitutions">
                <Button variant="secondary">Mark absent</Button>
              </Link>
              <Button variant="danger" onClick={handleDeleteTeacher}>
                Delete teacher
              </Button>
            </>
          }
          meta={
            <>
              <Badge variant="neutral">ID {teacher?.id.slice(-6)}</Badge>
              <Badge variant="accent">
                {teacher?.workload ?? 0} substitution assignments
              </Badge>
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
            label="Assigned subjects"
            value={String(subjectCount)}
            detail="Subjects currently linked to this teacher profile."
            icon={<BookIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Timetable periods"
            value={String(assignedPeriods)}
            detail="Filled periods across the five-day week."
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Open slots"
            value={String(openSlots)}
            detail="Periods still available for assignment."
            icon={<ClockIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Substitution load"
            value={String(teacher?.workload ?? 0)}
            detail="Total cover assignments already carried."
            tone={(teacher?.workload ?? 0) > 0 ? "accent" : "default"}
            icon={<SwapIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <SectionCard
            title="Assigned subjects"
            subtitle="Configured teaching subjects currently associated with this profile."
          >
            <div className="flex flex-wrap gap-2">
              {teacher?.subjects.length ? (
                teacher.subjects.map((subject) => (
                  <Badge key={subject} variant="accent">
                    {subject}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No subjects configured yet.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            className="min-w-0 overflow-hidden"
            title="Weekly schedule"
            subtitle="Assign classes to open slots and keep the teacher timetable current."
          >
            <TimetableGrid entries={teacher?.timetables ?? []} onAddSubject={handleAddSubject} />
          </SectionCard>
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
    </AdminLayout>
  );
}
