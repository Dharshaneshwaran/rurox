"use client";

import { useAuth } from "@/hooks/useAuth";
import WorkspaceShell from "@/components/WorkspaceShell";

// Clean SVG icons
const DashboardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ClipboardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const CheckSquareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const BookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, clear, loading } = useAuth({ role: "TEACHER", redirectTo: "/teacher/login" });

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-sm text-[var(--color-text-muted)] animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  return (
    <WorkspaceShell
      roleLabel="Teacher Hub"
      subtitle="Track your week, handle substitutions, manage students."
      user={user}
      onSignOut={() => { clear(); window.location.href = "/"; }}
      navItems={[
        { label: "My Dashboard", href: "/teacher/dashboard", description: "Timetable and overview", icon: <DashboardIcon /> },
        { label: "Students", href: "/teacher/students", description: "Manage students", icon: <UsersIcon /> },
        { label: "Exams & Marks", href: "/teacher/exams", description: "Create exams, enter marks", icon: <ClipboardIcon /> },
        { label: "Attendance", href: "/teacher/attendance", description: "Daily attendance", icon: <CheckSquareIcon /> },
        { label: "Leave Approvals", href: "/teacher/leaves", description: "Student leave requests", icon: <CalendarIcon /> },
        { label: "Classes", href: "/teacher/classes", description: "Manage rosters", icon: <ClipboardIcon /> },
        { label: "My Timetable", href: "/teacher/timetable", description: "Weekly schedule", icon: <BookIcon /> },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
