"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { Teacher } from "@/lib/types";

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
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  const loadTeachers = useCallback(async () => {
    if (!token) return;
    setDirectoryLoading(true);
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
    } finally {
      setDirectoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadTeachers();
    }
  }, [loading, loadTeachers]);

  const handleCreateTeacher = async () => {
    if (!token) return;
    setCreatingTeacher(true);
    setError(null);

    try {
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
      await loadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create teacher");
    } finally {
      setCreatingTeacher(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(term) ||
      teacher.subjects.some((subject) => subject.toLowerCase().includes(term))
    );
  });

  const subjectCount = useMemo(
    () => new Set(teachers.flatMap((teacher) => teacher.subjects)).size,
    [teachers]
  );
  const totalWorkload = useMemo(
    () => teachers.reduce((sum, teacher) => sum + teacher.workload, 0),
    [teachers]
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-700 font-bold">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
            <p className="text-slate-700 mt-1 font-black text-sm">Manage teachers, schedules, and substitutions</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/admin/users"
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 font-black text-sm hover:bg-slate-200 transition-colors"
            >
              Approvals
            </Link>
            <Link 
              href="/admin/substitutions"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-colors"
            >
              Substitutions
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-bold text-slate-800 mb-1">Teachers</p>
            <p className="text-3xl font-black text-slate-900">{teachers.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-bold text-slate-800 mb-1">Subjects</p>
            <p className="text-3xl font-black text-slate-900">{subjectCount}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-sm font-bold text-slate-800 mb-1">Active Substitutions</p>
            <p className="text-3xl font-black text-slate-900">{totalWorkload}</p>
          </div>
        </div>

        {/* Create Teacher Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h2 className="font-bold text-lg text-slate-900 mb-4">Add New Teacher</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={newTeacher.password}
              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Subjects (comma-separated)"
              value={newTeacher.subjects}
              onChange={(e) => setNewTeacher({ ...newTeacher, subjects: e.target.value })}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateTeacher}
              disabled={creatingTeacher}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {creatingTeacher ? "Adding..." : "Add"}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-100 text-red-700 text-base font-black">
              {error}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {directoryLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-base text-slate-700 font-black">Loading teachers...</p>
              </div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-base text-slate-700 font-black">No teachers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-base font-black text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-base font-black text-slate-900">Subjects</th>
                    <th className="px-6 py-3 text-left text-base font-black text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-base font-black text-slate-900">{teacher.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-1 flex-wrap">
                          {teacher.subjects.map((subject) => (
                            <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-900 rounded text-sm font-black">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/teachers/${teacher.id}`}
                          className="text-blue-600 hover:text-blue-700 font-black transition-colors text-base"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
