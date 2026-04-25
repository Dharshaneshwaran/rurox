"use client";

import { useCallback, useEffect, useState } from "react";
import TeacherLayout from "@/components/TeacherLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceRecord {
  studentId: string;
  status: string;
}

interface ClassAttendanceData {
  students: Student[];
  attendance: AttendanceRecord[];
  date: string;
}

export default function TeacherAttendancePage() {
  const { token, user, loading } = useAuth({ role: "TEACHER", redirectTo: "/teacher/login" });
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState<ClassAttendanceData | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Derive unique classes from teacher's students
  const [classes, setClasses] = useState<string[]>([]);

  const loadClasses = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ students: { className: string }[] }>("/api/students", {}, token);
      const unique = [...new Set(data.students.map((s) => s.className))].sort();
      setClasses(unique);
      if (unique.length > 0) setSelectedClass(unique[0]);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!loading) void loadClasses();
  }, [loading, loadClasses]);

  const fetchAttendance = async () => {
    if (!token || !selectedClass || !selectedDate) return;
    setFetching(true);
    setError(null);
    try {
      const data = await apiFetch<ClassAttendanceData>(
        `/api/attendance/class?className=${encodeURIComponent(selectedClass)}&date=${selectedDate}`,
        {},
        token
      );
      setAttendanceData(data);
      // Pre-populate from existing records
      const prefill: Record<string, string> = {};
      data.students.forEach((s) => {
        const existing = data.attendance.find((a) => a.studentId === s.id);
        prefill[s.id] = existing?.status ?? "PRESENT";
      });
      setMarks(prefill);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch attendance");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!token || !attendanceData) return;
    setSaving(true);
    setError(null);
    try {
      const records = Object.entries(marks).map(([studentId, status]) => ({ studentId, status }));
      await apiFetch("/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          className: selectedClass,
          date: selectedDate,
          records,
        }),
      }, token);
      setSuccess("Attendance saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  const statusOptions = ["PRESENT", "ABSENT", "LATE"];
  const presentCount = Object.values(marks).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(marks).filter((s) => s === "ABSENT").length;

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Teacher workspace"
          title="Mark Attendance"
          description="Track daily student attendance for your classes."
          meta={
            attendanceData ? (
              <>
                <Badge variant="success">{presentCount} Present</Badge>
                <Badge variant="danger">{absentCount} Absent</Badge>
              </>
            ) : undefined
          }
        />

        {error && <div className="mt-4 rounded-xl border border-danger/40 bg-danger-soft/30 p-3 text-sm text-danger">{error}</div>}
        {success && <div className="mt-4 rounded-xl border border-success/40 bg-success-soft/30 p-3 text-sm text-success">{success}</div>}

        {/* Filter Controls */}
        <div className="mt-6">
          <SectionCard title="Select Class & Date" subtitle="Choose the class and date to view or mark attendance.">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                >
                  {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                  {classes.length === 0 && <option value="">No classes found</option>}
                </select>
              </div>
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <Button variant="accent" onClick={fetchAttendance} disabled={fetching || !selectedClass}>
                {fetching ? "Loading..." : "Load Students"}
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* Attendance Sheet */}
        {attendanceData && (
          <div className="mt-6">
            <SectionCard
              title={`Attendance — Class ${selectedClass}`}
              subtitle={`Date: ${new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
            >
              {attendanceData.students.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No students found in class {selectedClass}.
                </div>
              ) : (
                <>
                  {/* Quick-mark all buttons */}
                  <div className="mb-4 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => {
                      const all: Record<string, string> = {};
                      attendanceData.students.forEach((s) => { all[s.id] = "PRESENT"; });
                      setMarks(all);
                    }}>Mark All Present</Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      const all: Record<string, string> = {};
                      attendanceData.students.forEach((s) => { all[s.id] = "ABSENT"; });
                      setMarks(all);
                    }}>Mark All Absent</Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3">Roll No.</th>
                          <th className="px-4 py-3">Student Name</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {attendanceData.students.map((s) => (
                          <tr key={s.id} className="hover:bg-background/60 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.rollNumber}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {statusOptions.map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => setMarks((prev) => ({ ...prev, [s.id]: status }))}
                                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                                      marks[s.id] === status
                                        ? status === "PRESENT"
                                          ? "bg-emerald-500 text-white shadow-sm"
                                          : status === "ABSENT"
                                          ? "bg-red-500 text-white shadow-sm"
                                          : "bg-amber-500 text-white shadow-sm"
                                        : "bg-background border border-border text-muted-foreground hover:bg-muted"
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
