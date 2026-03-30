"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import SectionCard from "@/components/SectionCard";
import { ArrowRightIcon, BookIcon, SearchIcon, SwapIcon, UsersIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Field, { inputClassName } from "@/components/ui/Field";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { Teacher } from "@/lib/types";

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

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(term) ||
      teacher.subjects.some((subject) => subject.toLowerCase().includes(term))
    );
  });

  const subjectCount = useMemo(
    () => new Set(teachers.flatMap((teacher) => teacher.subjects)).size,
    [teachers]
  );
  const totalWorkload = useMemo(
    () => teachers.reduce((sum, teacher) => sum + teacher.workload, 0),
    [teachers]
  );

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
      <div className="px-4 py-6 sm:px-8 lg:px-10 xl:px-12">
        <PageHeader
          variant="command"
          backgroundImage="/teacher.png"
          eyebrow="Teacher Roster & Deployment"
          title="Staffing Overview"
          description="Monitor teacher capacity, search subjects, and orchestrate profile-level timetable deployment from the centralized hub."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/admin/users" className={cn(buttonClasses({ variant: "secondary" }), "bg-primary-strong/20 border-white/10 text-white hover:bg-primary-strong/40 transition-all")}>
                Review approvals
              </Link>
              <Link href="/admin/special-class" className={cn(buttonClasses({ variant: "secondary" }), "bg-primary-strong/20 border-white/10 text-white hover:bg-primary-strong/40 transition-all")}>
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
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">{teachers.length} teachers</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-primary-strong/10 px-3 py-1.5 backdrop-blur-md">
                 <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">{subjectCount} subjects</span>
              </div>
            </>
          }
        />

        {error ? (
          <div className="mt-6 border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
            detail="Distinct subjects represented."
            icon={<BookIcon className="h-5 w-5" />}
          />
          <StatCard
            backgroundImage="/substitution.png"
            label="Current Load"
            value={String(totalWorkload)}
            detail="Total substitutions orchestrated."
            icon={<SwapIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Filter Match"
            value={String(filteredTeachers.length)}
            detail="Profiles matching current filters."
            tone={searchTerm ? "accent" : "default"}
            icon={<SearchIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <SectionCard
            backgroundImage="/teacher_2.png"
            title={
              directoryLoading
                ? "Teacher Directory"
                : `Teacher Directory (${filteredTeachers.length})`
            }
            subtitle="Search by teacher name or subject, then open the full profile to update deployment slots."
            actions={
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
            }
          >
            {directoryLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="border border-border bg-background/45 p-5"
                  >
                    <div className="animate-pulse">
                      <div className="flex items-start justify-between gap-4">
                        <div className="h-12 w-12 border border-border bg-white/70" />
                        <div className="h-7 w-24 rounded-full border border-border bg-white/70" />
                      </div>

                      <div className="mt-5 h-8 w-2/3 rounded bg-white/70" />

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
                    className="group border border-border bg-surface-subtle/10 p-5 transition hover:bg-surface-subtle hover:border-primary/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center border border-border/10 bg-surface-subtle font-display text-xl text-primary font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <Badge variant={teacher.workload ? "accent" : "neutral"}>
                        {teacher.workload} covers
                      </Badge>
                    </div>

                    <h3 className="mt-5 font-display text-2xl tracking-[-0.04em] text-foreground">
                      {teacher.name}
                    </h3>

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
                description="Adjust the teacher or subject filter, or create a new profile from the side panel."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Add Teacher"
            subtitle="Create a teacher profile and assign initial teaching subjects."
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

              <Button
                onClick={handleCreateTeacher}
                variant="accent"
                className="mt-2 w-full"
                disabled={creatingTeacher}
              >
                {creatingTeacher ? "Creating profile..." : "Create teacher profile"}
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </AdminLayout>
  );
}
