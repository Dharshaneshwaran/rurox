"use client";

import { useCallback, useEffect, useState } from "react";
import StudentLayout from "@/components/StudentLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import NoticeBoard from "@/components/NoticeBoard";
import { BookIcon, CalendarIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface AttendanceSummary {
  total: number;
  present: number;
  percentage: number;
}

export default function StudentDashboardPage() {
  const { user, token, loading } = useAuth({
    role: "STUDENT",
    redirectTo: "/student/login",
  });

  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);

  const loadAttendance = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<AttendanceSummary>("/api/attendance/my", {}, token);
      setAttendance(data);
    } catch {
      // silent fail on dashboard widget
    }
  }, [token]);

  useEffect(() => {
    if (!loading) void loadAttendance();
  }, [loading, loadAttendance]);

  if (loading || !user) return null;

  const attendanceTone =
    !attendance || attendance.percentage >= 75
      ? "success"
      : attendance.percentage >= 60
      ? "accent"
      : "default";

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Student workspace"
          title={`Welcome back, ${user.name || "Student"}`}
          description="Track your attendance, view your report card, apply for leave, and stay updated with school notices."
          meta={
            <>
              <Badge variant="accent">Standard Access</Badge>
              <Badge variant="neutral">Active Session</Badge>
            </>
          }
        />

        {/* Stats Row */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="My Name"
            value={user.name || "Student"}
            detail={user.email}
            icon={<BookIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Attendance"
            value={attendance ? `${attendance.percentage}%` : "—"}
            detail={attendance ? `${attendance.present}/${attendance.total} days present` : "No records yet"}
            tone={attendanceTone}
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          <Link href="/student/report-card" className="block">
            <StatCard
              label="Report Card"
              value="View →"
              detail="Check your CBSE grades"
              tone="accent"
              icon={<BookIcon className="h-5 w-5" />}
            />
          </Link>
          <Link href="/student/leaves" className="block">
            <StatCard
              label="Leave Requests"
              value="Apply →"
              detail="Submit or track leaves"
              icon={<CalendarIcon className="h-5 w-5" />}
            />
          </Link>
        </div>

        {/* Notice Board + Attendance Details */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="📢 School Notices"
            subtitle="Latest announcements from the administration."
          >
            <NoticeBoard token={token} compact />
          </SectionCard>

          <SectionCard
            title="📋 Attendance Summary"
            subtitle="Your attendance overview for the current session."
          >
            {!attendance || attendance.total === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No attendance records yet. Your teacher will mark attendance daily.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Big percentage circle */}
                <div className="flex items-center gap-6">
                  <div className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4 ${
                    attendance.percentage >= 75
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : attendance.percentage >= 60
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-red-400 bg-red-50 text-red-700"
                  }`}>
                    <span className="text-2xl font-black leading-none">{attendance.percentage}%</span>
                    <span className="text-[10px] font-medium mt-0.5">Attendance</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm text-muted-foreground">Present: <strong className="text-foreground">{attendance.present} days</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="text-sm text-muted-foreground">Absent: <strong className="text-foreground">{attendance.total - attendance.present} days</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-border" />
                      <span className="text-sm text-muted-foreground">Total: <strong className="text-foreground">{attendance.total} days</strong></span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Attendance Progress</span>
                    <span className={attendance.percentage >= 75 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                      {attendance.percentage >= 75 ? "✓ Good Standing" : "⚠ Low Attendance"}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        attendance.percentage >= 75
                          ? "bg-emerald-500"
                          : attendance.percentage >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${attendance.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">75% minimum required for examinations</p>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </StudentLayout>
  );
}
