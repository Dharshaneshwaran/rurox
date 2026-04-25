"use client";

import { BookIcon } from "@/components/icons";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useAuth } from "@/hooks/useAuth";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, clear, loading } = useAuth({
    role: "STUDENT",
    redirectTo: "/student/login",
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
      roleLabel="Student Hub"
      subtitle="Track your school access, review learning resources, and stay ready for timetable-linked updates."
      user={user}
      onSignOut={() => {
        clear();
        window.location.href = "/";
      }}
      navItems={[
        {
          label: "My Dashboard",
          href: "/student/dashboard",
          description: "Profile and access",
          icon: <BookIcon className="h-full w-full" />,
        },
        {
          label: "Leave Requests",
          href: "/student/leaves",
          description: "Apply and track leaves",
          icon: <BookIcon className="h-full w-full" />,
        },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
