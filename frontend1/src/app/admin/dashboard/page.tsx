"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AdminLayout from "@/components/AdminLayout";
import SectionCard from "@/components/SectionCard";
import {
  AlertIcon,
  ArrowRightIcon,
  BookIcon,
  CalendarIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  SwapIcon,
  UsersIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { apiFetch } from "@/lib/api";
import type { Teacher } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Field, { inputClassName } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

export default function AdminDashboardPage() {
  const { token, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    subjects: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  const loadTeachers = useCallback(async () => {
    if (!token) return;
    setDirectoryLoading(true);
    setError(null);

    try {
      const teacherData = await apiFetch<{ teachers: Teacher[] }>(
        "/api/teachers",
        {},
        token
      );
      setTeachers(teacherData.teachers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teachers");
    } finally {
      setDirectoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadTeachers();
    }
  }, [loading, loadTeachers]);

  const handleCreateTeacher = async () => {
    if (!token) return;
    setCreatingTeacher(true);
    setError(null);

    try {
      const subjects = newTeacher.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);

      await apiFetch(
        "/api/teachers",
        {
          method: "POST",
          body: JSON.stringify({
            name: newTeacher.name,
            email: newTeacher.email,
            password: newTeacher.password,
            subjects,
          }),
        },
        token
      );

      setNewTeacher({ name: "", email: "", password: "", subjects: "" });
      await loadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create teacher");
    } finally {
      setCreatingTeacher(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return teachers.filter((teacher) => {
      if (!term) {
        return true;
      }

      return (
        teacher.name.toLowerCase().includes(term) ||
        teacher.subjects.some((subject) => subject.toLowerCase().includes(term))
      );
    });
  }, [searchTerm, teachers]);

  const subjectCount = useMemo(
    () => new Set(teachers.flatMap((teacher) => teacher.subjects)).size,
    [teachers]
  );
  const totalWorkload = useMemo(
    () => teachers.reduce((sum, teacher) => sum + teacher.workload, 0),
    [teachers]
  );
  const teachersWithoutSubjects = useMemo(
    () => teachers.filter((teacher) => teacher.subjects.length === 0),
    [teachers]
  );
  const readyTeachers = teachers.length - teachersWithoutSubjects.length;
  const topCoverageTeachers = useMemo(
    () =>
      [...teachers]
        .sort((left, right) => right.workload - left.workload)
        .slice(0, 4),
    [teachers]
  );
  const subjectDistribution = useMemo(() => {
    const counts = new Map<string, number>();

    teachers.forEach((teacher) => {
      teacher.subjects.forEach((subject) => {
        counts.set(subject, (counts.get(subject) ?? 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [teachers]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="px-4 py-10 text-sm text-muted-foreground sm:px-8 lg:px-10">
          Loading teacher directory...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PageHeader
          variant="command"
          backgroundImage="/teacher.png"
          eyebrow="Teacher Roster & Deployment"
          title="Staffing Overview"
          description="A denser control room for staffing, subject readiness, and teacher workload coordination across the week."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/users"
                className={cn(
                  buttonClasses({ variant: "secondary" }),
                  "!border-primary/20 !bg-primary/90 !text-white shadow-[0_10px_30px_rgba(37,68,39,0.18)] backdrop-blur-md transition-all hover:!bg-primary-strong"
                )}
              >
                Review approvals
              </Link>
              <Link
                href="/admin/special-class"
                className={cn(
                  buttonClasses({ variant: "secondary" }),
                  "!border-primary/20 !bg-primary/90 !text-white shadow-[0_10px_30px_rgba(37,68,39,0.18)] backdrop-blur-md transition-all hover:!bg-primary-strong"
                )}
              >
                Special classes
              </Link>
              <Link href="/admin/substitutions" className={buttonClasses({ variant: "accent" })}>
                Manage absences
              </Link>
            </div>
          }
          meta={
            <>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-primary-strong/10 px-3 py-1.5 backdrop-blur-md">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                  {teachers.length} teachers
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-primary-strong/10 px-3 py-1.5 backdrop-blur-md">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                  {subjectCount} subjects
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-primary-strong/10 px-3 py-1.5 backdrop-blur-md">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                  {readyTeachers} ready for scheduling
                </span>
              </div>
            </>
          }
        />

        {error ? (
          <div className="mt-6 border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4 lg:gap-6">
          <StatCard
            backgroundImage="/teacher.png"
            label="Unified Roster"
            value={String(teachers.length)}
            detail="Active teacher profiles synchronized."
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <StatCard
            backgroundImage="/teacher_2.png"
            label="Curriculum"
            value={String(subjectCount)}
            detail="Distinct subjects represented across the roster."
            icon={<BookIcon className="h-5 w-5" />}
          />
          <StatCard
            backgroundImage="/substitution.png"
            label="Coverage Load"
            value={String(totalWorkload)}
            detail="Total substitutions currently distributed."
            icon={<SwapIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Need Attention"
            value={String(teachersWithoutSubjects.length)}
            detail="Teacher profiles that still need subject mapping."
            tone={teachersWithoutSubjects.length ? "accent" : "success"}
            icon={<AlertIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
          <div className="flex min-w-0 flex-col gap-6">
            <SectionCard
              backgroundImage="/teacher_2.png"
              title={directoryLoading ? "Teacher Directory" : `Teacher Directory (${filteredTeachers.length})`}
              subtitle="Search staff by name or subject, review coverage load, and jump directly into weekly timetable management."
              actions={
                <div className="flex w-full flex-col gap-3 lg:items-end">
                  <div className="relative w-full sm:w-80">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search teachers or subjects"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      disabled={directoryLoading}
                      className="h-11 w-full border border-border bg-surface pl-10 pr-4 text-sm text-primary placeholder:text-primary/40 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                    <span className="rounded-full border border-border bg-white px-3 py-1.5">
                      {teachers.length} total staff
                    </span>
                    <span className="rounded-full border border-border bg-white px-3 py-1.5">
                      {teachersWithoutSubjects.length} need subjects
                    </span>
                    <span className="rounded-full border border-border bg-white px-3 py-1.5">
                      {totalWorkload} active covers
                    </span>
                  </div>
                </div>
              }
            >
              {directoryLoading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[26px] border border-border bg-background/45 p-5"
                    >
                      <div className="animate-pulse">
                        <div className="flex items-start justify-between gap-4">
                          <div className="h-12 w-12 rounded-2xl border border-border bg-white/70" />
                          <div className="h-7 w-24 rounded-full border border-border bg-white/70" />
                        </div>
                        <div className="mt-5 h-8 w-2/3 rounded bg-white/70" />
                        <div className="mt-3 h-5 w-5/6 rounded bg-white/70" />
                        <div className="mt-4 flex flex-wrap gap-2">
                          <div className="h-7 w-20 rounded-full border border-border bg-white/70" />
                          <div className="h-7 w-24 rounded-full border border-border bg-white/70" />
                        </div>
                        <div className="mt-6 border-t border-border pt-4">
                          <div className="h-5 w-3/4 rounded bg-white/70" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTeachers.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredTeachers.map((teacher) => (
                    <Link
                      href={`/admin/teachers/${teacher.id}`}
                      key={teacher.id}
                      className="group rounded-[28px] border border-border bg-surface/90 p-5 transition hover:-translate-y-[1px] hover:border-primary/20 hover:bg-surface-subtle/70"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/10 bg-surface-subtle font-display text-xl font-bold text-primary">
                          {teacher.name.charAt(0)}
                        </div>
                        <Badge variant={teacher.workload ? "accent" : "neutral"}>
                          {teacher.workload} covers
                        </Badge>
                      </div>

                      <h3 className="mt-5 font-display text-2xl tracking-[-0.04em] text-foreground">
                        {teacher.name}
                      </h3>

                      <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                        {teacher.subjects.length
                          ? `${teacher.subjects.length} assigned subject${teacher.subjects.length === 1 ? "" : "s"} ready for timetable planning.`
                          : "Profile is active but still needs subject mapping before timetable deployment."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {teacher.subjects.length ? (
                          teacher.subjects.map((subject) => (
                            <Badge key={subject} variant="neutral">
                              {subject}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No subjects assigned
                          </span>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm font-medium text-foreground">
                        <span>Open profile and weekly timetable</span>
                        <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No teachers match this search"
                  description="Adjust the teacher or subject filter, or create a new profile from the control rail."
                />
              )}
            </SectionCard>
          </div>

          <div className="flex flex-col gap-6 self-start">
            <SectionCard
              className="self-start"
              title="Create Teacher"
              subtitle="A compact creation flow that keeps the form visible without leaving empty space underneath."
            >
              <div className="space-y-4">
                <Field label="Full name" htmlFor="teacherName">
                  <input
                    id="teacherName"
                    value={newTeacher.name}
                    onChange={(event) =>
                      setNewTeacher((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="Amina Rahman"
                  />
                </Field>

                <Field label="Email" htmlFor="teacherEmail">
                  <input
                    id="teacherEmail"
                    value={newTeacher.email}
                    onChange={(event) =>
                      setNewTeacher((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="teacher@school.edu"
                  />
                </Field>

                <Field label="Temporary password" htmlFor="teacherPassword">
                  <input
                    id="teacherPassword"
                    type="password"
                    value={newTeacher.password}
                    onChange={(event) =>
                      setNewTeacher((previous) => ({
                        ...previous,
                        password: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="Minimum 6 characters"
                  />
                </Field>

                <Field
                  label="Subjects"
                  htmlFor="teacherSubjects"
                  hint="Comma separated"
                >
                  <input
                    id="teacherSubjects"
                    value={newTeacher.subjects}
                    onChange={(event) =>
                      setNewTeacher((previous) => ({
                        ...previous,
                        subjects: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="Math, Physics, Chemistry"
                  />
                </Field>

                <div className="rounded-[24px] border border-border bg-surface-subtle/35 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                      <PlusIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Subject preview
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {newTeacher.subjects.trim()
                          ? newTeacher.subjects
                          : "Add comma-separated subjects here so the new teacher can be used in scheduling right away."}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCreateTeacher}
                  variant="accent"
                  className="w-full"
                  disabled={creatingTeacher}
                >
                  {creatingTeacher ? "Creating profile..." : "Create teacher profile"}
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              className="self-start"
              title="Operations Pulse"
              subtitle="Inspired by live school ERP dashboards: quick actions, staffing alerts, and real-time coverage signals."
            >
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[22px] border border-border bg-surface-subtle/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                        <ShieldIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Profiles Missing Subjects
                        </p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-foreground">
                          {teachersWithoutSubjects.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-border bg-surface-subtle/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Scheduling Ready
                        </p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-foreground">
                          {readyTeachers}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-border bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                        Coverage Watch
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The busiest teachers by substitution load.
                      </p>
                    </div>
                    <Badge variant="accent">{topCoverageTeachers.length} tracked</Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    {topCoverageTeachers.length ? (
                      topCoverageTeachers.map((teacher, index) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between gap-3 rounded-[18px] border border-border/80 bg-surface px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {index + 1}. {teacher.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {teacher.subjects.length
                                ? teacher.subjects.join(", ")
                                : "No subjects assigned"}
                            </p>
                          </div>
                          <Badge variant={teacher.workload > 0 ? "accent" : "neutral"}>
                            {teacher.workload} covers
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No coverage load yet"
                        description="Once substitutions are assigned, high-load teacher profiles will appear here."
                      />
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-border bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                        Subject Distribution
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Top teaching areas represented in the roster.
                      </p>
                    </div>
                    <Badge variant="neutral">{subjectDistribution.length} visible</Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    {subjectDistribution.length ? (
                      subjectDistribution.map(([subject, count]) => (
                        <div key={subject} className="space-y-2">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-foreground">{subject}</span>
                            <span className="text-muted-foreground">{count} teachers</span>
                          </div>
                          <div className="h-2 rounded-full bg-surface-subtle">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{
                                width: `${Math.max(
                                  14,
                                  (count / Math.max(1, teachers.length)) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                        Add subjects to teacher profiles and the subject mix will appear here automatically.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-[color:color-mix(in_oklab,var(--color-danger)_20%,white)] bg-[color:color-mix(in_oklab,var(--color-danger)_7%,white)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-danger)]">
                      <AlertIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Attention needed
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {teachersWithoutSubjects.length
                          ? `${teachersWithoutSubjects.length} teacher profile${teachersWithoutSubjects.length === 1 ? "" : "s"} still need subject assignments before they are fully ready for scheduling.`
                          : "All teacher profiles currently have subject assignments, so the roster is ready for timetable planning."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
