"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import SectionCard from "@/components/SectionCard";
import { ShieldIcon, UsersIcon } from "@/components/icons";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { token, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const [pendingUsers, setPendingUsers] = useState<UserRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoadingState(true);
    setError(null);

    try {
      const [pending, all] = await Promise.all([
        apiFetch<{ users: UserRecord[] }>("/api/admin/users/pending", {}, token),
        apiFetch<{ users: UserRecord[] }>("/api/admin/users", {}, token),
      ]);
      setPendingUsers(pending.users);
      setAllUsers(all.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoadingState(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleApprove = async (userId: string) => {
    if (!token) return;
    setLoadingState(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/api/admin/users/${userId}/approve`, { method: "POST" }, token);
      setSuccess("User approved successfully.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve user");
    } finally {
      setLoadingState(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!token) return;
    if (!confirm("Delete this user permanently?")) {
      return;
    }

    setLoadingState(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" }, token);
      setSuccess("User deleted successfully.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setLoadingState(false);
    }
  };

  const approvedCount = useMemo(
    () => allUsers.filter((user) => user.approved).length,
    [allUsers]
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="px-4 py-10 text-sm text-muted-foreground sm:px-8 lg:px-10">
          Loading users...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="User approvals"
          title="Access control"
          description="Approve pending teacher accounts, monitor overall access, and remove accounts that should no longer be in the system."
          meta={
            <>
              <Badge variant="accent">{pendingUsers.length} pending approvals</Badge>
              <Badge variant="neutral">{allUsers.length} total users</Badge>
            </>
          }
        />

        {error ? (
          <div className="mt-6 border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-6 border border-success bg-success-soft px-4 py-3 text-sm text-success">
            {success}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Pending"
            value={String(pendingUsers.length)}
            detail="Teachers waiting for an admin decision."
            tone={pendingUsers.length ? "accent" : "default"}
            icon={<ShieldIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Approved"
            value={String(approvedCount)}
            detail="Accounts that can sign into the platform today."
            tone={approvedCount ? "success" : "default"}
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <StatCard
            label="All users"
            value={String(allUsers.length)}
            detail="Every account currently stored in the system."
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Active view"
            value={activeTab === "pending" ? "Pending" : "All users"}
            detail="Switch between the approval queue and the full user list."
            tone="accent"
            icon={<ShieldIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-6 rounded-[24px] border border-border bg-white p-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
                activeTab === "pending"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              Pending approvals ({pendingUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
                activeTab === "all"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              All users ({allUsers.length})
            </button>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "pending" ? (
            <SectionCard
              title="Pending teacher approvals"
              subtitle="Review new teacher requests and decide which accounts should enter the system."
            >
              {pendingUsers.length ? (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-[24px] border border-border bg-background/45 p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-2xl tracking-[-0.04em] text-foreground">
                              {user.name || user.email}
                            </p>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            Requested {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                          <Button
                            onClick={() => handleApprove(user.id)}
                            variant="accent"
                            disabled={loadingState}
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleDelete(user.id)}
                            variant="danger"
                            disabled={loadingState}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No approvals waiting"
                  description="All current teacher requests have already been reviewed."
                />
              )}
            </SectionCard>
          ) : (
            <SectionCard
              title="All system users"
              subtitle="Track approved and pending accounts across the platform."
            >
              {allUsers.length ? (
                <div className="space-y-4">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-[24px] border border-border bg-background/45 p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-2xl tracking-[-0.04em] text-foreground">
                              {user.name || user.email}
                            </p>
                            <Badge variant="neutral">{user.role}</Badge>
                            <Badge variant={user.approved ? "success" : "warning"}>
                              {user.approved ? "Approved" : "Pending"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        <div className="flex items-center">
                          <Button
                            onClick={() => handleDelete(user.id)}
                            variant="danger"
                            disabled={loadingState || user.role === "ADMIN"}
                          >
                            Delete user
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No users found"
                  description="There are no user accounts in the system yet."
                />
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
