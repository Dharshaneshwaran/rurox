"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import SectionCard from "@/components/SectionCard";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string;
}

import AdminLayout from "@/components/AdminLayout";

export default function AdminUsersPage() {
  const { token, user, loading, clear } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [loadingState, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [pending, all] = await Promise.all([
        apiFetch<{ users: User[] }>("/api/admin/users/pending", {}, token),
        apiFetch<{ users: User[] }>("/api/admin/users", {}, token),
      ]);
      setPendingUsers(pending.users);
      setAllUsers(all.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleApprove = async (userId: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(
        `/api/admin/users/${userId}/approve`,
        { method: "POST" },
        token
      );
      setSuccess("User approved successfully!");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" }, token);
      setSuccess("User deleted successfully!");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  if (loading && pendingUsers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center p-8 text-sm text-zinc-500">
          Loading users...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-8 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Admin Control
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              User Management
            </h1>
          </div>
        </header>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="flex gap-4 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === "pending"
                ? "border-b-2 border-amber-700 text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Pending Approvals ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === "all"
                ? "border-b-2 border-amber-700 text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All Users ({allUsers.length})
          </button>
        </div>

        {activeTab === "pending" && (
          <SectionCard title="Pending Teacher Approvals">
            {pendingUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-2xl bg-white p-6"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-900">{user.name || user.email}</p>
                      <p className="text-sm text-zinc-600">{user.email}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Requested: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={loadingState}
                        className="rounded-full bg-green-50 px-6 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={loadingState}
                        className="rounded-full bg-red-50 px-6 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {activeTab === "all" && (
          <SectionCard title="All System Users">
            {allUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">No users found</p>
            ) : (
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-2xl bg-white p-6"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-900">{user.name || user.email}</p>
                      <p className="text-sm text-zinc-600">{user.email}</p>
                      <div className="mt-1 flex gap-2">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                          {user.role}
                        </span>
                        {!user.approved && (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                            Pending Approval
                          </span>
                        )}
                        {user.approved && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Approved
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={loadingState || user.role === "ADMIN"}
                      className="rounded-full bg-red-50 px-6 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

      </div>
    </AdminLayout>
  );
}
