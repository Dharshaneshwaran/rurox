"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TeacherLayout from "@/components/TeacherLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { Student } from "@/lib/types";

export default function TeacherStudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });
  
  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const studentData = await apiFetch<any>(`/api/students/${id}`, {}, token);
      setStudent(studentData.student);
      
      // Try to fetch attendance summary for this student
      try {
        const attData = await apiFetch<any>(`/api/attendance/student/${id}/summary`, {}, token);
        setAttendance(attData);
      } catch (attErr) {
        console.error("Failed to load attendance", attErr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student details");
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
          <div className="text-sm text-[var(--color-text-muted)] animate-pulse">Loading student profile...</div>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !student) {
    return (
      <TeacherLayout>
        <div className="p-8">
           <div className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-center">
              <p className="text-sm text-danger">{error || "Student not found"}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.back()}>Go Back</Button>
           </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="px-4 py-6 sm:px-8 lg:px-10 xl:px-12">
        <PageHeader
          variant="command"
          backgroundImage="/teacher.png"
          eyebrow="Student Profile"
          title={student.name}
          description={`Roll Number: ${student.rollNumber} · Class: ${student.className}`}
          meta={
            <>
               <Badge variant="accent">Active Student</Badge>
               {attendance && <Badge variant="neutral">{attendance.percentage}% Attendance</Badge>}
            </>
          }
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
           <StatCard 
              label="Overall Grade" 
              value="A2" 
              detail="Based on recent exams"
              tone="success"
           />
           <StatCard 
              label="Attendance" 
              value={attendance ? `${attendance.percentage}%` : "—"} 
              detail={attendance ? `${attendance.present}/${attendance.total} days` : "No data"}
              tone={attendance && attendance.percentage < 75 ? "accent" : "default"}
           />
           <StatCard 
              label="Assignments" 
              value="8/10" 
              detail="Completed this month"
           />
           <StatCard 
              label="Behaviour" 
              value="Good" 
              detail="Consistently focused"
           />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <SectionCard title="Student Information" subtitle="Personal and academic background.">
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Full Name</p>
                     <p className="text-sm font-medium text-[var(--color-text)]">{student.name}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Email Address</p>
                     <p className="text-sm font-medium text-[var(--color-text)]">{student.user?.email || "No email provided"}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Roll Number</p>
                     <p className="text-sm font-medium text-[var(--color-text)]">{student.rollNumber}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Current Class</p>
                     <p className="text-sm font-medium text-[var(--color-text)]">{student.className}</p>
                  </div>
               </div>
            </SectionCard>

            <SectionCard title="Academic Performance" subtitle="Recent exam results and grades.">
               {student.results?.length === 0 ? (
                 <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">No exam results recorded yet.</div>
               ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead>
                          <tr className="border-b border-[var(--color-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                             <th className="px-4 py-3">Exam</th>
                             <th className="px-4 py-3">Subject</th>
                             <th className="px-4 py-3">Marks</th>
                             <th className="px-4 py-3">Grade</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-[var(--color-border)]">
                          {student.results?.map((res: any) => (
                             <tr key={res.id} className="hover:bg-[var(--color-surface-subtle)]/50 transition-colors">
                                <td className="px-4 py-3 font-medium">{res.exam.name}</td>
                                <td className="px-4 py-3 text-[var(--color-text-muted)]">{res.exam.subject}</td>
                                <td className="px-4 py-3 font-mono">{res.marksObtained} / {res.exam.maxMarks}</td>
                                <td className="px-4 py-3">
                                   <Badge variant={res.marksObtained / res.exam.maxMarks > 0.8 ? "success" : "neutral"}>
                                      {res.grade || "A"}
                                   </Badge>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}
            </SectionCard>
          </div>

          <div className="space-y-6">
             <SectionCard title="Teacher Actions">
                <div className="space-y-2">
                   <Button variant="secondary" fullWidth size="sm">Message Parent</Button>
                   <Button variant="secondary" fullWidth size="sm">Add Internal Note</Button>
                   <Button variant="secondary" fullWidth size="sm">Generate Report</Button>
                   <Button
                     variant="danger"
                     fullWidth
                     size="sm"
                     className="border-[var(--color-danger)] bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white"
                   >
                     Flag for Review
                   </Button>
                </div>
             </SectionCard>

             <SectionCard title="Classmates" subtitle="In same class section.">
                <div className="space-y-3">
                   {/* This could be populated if we fetch classmates */}
                   <p className="text-xs text-[var(--color-text-muted)]">Quickly navigate to other students in {student.className}.</p>
                   <Button variant="ghost" fullWidth size="sm" onClick={() => router.push(`/teacher/classes/${student.schoolClassId}`)}>
                      View Full Class Roster
                   </Button>
                </div>
             </SectionCard>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
