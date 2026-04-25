"use client";

import { useAuth } from "@/hooks/useAuth";
import { CalendarIcon, UserIcon } from "@/components/icons";
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
      roleLabel="Teacher Hub"
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
        {
          label: "Students",
          href: "/teacher/students",
          description: "Manage and assign students",
          icon: <UserIcon className="h-full w-full" />,
        },
        {
          label: "Leave Approvals",
          href: "/teacher/leaves",
          description: "Review student requests",
          icon: <CalendarIcon className="h-full w-full" />,
        },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
