/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Teacher, TimetableEntry } from "@/lib/types";
import SectionCard from "@/components/SectionCard";

export default function AdminDashboardPage() {
  const { token, user, loading, clear } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filters, setFilters] = useState({ teacher: "", subject: "", class: "" });
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    subjects: "",
  });
  const [editTeacher, setEditTeacher] = useState({
    id: "",
    name: "",
    subjects: "",
  });
  const [newEntry, setNewEntry] = useState({
    teacherId: "",
    day: "MON",
    period: 1,
    subject: "",
    className: "",
    room: "",
  });
  const [error, setError] = useState<string | null>(null);

  const loadTimetables = useCallback(async () => {
    if (!token) return;
    setError(null);
    const params = new URLSearchParams();
    if (filters.teacher) params.set("teacher", filters.teacher);
    if (filters.subject) params.set("subject", filters.subject);
    if (filters.class) params.set("class", filters.class);

    try {
      const [data, teacherData] = await Promise.all([
        apiFetch<{ timetables: TimetableEntry[] }>(
        `/api/timetables?${params.toString()}`,
        {},
        token
        ),
        apiFetch<{ teachers: Teacher[] }>("/api/teachers", {}, token),
      ]);
      setTimetables(data.timetables);
      setTeachers(teacherData.teachers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timetables");
    }
  }, [filters, token]);

  const handleCreateTeacher = async () => {
    if (!token) return;
    const subjects = newTeacher.subjects
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean);

    await apiFetch(
      "/api/teachers",
      {
        method: "POST",
        body: JSON.stringify({
          name: newTeacher.name,
          email: newTeacher.email,
          password: newTeacher.password,
          subjects,
        }),
      },
      token
    );

    setNewTeacher({ name: "", email: "", password: "", subjects: "" });
    loadTimetables();
  };

  const handleCreateEntry = async () => {
    if (!token) return;

    await apiFetch(
      "/api/timetables",
      {
        method: "POST",
        body: JSON.stringify({
          teacherId: newEntry.teacherId,
          day: newEntry.day,
          period: newEntry.period,
          subject: newEntry.subject,
          className: newEntry.className,
          room: newEntry.room || undefined,
        }),
      },
      token
    );

    setNewEntry({
      teacherId: "",
      day: "MON",
      period: 1,
      subject: "",
      className: "",
      room: "",
    });
    loadTimetables();
  };

  const handleUpdateTeacher = async () => {
    if (!token || !editTeacher.id) return;
    const subjects = editTeacher.subjects
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean);

    await apiFetch(
      `/api/teachers/${editTeacher.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: editTeacher.name || undefined,
          subjects: subjects.length ? subjects : undefined,
        }),
      },
      token
    );

    setEditTeacher({ id: "", name: "", subjects: "" });
    loadTimetables();
  };

  const handleDeleteTeacher = async () => {
    if (!token || !editTeacher.id) return;

    await apiFetch(
      `/api/teachers/${editTeacher.id}`,
      { method: "DELETE" },
      token
    );

    setEditTeacher({ id: "", name: "", subjects: "" });
    loadTimetables();
  };

  useEffect(() => {
    if (!loading) {
      void loadTimetables();
    }
  }, [loading, loadTimetables]);

  if (loading) {
    return <div className="p-8 text-sm text-zinc-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f5f1_0%,_#f0efe8_45%,_#e8e3d8_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/substitutions"
              className="inline-flex h-11 items-center rounded-full border border-zinc-300 px-5 text-sm font-semibold text-zinc-800 transition hover:border-zinc-800"
            >
              Manage Substitutions
            </Link>
            <button
              onClick={() => {
                clear();
                window.location.href = "/";
              }}
              className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white"
            >
              Sign out
            </button>
          </div>
        </header>

        <SectionCard
          title="All Timetables"
          subtitle="Filter by teacher, subject, or class"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <input
              placeholder="Teacher name"
              value={filters.teacher}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, teacher: event.target.value }))
              }
              className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
            />
            <input
              placeholder="Subject"
              value={filters.subject}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, subject: event.target.value }))
              }
              className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
            />
            <input
              placeholder="Class"
              value={filters.class}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, class: event.target.value }))
              }
              className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
            />
            <button
              onClick={loadTimetables}
              className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Apply Filters
            </button>
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-xs uppercase text-zinc-600">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Room</th>
                </tr>
              </thead>
              <tbody>
                {timetables.map((entry) => (
                  <tr key={entry.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3">
                      {entry.teacher?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3">{entry.day}</td>
                    <td className="px-4 py-3">{entry.period}</td>
                    <td className="px-4 py-3">{entry.subject}</td>
                    <td className="px-4 py-3">{entry.className}</td>
                    <td className="px-4 py-3">{entry.room ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Admin Controls"
          subtitle="Add teachers and update timetable entries"
        >
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Add Teacher
              </h3>
              <input
                placeholder="Name"
                value={newTeacher.name}
                onChange={(event) =>
                  setNewTeacher((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <input
                placeholder="Email"
                value={newTeacher.email}
                onChange={(event) =>
                  setNewTeacher((prev) => ({ ...prev, email: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <input
                placeholder="Password"
                type="password"
                value={newTeacher.password}
                onChange={(event) =>
                  setNewTeacher((prev) => ({ ...prev, password: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <input
                placeholder="Subjects (comma separated)"
                value={newTeacher.subjects}
                onChange={(event) =>
                  setNewTeacher((prev) => ({ ...prev, subjects: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <button
                onClick={handleCreateTeacher}
                className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Add Teacher
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Edit Teacher
              </h3>
              <select
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                value={editTeacher.id}
                onChange={(event) =>
                  setEditTeacher((prev) => ({ ...prev, id: event.target.value }))
                }
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="New name (optional)"
                value={editTeacher.name}
                onChange={(event) =>
                  setEditTeacher((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <input
                placeholder="Subjects (comma separated)"
                value={editTeacher.subjects}
                onChange={(event) =>
                  setEditTeacher((prev) => ({
                    ...prev,
                    subjects: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateTeacher}
                  className="flex-1 rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  Update
                </button>
                <button
                  onClick={handleDeleteTeacher}
                  className="flex-1 rounded-full border border-red-200 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Create Timetable Entry
              </h3>
              <select
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                value={newEntry.teacherId}
                onChange={(event) =>
                  setNewEntry((prev) => ({ ...prev, teacherId: event.target.value }))
                }
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                  value={newEntry.day}
                  onChange={(event) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      day: event.target.value as typeof newEntry.day,
                    }))
                  }
                >
                  {[
                    "MON",
                    "TUE",
                    "WED",
                    "THU",
                    "FRI",
                  ].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={newEntry.period}
                  onChange={(event) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      period: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
                />
              </div>
              <input
                placeholder="Subject"
                value={newEntry.subject}
                onChange={(event) =>
                  setNewEntry((prev) => ({ ...prev, subject: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <input
                placeholder="Class"
                value={newEntry.className}
                onChange={(event) =>
                  setNewEntry((prev) => ({ ...prev, className: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <input
                placeholder="Room (optional)"
                value={newEntry.room}
                onChange={(event) =>
                  setNewEntry((prev) => ({ ...prev, room: event.target.value }))
                }
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm"
              />
              <button
                onClick={handleCreateEntry}
                className="w-full rounded-full border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900"
              >
                Save Entry
              </button>
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
