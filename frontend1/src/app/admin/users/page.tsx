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
import { cn } from "@/lib/cn";

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
      <div className="px-4 py-6 sm:px-8 lg:px-10 xl:px-12">
        <PageHeader
          variant="command"
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

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Approvals Queue"
            value={String(pendingUsers.length)}
            detail="Teachers awaiting administrative clearance."
            tone={pendingUsers.length ? "accent" : "default"}
            icon={<ShieldIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Verified Personnel"
            value={String(approvedCount)}
            detail="Accounts with active system throughput."
            tone={approvedCount ? "accent" : "default"}
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Total Archives"
            value={String(allUsers.length)}
            detail="All identities stored in the central database."
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Active Sector"
            value={activeTab === "pending" ? "Approvals" : "Full Registry"}
            detail="Current situational awareness view."
            tone="accent"
            icon={<ShieldIcon className="h-5 w-5" />}
          />
        </div>

        <div className="mt-12 flex items-center gap-6 border-b border-white/5 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={cn(
                "group relative py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all",
                activeTab === "pending" ? "text-primary" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Pending Approvals ({pendingUsers.length})
              {activeTab === "pending" && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary shadow-[0_0_10px_#3b82f6]" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "group relative py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all",
                activeTab === "all" ? "text-primary" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Personnel Registry ({allUsers.length})
              {activeTab === "all" && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary shadow-[0_0_10px_#3b82f6]" />}
            </button>
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
                      className="card-reveal p-8 mb-6 relative overflow-hidden"
                    >
                      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-5">
                             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[18px] font-black text-white italic">
                                {user.name?.charAt(0) || user.email.charAt(0)}
                             </div>
                             <div>
                                <p className="text-[20px] font-black tracking-tighter text-white italic leading-none">
                                  {user.name || "UNIDENTIFIED ID"}
                                </p>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{user.email}</p>
                             </div>
                             <div className="flex items-center gap-2">
                                <Badge variant="warning">Awaiting clearance</Badge>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="h-px w-6 bg-slate-800" />
                             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
                               Requested {new Date(user.createdAt).toLocaleDateString()}
                             </p>
                          </div>
                        </div>
 
                        <div className="flex flex-wrap gap-4">
                          <Button
                            onClick={() => handleApprove(user.id)}
                            variant="primary"
                            disabled={loadingState}
                            className="px-8 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          >
                            Authorize
                          </Button>
                          <Button
                            onClick={() => handleDelete(user.id)}
                            variant="danger"
                            disabled={loadingState}
                            className="px-8 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                          >
                            Deny
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
                      className="card-reveal p-8 mb-6 relative overflow-hidden"
                    >
                      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                         <div className="flex flex-wrap items-center gap-5">
                             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[18px] font-black text-white italic">
                                {user.name?.charAt(0) || user.email.charAt(0)}
                             </div>
                             <div>
                                <p className="text-[20px] font-black tracking-tighter text-white italic leading-none">
                                  {user.name || "System Admin"}
                                </p>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{user.email}</p>
                             </div>
                            <div className="flex items-center gap-2">
                               <Badge variant="neutral">{user.role}</Badge>
                               <Badge variant={user.approved ? "success" : "warning"}>
                                 {user.approved ? "Verified" : "Awaiting Clearance"}
                               </Badge>
                            </div>
                         </div>
 
                        <Button
                          onClick={() => handleDelete(user.id)}
                          variant="danger"
                          disabled={loadingState || user.role === "ADMIN"}
                          className="px-8 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        >
                          Revoke Access
                        </Button>
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
