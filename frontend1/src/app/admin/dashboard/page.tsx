/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Teacher } from "@/lib/types";
import SectionCard from "@/components/SectionCard";
import AdminLayout from "@/components/AdminLayout";

export default function AdminDashboardPage() {
  const { token, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    subjects: "",
  });
  const [error, setError] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const teacherData = await apiFetch<{ teachers: Teacher[] }>(
        "/api/teachers",
        {},
        token
      );
      setTeachers(teacherData.teachers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teachers");
    }
  }, [token]);

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
    loadTeachers();
  };

  useEffect(() => {
    if (!loading) {
      void loadTeachers();
    }
  }, [loading, loadTeachers]);

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subjects.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center p-8 text-sm text-zinc-500">
          Loading dashboard...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-8 py-12">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
            Teachers Directory
          </h1>
          <p className="mt-2 text-zinc-600 max-w-2xl">
            Select a teacher to view and edit their specific timetable, schedule special classes, or manage their workload.
          </p>
        </header>

        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-zinc-900">
              Staff List ({filteredTeachers.length})
            </h2>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
              <input
                type="text"
                placeholder="Search teachers or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 rounded-full border border-zinc-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              />
            </div>
          </div>

          {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Link
                href={`/admin/teachers/${teacher.id}`}
                key={teacher.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-900/5"
              >
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl font-bold text-amber-700 transition group-hover:bg-amber-100 group-hover:scale-110">
                    {teacher.name.charAt(0)}
                  </div>
                  <h3 className="line-clamp-1 text-lg font-bold text-zinc-900">
                    {teacher.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {teacher.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700"
                      >
                        {sub}
                      </span>
                    ))}
                    {teacher.subjects.length === 0 && (
                      <span className="text-xs italic text-zinc-400">No subjects assigned</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <span className="text-sm font-medium text-zinc-500">
                    Workload: <strong className="text-zinc-900">{teacher.workload}</strong> substitutions
                  </span>
                  <span className="flex items-center text-sm font-bold text-amber-700 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                    View Timetable &rarr;
                  </span>
                </div>
              </Link>
            ))}
            
            {filteredTeachers.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-zinc-300 py-12 text-center text-zinc-500">
                No teachers found matching your search.
              </div>
            )}
          </div>
        </section>

        <SectionCard
          title="Add New Teacher"
          subtitle="Quickly onboard a new staff member to the system"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              placeholder="Full Name"
              value={newTeacher.name}
              onChange={(event) =>
                setNewTeacher((prev) => ({ ...prev, name: event.target.value }))
              }
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-amber-400 focus:outline-none"
            />
            <input
              placeholder="Email Profile"
              value={newTeacher.email}
              onChange={(event) =>
                setNewTeacher((prev) => ({ ...prev, email: event.target.value }))
              }
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-amber-400 focus:outline-none"
            />
            <input
              placeholder="Temporary Password"
              type="password"
              value={newTeacher.password}
              onChange={(event) =>
                setNewTeacher((prev) => ({ ...prev, password: event.target.value }))
              }
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-amber-400 focus:outline-none"
            />
            <input
              placeholder="Subjects (e.g., Math, Physics)"
              value={newTeacher.subjects}
              onChange={(event) =>
                setNewTeacher((prev) => ({ ...prev, subjects: event.target.value }))
              }
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-amber-400 focus:outline-none"
            />
            <button
              onClick={handleCreateTeacher}
              className="col-span-full mt-2 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              + Create Teacher Profile
            </button>
          </div>
        </SectionCard>
      </div>
    </AdminLayout>
  );
}
