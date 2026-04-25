"use client";

import { useCallback, useEffect, useState } from "react";
import StudentsList from "@/components/StudentsList";
import AssignStudentTimetableModal from "@/components/AssignStudentTimetableModal";
import SectionCard from "@/components/SectionCard";
import TeacherLayout from "@/components/TeacherLayout";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PlusIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import AddStudentModal from "@/components/AddStudentModal";
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
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

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

  const loadTeachers = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ teachers: { id: string; name: string }[] }>(
        "/api/teachers",
        {},
        token
      );
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error("Failed to load teachers", err);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadStudents();
      void loadTeachers();
    }
  }, [loading, loadStudents, loadTeachers]);

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

  const handleAddStudent = async (formData: {
    name: string;
    rollNumber: string;
    className: string;
    email?: string;
    password?: string;
    teacherId?: string;
  }) => {
    if (!token) return;
    setAddingStudent(true);
    try {
      await apiFetch(
        "/api/students",
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        token
      );
      setAddStudentModalOpen(false);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add student");
    } finally {
      setAddingStudent(false);
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

  const groupedStudents = students.reduce((acc, student) => {
    if (!acc[student.className]) {
      acc[student.className] = [];
    }
    acc[student.className].push(student);
    return acc;
  }, {} as Record<string, StudentWithTeachers[]>);

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
          actions={
            user?.canCreateStudents && (
              <Button
                variant="primary"
                onClick={() => setAddStudentModalOpen(true)}
                className="gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Student
              </Button>
            )
          }
        />

        {error && (
          <div className="mt-6 rounded-[16px] border border-danger/50 bg-danger-soft/40 p-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {Object.keys(groupedStudents).length === 0 ? (
            <SectionCard
              title="Students"
              subtitle="Click on any student to expand and assign teachers or timetable."
            >
              <StudentsList students={[]} loading={pageLoading} />
            </SectionCard>
          ) : (
            Object.entries(groupedStudents).map(([className, classStudents]) => (
              <SectionCard
                key={className}
                title={`Class: ${className}`}
                subtitle={`Folder for ${className} students. Click to expand.`}
              >
                <StudentsList
                  students={classStudents}
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
            ))
          )}
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

        <AddStudentModal
          isOpen={addStudentModalOpen}
          onClose={() => setAddStudentModalOpen(false)}
          onSubmit={handleAddStudent}
          loading={addingStudent}
          teachers={teachers}
        />
      </div>
    </TeacherLayout>
  );
}
