"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { UserIcon, X } from "@/components/icons";

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  teachers: Array<{ id: string; name: string }>;
};

interface StudentsListProps {
  students: Student[];
  onAssignTeacher?: (studentId: string, teacherId: string) => void;
  onRemoveTeacher?: (studentId: string, teacherId: string) => void;
  onAssignTimetable?: (studentId: string) => void;
  onViewTimetable?: (studentId: string) => void;
  onViewProfile?: (studentId: string) => void;
  loading?: boolean;
}

export default function StudentsList({
  students,
  onAssignTeacher,
  onRemoveTeacher,
  onAssignTimetable,
  onViewTimetable,
  onViewProfile,
  loading = false,
}: StudentsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-[18px] border border-border/50 bg-surface-subtle/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-border/60 bg-background p-6 text-center">
        <UserIcon className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No students found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {students.map((student) => (
        <div
          key={student.id}
          className="rounded-[18px] border border-border/50 bg-surface p-4 transition-all duration-200 hover:border-border"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                {student.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  Roll: {student.rollNumber}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Class: {student.className}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                setExpandedId(expandedId === student.id ? null : student.id)
              }
              className="ml-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              {expandedId === student.id ? "−" : "+"}
            </button>
          </div>

          {expandedId === student.id && (
            <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
              {student.teachers.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Assigned Teachers
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {student.teachers.map((teacher) => (
                      <Badge key={teacher.id} variant="accent">
                        {teacher.name}
                        {onRemoveTeacher && (
                          <button
                            onClick={() =>
                              onRemoveTeacher(student.id, teacher.id)
                            }
                            className="ml-1 hover:text-accent-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {onAssignTeacher && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAssignTeacher(student.id, "")}
                  >
                    Assign Teacher
                  </Button>
                )}
                {onAssignTimetable && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAssignTimetable(student.id)}
                  >
                    Assign Timetable
                  </Button>
                )}
                {onViewTimetable && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onViewTimetable(student.id)}
                  >
                    View Timetable
                  </Button>
                )}
                {onViewProfile && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onViewProfile(student.id)}
                  >
                    View Profile
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
