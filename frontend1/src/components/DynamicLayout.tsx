"use client";

import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "./AdminLayout";
import TeacherLayout from "./TeacherLayout";
import StudentLayout from "./StudentLayout";
import type { ReactNode } from "react";

export default function DynamicLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-sm text-[var(--color-text-muted)] animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user.role === "ADMIN") {
    return <AdminLayout>{children}</AdminLayout>;
  }
  if (user.role === "TEACHER") {
    return <TeacherLayout>{children}</TeacherLayout>;
  }
  if (user.role === "STUDENT") {
    return <StudentLayout>{children}</StudentLayout>;
  }

  return <div>{children}</div>;
}
