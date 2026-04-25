"use client";

import StudentLayout from "@/components/StudentLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import { BookIcon, CalendarIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";

export default function StudentDashboardPage() {
  const { user, loading } = useAuth({
    role: "STUDENT",
    redirectTo: "/student/login",
  });

  if (loading || !user) return null;

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Student workspace"
          title={`Welcome back, ${user.name || "Student"}`}
          description="Access your classes, review your timetable, and stay updated with school announcements."
          meta={
            <>
              <Badge variant="accent">Standard Access</Badge>
              <Badge variant="neutral">Active Session</Badge>
            </>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="My Profile"
            value={user.name || "N/A"}
            detail={user.email}
            icon={<BookIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Current Status"
            value="Active"
            detail="Account is in good standing"
            tone="success"
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Quick Links"
            value="2 Active"
            detail="Dashboard and Leaves"
            tone="accent"
            icon={<BookIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-6 space-y-6">
          <SectionCard
            title="Overview"
            subtitle="Your current academic status and upcoming notifications."
          >
            <div className="py-10 text-center text-sm text-muted-foreground">
              Welcome to the Student Hub. You can now manage your leave requests and track your attendance status.
            </div>
          </SectionCard>
        </div>
      </div>
    </StudentLayout>
  );
}
