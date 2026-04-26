"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import SectionCard from "@/components/SectionCard";
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
  canCreateStudents?: boolean;
  createdAt: string;
  student?: {
    className: string | null;
  };
}

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const UsersIcon2 = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

type TabKey = "pending" | "teachers" | "students" | "all";

export default function AdminUsersPage() {
  const { token, loading } = useAuth({ role: "ADMIN", redirectTo: "/admin/login" });
  const [pendingUsers, setPendingUsers] = useState<UserRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
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

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const handleApprove = async (userId: string) => {
    if (!token) return;
    setLoadingState(true);
    setError(null); setSuccess(null);
    try {
      await apiFetch(`/api/admin/users/${userId}/approve`, { method: "POST" }, token);
      setSuccess("User approved successfully.");
      await loadUsers();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to approve"); }
    finally { setLoadingState(false); }
  };

  const handleDelete = async (userId: string) => {
    if (!token || !confirm("Delete this user permanently?")) return;
    setLoadingState(true);
    setError(null); setSuccess(null);
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" }, token);
      setSuccess("User deleted successfully.");
      await loadUsers();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to delete"); }
    finally { setLoadingState(false); }
  };

  const handleToggleCreateStudents = async (userId: string) => {
    if (!token) return;
    setLoadingState(true);
    setError(null); setSuccess(null);
    try {
      await apiFetch(`/api/admin/users/${userId}/toggle-create-students`, { method: "POST" }, token);
      setSuccess("Permission updated.");
      await loadUsers();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update"); }
    finally { setLoadingState(false); }
  };

  const teachers = useMemo(() => allUsers.filter(u => u.role === "TEACHER"), [allUsers]);
  const students = useMemo(() => allUsers.filter(u => u.role === "STUDENT"), [allUsers]);
  const approvedCount = useMemo(() => allUsers.filter((u) => u.approved).length, [allUsers]);

  if (loading) return <AdminLayout><div className="p-8 text-sm text-[var(--color-text-muted)]">Loading...</div></AdminLayout>;

  const tabs: { key: TabKey, label: string, count: number }[] = [
    { key: "pending", label: "Pending Approvals", count: pendingUsers.length },
    { key: "teachers", label: "Teachers", count: teachers.length },
    { key: "students", label: "Students", count: students.length },
    { key: "all", label: "All Users", count: allUsers.length },
  ];

  const renderUserList = (users: UserRecord[], emptyTitle: string, emptyDesc: string) => {
    if (users.length === 0) {
      return <EmptyState title={emptyTitle} description={emptyDesc} />;
    }

    return (
      <div className="space-y-2 stagger">
        {users.map((user) => (
          <div key={user.id} className="erp-row">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold shadow-sm ${
                user.role === "ADMIN" ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : user.role === "TEACHER" ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                : "bg-[var(--color-success-soft)] text-[var(--color-success)]"
              }`}>
                {getInitials(user.name, user.email)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[14px] text-[var(--color-text)]">
                    {user.name || user.email}
                  </span>
                  <Badge variant="neutral">{user.role}</Badge>
                  <Badge variant={user.approved ? "success" : "warning"}>
                    {user.approved ? "Approved" : "Pending"}
                  </Badge>
                  {user.student?.className && (
                    <Badge variant="accent">Class: {user.student.className}</Badge>
                  )}
                  {user.canCreateStudents && <Badge variant="accent">Can Add Students</Badge>}
                </div>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-muted)]">
                  {user.email} {user.approved ? "" : `· Requested ${new Date(user.createdAt).toLocaleDateString("en-IN")}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!user.approved && (
                <Button size="sm" variant="primary" onClick={() => handleApprove(user.id)} disabled={loadingState}>
                  ✓ Approve
                </Button>
              )}
              {user.role === "TEACHER" && user.approved && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleToggleCreateStudents(user.id)}
                  disabled={loadingState}
                >
                  {user.canCreateStudents ? "Revoke Students" : "Allow Students"}
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(user.id)}
                disabled={loadingState || user.role === "ADMIN"}
              >
                {user.approved ? "Delete" : "Reject"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        <PageHeader
          title="User Management"
          description="Approve teacher accounts, manage access, and review all users in the system."
          meta={
            <>
              <Badge variant="warning">{pendingUsers.length} pending</Badge>
              <Badge variant="accent">{teachers.length} teachers</Badge>
              <Badge variant="success">{students.length} students</Badge>
            </>
          }
        />

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-[var(--color-success-soft)] bg-[var(--color-success-soft)] px-4 py-3 text-sm text-[var(--color-success)]">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending" value={String(pendingUsers.length)}
            detail="Awaiting review" tone={pendingUsers.length > 0 ? "accent" : "default"}
            icon={<ShieldIcon />} />
          <StatCard label="Teachers" value={String(teachers.length)}
            detail="Faculty members" tone="accent" icon={<UsersIcon2 />} />
          <StatCard label="Students" value={String(students.length)}
            detail="Enrolled students" tone="success" icon={<UsersIcon2 />} />
          <StatCard label="Approved Total" value={String(approvedCount)}
            detail="Active accounts" icon={<ShieldIcon />} />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md px-4 py-2 text-[13px] font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                activeTab === tab.key ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* List View */}
        <div className="mt-4">
          {activeTab === "pending" && (
            <SectionCard title="Pending Approvals" subtitle="New teacher requests waiting for admin review.">
              {renderUserList(pendingUsers, "No pending approvals", "All teacher requests have been reviewed.")}
            </SectionCard>
          )}
          {activeTab === "teachers" && (
            <SectionCard title="Teacher Directory" subtitle="List of all teachers registered in the system.">
              {renderUserList(teachers, "No teachers found", "There are no teacher accounts in the system.")}
            </SectionCard>
          )}
          {activeTab === "students" && (
            <SectionCard title="Student Directory" subtitle="List of all students registered in the system.">
              {renderUserList(students, "No students found", "There are no student accounts in the system.")}
            </SectionCard>
          )}
          {activeTab === "all" && (
            <SectionCard title="All System Users" subtitle="Comprehensive list of all accounts.">
              {renderUserList(allUsers, "No users found", "There are no user accounts in the system.")}
            </SectionCard>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
