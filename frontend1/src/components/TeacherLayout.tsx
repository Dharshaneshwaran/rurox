"use client";

import { useAuth } from "@/hooks/useAuth";
import { CalendarIcon } from "@/components/icons";
import WorkspaceShell from "@/components/WorkspaceShell";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clear, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });

  if (loading || !user) {
    return (
      <div className="page-shell min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center px-6 py-12 text-sm text-[var(--color-text-muted)]">
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <WorkspaceShell
      roleLabel="Teacher workspace"
      subtitle="Track your week, review substitute assignments, and update open timetable slots."
      user={user}
      onSignOut={() => {
        clear();
        window.location.href = "/";
      }}
      navItems={[
        {
          label: "My Dashboard",
          href: "/teacher/dashboard",
          description: "Timetable and coverage",
          icon: <CalendarIcon className="h-full w-full" />,
        },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
