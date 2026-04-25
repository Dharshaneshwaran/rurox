"use client";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import SectionCard from "@/components/SectionCard";
import StudentLayout from "@/components/StudentLayout";
import { BookIcon, CalendarIcon, ClockIcon, UsersIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";

export default function StudentDashboardPage() {
  const { user, loading } = useAuth({
    role: "STUDENT",
    redirectTo: "/student/login",
  });

  if (loading) {
    return (
      <StudentLayout>
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="text-sm text-muted-foreground">Loading student workspace...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PageHeader
          variant="command"
          eyebrow="Student workspace"
          title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
          description="A clean student entry point for schedule visibility, account access, and future school updates."
          meta={
            <>
              <Badge variant="accent">Student login enabled</Badge>
              <Badge variant="neutral">{user?.email ?? "No email found"}</Badge>
            </>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Access level"
            value="Student"
            detail="Your account is signed in with student permissions."
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Timetable"
            value="Soon"
            detail="Student-specific timetable views can be connected here next."
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Resources"
            value="Ready"
            detail="This dashboard is prepared for notices and subject resources."
            icon={<BookIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Status"
            value="Active"
            detail="Your student portal is available and working."
            tone="success"
            icon={<ClockIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <SectionCard
            title="Student dashboard"
            subtitle="The student role is now fully wired into auth and routing. This space is ready for timetable, attendance, assignments, and announcements."
          >
            <EmptyState
              title="Student features can be added next"
              description="Right now the important foundation is complete: dedicated login, protected dashboard access, and student role support across the app."
              action={<Button variant="secondary">Student access is live</Button>}
            />
          </SectionCard>

          <SectionCard
            title="Starter account"
            subtitle="Use this seeded account to test the new student login flow immediately."
          >
            <div className="space-y-3">
              <div className="rounded-[16px] border border-border bg-surface-subtle/40 p-3.5">
                <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Email
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  student@example.com
                </p>
              </div>
              <div className="rounded-[16px] border border-border bg-surface-subtle/40 p-3.5">
                <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Password
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  studentpass
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </StudentLayout>
  );
}
