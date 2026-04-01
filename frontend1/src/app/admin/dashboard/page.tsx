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
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/admin/users" className={cn(buttonClasses({ variant: "secondary", size: "sm" }), "px-4")}>
                Review approvals
              </Link>
              <Link href="/admin/special-class" className={cn(buttonClasses({ variant: "secondary", size: "sm" }), "px-4")}>
                Special classes
              </Link>
              <Link href="/admin/substitutions" className={cn(buttonClasses({ variant: "primary", size: "sm" }), "px-4 shadow-sm")}>
                Manage absences
              </Link>
            </div>
          }
          meta={
            <>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_#3b82f6]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{teachers.length} ARCHIVES</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                 <div className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_#10b981]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{subjectCount} SECTORS</span>
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
            title="Registry // Synchronization"
            subtitle="Search by teacher name or subject, then open the full profile to update deployment slots."
            actions={
              <div className="relative w-full sm:w-80 group">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="EXFILTRATE PERSONNEL..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  disabled={directoryLoading}
                  className="h-12 w-full rounded-2xl border border-white/5 bg-white/5 pl-12 pr-4 text-[14px] font-black tracking-tight text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none transition-all backdrop-blur-xl"
                />
              </div>
            }
          >
            {directoryLoading ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-white/5 bg-white/5 p-6"
                  >
                    <div className="animate-pulse">
                      <div className="flex items-start justify-between gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/10" />
                        <div className="h-7 w-24 rounded-full bg-white/10" />
                      </div>

                      <div className="mt-5 h-8 w-2/3 rounded-lg bg-white/10" />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="h-7 w-20 rounded-full bg-white/10" />
                        <div className="h-7 w-24 rounded-full bg-white/10" />
                      </div>

                      <div className="mt-6 border-t border-white/5 pt-4">
                        <div className="h-5 w-3/4 rounded-md bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTeachers.length ? (
              <div className="grid gap-6 lg:grid-cols-2">
                  {filteredTeachers.map((teacher) => (
                  <Link
                    href={`/admin/teachers/${teacher.id}`}
                    key={teacher.id}
                    className="card-reveal group relative flex flex-col justify-between p-8 transition-all duration-500"
                  >
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-primary/20">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Utilization</p>
                        <Badge variant={teacher.workload ? "accent" : "neutral"} className="scale-90 origin-right">
                          {teacher.workload} periods
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-8">
                       <h3 className="relative z-10 text-[18px] font-black tracking-tighter text-white group-hover:text-primary transition-colors italic">
                        {teacher.name}
                      </h3>
                    </div>

                    <div className="relative z-10 mt-6 flex flex-wrap gap-2">
                      {teacher.subjects.length ? (
                        teacher.subjects.map((subject) => (
                          <div key={subject} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                            {subject}
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 italic">
                          Null Sector Access
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/5 pt-5">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-slate-200 transition-colors">ACCESS PROFILE</span>
                      <ArrowRightIcon className="h-4 w-4 text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
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

        {/* Neural Network Footer Visualization */}
        <div className="mt-12 mb-20 p-12 card-reveal border-dashed border-white/5 flex flex-col items-center justify-center text-center gap-6 group">
           <div className="flex -space-x-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 w-12 rounded-2xl border-4 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase text-white shadow-2xl group-hover:translate-y-1 transition-transform" style={{ transitionDelay: `${i * 100}ms` }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
           </div>
           <div className="space-y-2">
              <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white">Institutional Node Synchronizer</h3>
              <p className="text-[10px] font-bold text-slate-600 max-w-md uppercase leading-relaxed">System is Monitoring {teachers.length} Active Profiles. All coverage sectors are operational and secured under primary school protocols.</p>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
