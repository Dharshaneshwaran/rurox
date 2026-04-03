"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TeacherLayout from "@/components/TeacherLayout";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { SpecialClass, Substitution, TimetableEntry, Teacher } from "@/lib/types";

export default function TeacherDashboardPage() {
  const { token, user, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [specialClasses, setSpecialClasses] = useState<SpecialClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setDashboardLoading(true);
    try {
      const timetableData = await apiFetch<{ timetables: TimetableEntry[] }>(
        "/api/timetables/mine",
        {},
        token
      );
      const substitutionData = await apiFetch<{ substitutions: Substitution[] }>(
        "/api/substitutions",
        {},
        token
      );
      const specialData = await apiFetch<{ specialClasses: SpecialClass[] }>(
        "/api/special-classes",
        {},
        token
      );
      const teachersData = await apiFetch<{ teachers: Teacher[] }>(
        "/api/teachers",
        {},
        token
      );

      setTimetables(timetableData.timetables);
      setSubstitutions(substitutionData.substitutions);
      setSpecialClasses(specialData.specialClasses);
      setTeachers(teachersData.teachers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setDashboardLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadData();
    }
  }, [loading, loadData]);

  if (loading || dashboardLoading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <p className="text-sm font-bold text-slate-700">Loading...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Timetable</h1>
          <p className="text-slate-700 mt-1 font-black text-sm">View your schedule and manage substitutions</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-base font-black">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-bold text-slate-800 mb-1">Classes Today</p>
            <p className="text-3xl font-black text-slate-900">
              {timetables.filter((t) => {
                const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                return t.day === today;
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-bold text-slate-800 mb-1">Total Classes</p>
            <p className="text-3xl font-black text-slate-900">{timetables.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-bold text-slate-800 mb-1">Substitutions</p>
            <p className="text-3xl font-black text-slate-900">{substitutions.length}</p>
          </div>
        </div>

        {/* Timetable */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-bold text-lg text-slate-900">My Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Day</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Period</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Room</th>
                </tr>
              </thead>
              <tbody>
                {timetables.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-700 font-semibold">
                      No classes scheduled
                    </td>
                  </tr>
                ) : (
                  timetables.map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{entry.day}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{entry.period}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{entry.subject}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{entry.className}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{entry.room || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Substitutions */}
        {substitutions.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="font-bold text-lg text-slate-900">Substitutions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Period</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {substitutions.map((sub, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {typeof sub.date === "string" ? sub.date : new Date(sub.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sub.period}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sub.subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sub.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                          sub.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Special Classes */}
        {specialClasses.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="font-bold text-lg text-slate-900">Special Classes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Day</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Time</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-slate-900">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {specialClasses.map((sc, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{sc.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sc.day}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sc.startTime} - {sc.endTime}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{sc.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

  const handleAddSpecialClass = async (data: any) => {
    if (!token || !user?.teacherId) return;
    setAddingSpecialClass(true);
    try {
      await apiFetch(
        "/api/special-classes",
        {
          method: "POST",
          body: JSON.stringify({
            ...data,
            teacherId: user.teacherId,
          }),
        },
        token
      );
      setSpecialModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add special class");
    } finally {
      setAddingSpecialClass(false);
    }
  };

  const handleAcceptSub = async (id: string) => {
    if (!token) return;
    setSubLoadingId(id);
    try {
      await apiFetch(`/api/substitutions/${id}/accept`, { method: "POST" }, token);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setSubLoadingId(null);
    }
  };

  const handleRejectSub = async (id: string) => {
    if (!token) return;
    setSubLoadingId(id);
    try {
      await apiFetch(`/api/substitutions/${id}/reject`, { method: "POST" }, token);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setSubLoadingId(null);
    }
  };

  const timetableWithSubs = useMemo(() => {
    const marked = [...timetables];
    substitutions.forEach((sub) => {
      if (sub.replacementTeacher?.name && user?.teacherId) {
        marked.push({
          day: sub.day,
          period: sub.period,
          subject: "Substitution",
          className: "Assigned cover",
          room: null,
          isSubstitution: true,
        });
      }
    });
    return marked;
  }, [substitutions, timetables, user?.teacherId]);

  const openSlots = Math.max(40 - timetables.length, 0);

  return (
    <TeacherLayout>
      <div className="px-4 py-6 sm:px-8 lg:px-10 xl:px-12">
        <PageHeader
          variant="command"
          backgroundImage="/teacher.png"
          eyebrow="Teacher dashboard"
          title={`Hello${user?.name ? `, ${user.name}` : ""}`}
          description="Review your week, monitor special sessions, and keep open timetable slots filled without losing sight of assigned cover work."
          meta={
            <>
              <Badge variant="accent" className="bg-blue-100 text-blue-900 border-blue-300">Live timetable</Badge>
              <Badge variant="neutral" className="bg-slate-100 text-slate-700 border-slate-300">{openSlots} open slots this week</Badge>
            </>
          }
        />

        {error ? (
          <div className="mt-6 border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Scheduled classes"
            value={String(timetables.length)}
            detail="Core timetable entries assigned to your week."
            icon={<CalendarIcon className="h-5 w-5" />}
            backgroundImage="/teacher_2.png"
          />
          <StatCard
            label="Open slots"
            value={String(openSlots)}
            detail="Free periods that can still be filled."
            icon={<ClockIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Substitution alerts"
            value={String(substitutions.length)}
            detail="Cover assignments currently assigned to you."
            tone={substitutions.length ? "accent" : "default"}
            icon={<SwapIcon className="h-5 w-5" />}
            backgroundImage="/substitution.png"
          />
          <StatCard
            label="Special classes"
            value={String(specialClasses.length)}
            detail="Additional sessions and extra events."
            tone={specialClasses.length ? "success" : "default"}
            icon={<BookIcon className="h-5 w-5" />}
            backgroundImage="/teacher.png"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            backgroundImage="/teacher_2.png"
            className="min-w-0 overflow-hidden"
            title="Weekly timetable"
            subtitle="Review the full week and add classes directly into any open slot."
          >
            {dashboardLoading ? (
              <TimetableSkeleton />
            ) : (
              <TimetableGrid entries={timetableWithSubs} onAddSubject={handleAddSubject} />
            )}
          </SectionCard>

          <div className="space-y-6">
            <SectionCard
              backgroundImage="/substitution.png"
              title="Substitution alerts"
              subtitle="Your assigned cover periods appear here as soon as they are confirmed."
            >
              <SubstitutionList
                substitutions={substitutions}
                onAccept={handleAcceptSub}
                onReject={handleRejectSub}
                currentTeacherId={user?.teacherId ?? undefined}
                loadingId={subLoadingId}
              />
            </SectionCard>

            <SectionCard
              title="Special classes"
              subtitle="Additional sessions, events, and timetable exceptions."
              actions={
                <Button variant="secondary" size="sm" onClick={() => setSpecialModalOpen(true)}>
                  mon to fri only one class
                </Button>
              }
            >
              <SpecialClassesList items={specialClasses} />
            </SectionCard>
          </div>
        </div>

        <AddSubjectModal
          isOpen={modalOpen}
          day={selectedDay}
          period={selectedPeriod}
          onClose={() => setModalOpen(false)}
          onAdd={handleConfirmAddSubject}
          loading={addingSubject}
        />
        <AddSpecialClassModal
          isOpen={specialModalOpen}
          onClose={() => setSpecialModalOpen(false)}
          onAdd={handleAddSpecialClass}
          loading={addingSpecialClass}
          teachers={teachers}
        />
      </div>
    </TeacherLayout>
  );
}
