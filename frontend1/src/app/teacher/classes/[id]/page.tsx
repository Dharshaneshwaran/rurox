"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TeacherLayout from "@/components/TeacherLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Student } from "@/lib/types";

export default function TeacherClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });
  
  const [schoolClass, setSchoolClass] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const data = await apiFetch<any>(`/api/school-classes/${id}`, {}, token);
      setSchoolClass(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load class details");
    } finally {
      setIsLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    if (!loading) {
      void loadData();
    }
  }, [loading, loadData]);

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
          <div className="text-sm text-[var(--color-text-muted)] animate-pulse">Loading class details...</div>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !schoolClass) {
    return (
      <TeacherLayout>
        <div className="p-8">
           <div className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-center">
              <p className="text-sm text-danger">{error || "Class not found"}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.back()}>Go Back</Button>
           </div>
        </div>
      </TeacherLayout>
    );
  }

  const handleDownloadRoster = () => {
    if (!schoolClass || !schoolClass.students) return;
    
    const headers = ["Name", "Roll Number", "Class"];
    const rows = schoolClass.students.map((s: any) => [
      s.name,
      s.rollNumber,
      schoolClass.name
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((r: any) => r.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Roster_${schoolClass.name.replace(/\s+/g, "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TeacherLayout>
      <div className="px-4 py-6 sm:px-8 lg:px-10 xl:px-12">
        <PageHeader
          variant="command"
          backgroundImage="/teacher_2.png"
          eyebrow="Class Overview"
          title={schoolClass.name}
          description={`Class teacher: ${schoolClass.classTeacher?.name || "Not assigned"}`}
          meta={
            <Badge variant="accent">{schoolClass.students?.length || 0} Students</Badge>
          }
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_300px]">
          <SectionCard
            title="Student Roster"
            subtitle="Complete list of students enrolled in this class."
          >
            <div className="divide-y divide-[var(--color-border)]">
              {schoolClass.students?.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                  No students found in this class.
                </div>
              ) : (
                schoolClass.students?.map((student: Student) => (
                  <div key={student.id} className="erp-row flex items-center justify-between py-4 transition-colors hover:bg-[var(--color-surface-subtle)]/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold">
                        {student.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text)]">{student.name}</p>
                        <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Roll: {student.rollNumber}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[11px] font-bold uppercase tracking-wider"
                      onClick={() => router.push(`/teacher/students/${student.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <div className="space-y-6">
             <SectionCard title="Quick Actions">
                <div className="space-y-2">
                   <Button variant="secondary" fullWidth size="sm" onClick={handleDownloadRoster}>
                      Download Roster
                   </Button>
                   <Button 
                      variant="secondary" 
                      fullWidth 
                      size="sm" 
                      onClick={() => router.push(`/teacher/attendance?className=${encodeURIComponent(schoolClass.name)}`)}
                   >
                      Mark Attendance
                   </Button>
                   <Button 
                      variant="secondary" 
                      fullWidth 
                      size="sm"
                      onClick={() => router.push(`/teacher/exams?className=${encodeURIComponent(schoolClass.name)}`)}
                   >
                      Bulk Entry Marks
                   </Button>
                </div>
             </SectionCard>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
