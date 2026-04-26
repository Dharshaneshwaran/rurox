"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import SectionCard from "@/components/SectionCard";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import AddTimetableModal from "@/components/AddTimetableModal";
import { cn } from "@/lib/cn";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface TimetableEntry {
  id: string;
  day: string;
  period: number;
  subject: string;
  teacher: { name: string };
  room: string;
}

interface SchoolClass {
  id: string;
  name: string;
  classTeacher?: { name: string };
  students: Student[];
  timetables: TimetableEntry[];
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ClassDetailPage() {
  const { id } = useParams();
  const { token, loading } = useAuth({ role: "ADMIN", redirectTo: "/admin/login" });
  const [cls, setCls] = useState<SchoolClass | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedSlot, setSelectedSlot] = useState<{ day: string; period: number } | null>(null);
   const [activeDay, setActiveDay] = useState("MON");

  const loadClass = async () => {
    if (!token || !id) return;
    setLoadingState(true);
    try {
      const data = await apiFetch<SchoolClass>(`/api/school-classes/${id}`, {}, token);
      setCls(data);
    } catch (err) {
      setError("Failed to load class details");
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    void loadClass();
  }, [token, id]);

  const timetableMap = useMemo(() => {
    const map: Record<string, Record<number, TimetableEntry>> = {};
    cls?.timetables.forEach((t) => {
      if (!map[t.day]) map[t.day] = {};
      map[t.day][t.period] = t;
    });
    return map;
  }, [cls]);

  const handleSlotClick = (day: string, period: number) => {
    setSelectedSlot({ day, period });
    setIsModalOpen(true);
  };

  if (loading || loadingState) return <AdminLayout><div className="p-8 text-sm text-[var(--color-text-muted)]">Loading details...</div></AdminLayout>;
  if (!cls) return <AdminLayout><div className="p-8 text-sm text-[var(--color-danger)]">Class not found.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        <PageHeader
          title={`Class ${cls.name}`}
          description={`Comprehensive overview for class ${cls.name}. Manage students and timetable.`}
          meta={<Badge variant="accent">{cls.classTeacher?.name || "No Class Teacher"}</Badge>}
        />

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Students" value={String(cls.students.length)} tone="success" icon={<div className="h-5 w-5 bg-green-500 rounded-full" />} />
          <StatCard label="Active Timetable" value={String(cls.timetables.length)} tone="accent" icon={<div className="h-5 w-5 bg-indigo-500 rounded-full" />} />
          <StatCard label="Class Teacher" value={cls.classTeacher?.name || "N/A"} icon={<div className="h-5 w-5 bg-slate-500 rounded-full" />} />
          <StatCard label="Status" value="Active" tone="success" icon={<div className="h-5 w-5 bg-emerald-500 rounded-full" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Student List */}
          <div className="lg:col-span-1">
            <SectionCard title="Student Roster" subtitle={`${cls.students.length} students enrolled.`}>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {cls.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 hover:bg-[var(--color-surface-subtle)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-[var(--color-primary-soft)] text-[10px] font-bold text-[var(--color-primary)] flex items-center justify-center">
                        {student.rollNumber}
                      </div>
                      <span className="text-[13.5px] font-medium text-[var(--color-text)]">{student.name}</span>
                    </div>
                    <Badge variant="neutral">Active</Badge>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Timetable */}
          <div className="lg:col-span-2">
            <SectionCard title="Weekly Timetable" subtitle="Teachers and subjects assigned to this class.">
              {/* Mobile Day Selector */}
              <div className="mb-4 flex gap-1 overflow-x-auto pb-1 lg:hidden no-scrollbar">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={cn(
                      "flex-1 min-w-[70px] px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                      activeDay === day 
                        ? "bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.3)] scale-105" 
                        : "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto no-scrollbar">
                {/* Desktop Table View */}
                <table className="w-full border-collapse hidden lg:table">
                  <thead>
                    <tr>
                      <th className="border-b border-[var(--color-border)] py-3 px-2 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Day</th>
                      {PERIODS.map(p => (
                        <th key={p} className="border-b border-[var(--color-border)] py-3 px-2 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">P{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="py-4 px-2 text-[12px] font-bold text-[var(--color-text)]">{day}</td>
                        {PERIODS.map(p => {
                          const entry = timetableMap[day]?.[p];
                          return (
                            <td key={p} className="p-1">
                              <button 
                                onClick={() => handleSlotClick(day, p)}
                                className="w-full h-full text-left transition-transform active:scale-95 outline-none"
                              >
                                {entry ? (
                                  <div className="h-full rounded-lg bg-[var(--color-primary-soft)] p-2 text-center shadow-sm hover:ring-2 ring-[var(--color-primary)] transition-all">
                                    <p className="text-[11px] font-bold text-[var(--color-primary)] truncate">{entry.subject}</p>
                                    <p className="text-[9px] text-[var(--color-primary)] opacity-70 truncate mt-0.5">{entry.teacher.name}</p>
                                  </div>
                                ) : (
                                  <div className="h-full rounded-lg bg-[var(--color-surface-subtle)] border border-dashed border-[var(--color-border)] p-2 text-center hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-all">
                                    <span className="text-[9px] text-[var(--color-text-muted)]">+ Add</span>
                                  </div>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile List View */}
                <div className="space-y-3 lg:hidden">
                  {PERIODS.map(p => {
                    const entry = timetableMap[activeDay]?.[p];
                    return (
                      <button
                        key={p}
                        onClick={() => handleSlotClick(activeDay, p)}
                        className={cn(
                          "flex w-full items-center justify-between gap-4 rounded-2xl border p-4 transition-all active:scale-[0.98]",
                          entry 
                            ? "border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)]/30" 
                            : "border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)]/50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[12px] font-black text-[var(--color-primary)] shadow-sm border border-[var(--color-border)]">
                            P{p}
                          </div>
                          <div className="text-left">
                            <p className={cn("text-[14px] font-bold", entry ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]")}>
                              {entry ? entry.subject : "Unassigned Slot"}
                            </p>
                            <p className="text-[11px] font-medium text-[var(--color-text-muted)]">
                              {entry ? entry.teacher.name : "Tap to assign teacher"}
                            </p>
                          </div>
                        </div>
                        {entry && (
                          <Badge variant="neutral" className="bg-white/80">{entry.room || "Room -"}</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        <AddTimetableModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => void loadClass()}
          token={token || ""}
          classId={cls.id}
          className={cls.name}
          slot={selectedSlot}
        />
      </div>
    </AdminLayout>
  );
}
