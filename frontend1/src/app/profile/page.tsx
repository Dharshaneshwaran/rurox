"use client";

import DynamicLayout from "@/components/DynamicLayout";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/SectionCard";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : user.email.slice(0, 2).toUpperCase();

  return (
    <DynamicLayout>
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        <PageHeader 
          title="My Profile" 
          description="View your account information and role-specific details."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <SectionCard title="Basic Information" className="md:col-span-1">
            <div className="flex flex-col items-center text-center py-4">
              <div className="h-24 w-24 rounded-full bg-[var(--color-primary)] text-white text-3xl font-bold flex items-center justify-center shadow-lg mb-4 ring-4 ring-[var(--color-surface-subtle)]">
                {initials}
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">{user.name || "User"}</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{user.email}</p>
              <Badge variant="accent" className="mt-4">{user.role}</Badge>
            </div>
          </SectionCard>

          {/* Details */}
          <SectionCard title="Account Details" className="md:col-span-2">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">User ID</p>
                  <p className="text-[14px] font-medium text-[var(--color-text)] mt-1 font-mono">{user.id}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Role</p>
                  <p className="text-[14px] font-medium text-[var(--color-text)] mt-1">{user.role}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Email Address</p>
                <p className="text-[14px] font-medium text-[var(--color-text)] mt-1">{user.email}</p>
              </div>

              {user.role === "TEACHER" && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-[13px] font-semibold text-[var(--color-primary)]">Teacher Information</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-[13px] text-[var(--color-text-muted)]">As a teacher, you can manage timetables, take attendance, and grade students.</p>
                  </div>
                </div>
              )}

              {user.role === "STUDENT" && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-[13px] font-semibold text-[var(--color-primary)]">Student Information</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-[13px] text-[var(--color-text-muted)]">As a student, you can view your report cards and check your attendance records.</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </DynamicLayout>
  );
}
