"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import TeacherLayout from "@/components/TeacherLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface SchoolClass {
  id: string;
  name: string;
  _count: { students: number };
}

export default function TeacherClassesPage() {
  const { token, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });
  
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // In a real app, we'd have a specific endpoint for teacher's classes.
      // For now, we'll derive it from the teacher's students or get all and filter.
      // Let's assume there's an endpoint or we can use school-classes.
      const data = await apiFetch<SchoolClass[]>("/api/school-classes", {}, token);
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadClasses();
    }
  }, [loading, loadClasses]);

  if (loading) return null;

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Teacher workspace"
          title="My Classes"
          description="View and manage the classes you are currently teaching."
          meta={<Badge variant="accent">{classes.length} classes</Badge>}
        />

        {error && (
          <div className="mt-6 rounded-xl border border-danger/40 bg-danger-soft/30 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-[var(--color-surface-subtle)]" />
            ))
          ) : classes.length === 0 ? (
            <div className="col-span-full">
               <EmptyState title="No classes assigned" description="You are not currently assigned as a class teacher or subject teacher for any classes." />
            </div>
          ) : (
            classes.map((cls) => (
              <Link href={`/teacher/classes/${cls.id}`} key={cls.id}>
                <div className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all hover:border-[var(--color-primary)] hover:shadow-xl active:scale-[0.98]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{cls.name}</h3>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {cls._count.students} Students enrolled
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                       </svg>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                     <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">View Roster →</span>
                     <Badge variant="neutral">Active</Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
