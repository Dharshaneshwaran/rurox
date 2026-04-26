"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import SectionCard from "@/components/SectionCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface SchoolClass {
  id: string;
  name: string;
  classTeacher?: { id: string; name: string };
  _count: { students: number };
  createdAt: string;
}

export default function AdminClassesPage() {
  const { token, loading } = useAuth({ role: "ADMIN", redirectTo: "/admin/login" });
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClasses() {
      if (!token) return;
      setLoadingState(true);
      try {
        const data = await apiFetch<SchoolClass[]>("/api/school-classes", {}, token);
        setClasses(data);
      } catch (err) {
        setError("Failed to load classes");
      } finally {
        setLoadingState(false);
      }
    }
    void loadClasses();
  }, [token]);

  if (loading) return <AdminLayout><div className="p-8 text-sm text-[var(--color-text-muted)]">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        <PageHeader
          title="School Classes"
          description="Manage standards, sections, and assign class teachers."
          actions={<Button variant="primary">+ Create Class</Button>}
        />

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {classes.length === 0 && !loadingState ? (
            <div className="col-span-full">
              <EmptyState title="No classes found" description="Create your first class to get started." />
            </div>
          ) : (
            classes.map((cls) => (
              <Link href={`/admin/classes/${cls.id}`} key={cls.id}>
                <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:shadow-lg hover:border-[var(--color-primary)] active:scale-[0.98]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{cls.name}</h3>
                      <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                        {cls.classTeacher ? `Class Teacher: ${cls.classTeacher.name}` : "No teacher assigned"}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[var(--color-text)]">{cls._count.students}</span>
                      <span className="text-[12px] text-[var(--color-text-muted)]">Students</span>
                    </div>
                    <Badge variant="neutral">Active</Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
