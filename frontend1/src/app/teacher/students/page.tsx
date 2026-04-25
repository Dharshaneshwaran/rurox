"use client";

import { useCallback, useEffect, useState } from "react";
import StudentsList from "@/components/StudentsList";
import AssignStudentTimetableModal from "@/components/AssignStudentTimetableModal";
import SectionCard from "@/components/SectionCard";
import TeacherLayout from "@/components/TeacherLayout";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { UserIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { Student } from "@/lib/types";

type StudentWithTeachers = Student & {
  teachers: Array<{ id: string; name: string }>;
};

export default function TeacherStudentsPage() {
  const { token, user, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });

  const [students, setStudents] = useState<StudentWithTeachers[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithTeachers | null>(null);
  const [timetableModalOpen, setTimetableModalOpen] = useState(false);
  const [assigningTimetable, setAssigningTimetable] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!token || !user?.teacherId) return;
    setPageLoading(true);
    try {
      const data = await apiFetch<{ students: StudentWithTeachers[] }>(
        "/api/students",
        {},
        token
      );
      setStudents(data.students);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setPageLoading(false);
    }
  }, [token, user?.teacherId]);

  useEffect(() => {
    if (!loading) {
      void loadStudents();
    }
  }, [loading, loadStudents]);

  const handleAssignTimetable = async (formData: {
    day: string;
    period: number;
    subject: string;
    className: string;
    teacher?: string;
    room?: string;
  }) => {
    if (!token || !selectedStudent) return;
    setAssigningTimetable(true);
    try {
      await apiFetch(
        `/api/students/${selectedStudent.id}/timetable`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        token
      );
      setTimetableModalOpen(false);
      setSelectedStudent(null);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign timetable");
    } finally {
      setAssigningTimetable(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PageHeader
          variant="command"
          eyebrow="Teacher workspace"
          title="Manage Students"
          description="View and manage student information, assignments, and timetables."
          meta={
            <>
              <Badge variant="accent">Student Management</Badge>
              <Badge variant="neutral">{students.length} students</Badge>
            </>
          }
        />

        {error && (
          <div className="mt-6 rounded-[16px] border border-danger/50 bg-danger-soft/40 p-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <SectionCard
            title="Students"
            subtitle="Click on any student to expand and assign teachers or timetable."
          >
            <StudentsList
              students={students}
              loading={pageLoading}
              onAssignTimetable={(studentId) => {
                const student = students.find((s) => s.id === studentId);
                if (student) {
                  setSelectedStudent(student);
                  setTimetableModalOpen(true);
                }
              }}
            />
          </SectionCard>
        </div>

        <AssignStudentTimetableModal
          studentName={selectedStudent?.name || ""}
          isOpen={timetableModalOpen}
          onClose={() => {
            setTimetableModalOpen(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleAssignTimetable}
          loading={assigningTimetable}
        />
      </div>
    </TeacherLayout>
  );
}
