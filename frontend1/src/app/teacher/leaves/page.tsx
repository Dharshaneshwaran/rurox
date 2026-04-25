"use client";

import { useCallback, useEffect, useState } from "react";
import TeacherLayout from "@/components/TeacherLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  student: {
    id: string;
    name: string;
    rollNumber: string;
    className: string;
  };
}

export default function TeacherLeavesPage() {
  const { token, loading } = useAuth({
    role: "TEACHER",
    redirectTo: "/teacher/login",
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLeaves = useCallback(async () => {
    if (!token) return;
    setPageLoading(true);
    try {
      const data = await apiFetch<LeaveRequest[]>("/api/leaves/teacher", {}, token);
      setLeaves(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leave requests");
    } finally {
      setPageLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadLeaves();
    }
  }, [loading, loadLeaves]);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!token) return;
    setUpdatingId(id);
    try {
      await apiFetch(
        `/api/leaves/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        },
        token
      );
      await loadLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update leave status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return null;

  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  const processedLeaves = leaves.filter((l) => l.status !== "PENDING");

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Teacher workspace"
          title="Leave Approvals"
          description="Review and process leave requests from your students."
          meta={
            <>
              <Badge variant="accent">{pendingLeaves.length} pending</Badge>
              <Badge variant="neutral">{leaves.length} total</Badge>
            </>
          }
        />

        {error && (
          <div className="mt-6 rounded-[16px] border border-danger/50 bg-danger-soft/40 p-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="mt-6 space-y-6">
          <SectionCard
            title="Pending Requests"
            subtitle="Immediate action required for these requests."
          >
            {pageLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading requests...
              </div>
            ) : pendingLeaves.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No pending leave requests.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="rounded-[20px] border border-border bg-background/50 p-5 transition-all hover:border-accent/30"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xl tracking-tight text-foreground">
                            {leave.student.name}
                          </span>
                          <Badge variant="neutral">Class: {leave.student.className}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Reason:</strong> {leave.reason}
                        </p>
                        <p className="text-xs font-medium uppercase tracking-wider text-accent">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 lg:justify-end">
                        <Button
                          variant="accent"
                          onClick={() => handleUpdateStatus(leave.id, "APPROVED")}
                          disabled={updatingId === leave.id}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleUpdateStatus(leave.id, "REJECTED")}
                          disabled={updatingId === leave.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Recent History"
            subtitle="Previously processed leave requests."
          >
            {processedLeaves.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No processed requests yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Decision Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {processedLeaves.slice(0, 10).map((leave) => (
                      <tr key={leave.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-medium text-foreground">{leave.student.name}</div>
                          <div className="text-xs text-muted-foreground">{leave.student.className}</div>
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={leave.status === "APPROVED" ? "success" : "danger"}>
                            {leave.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {new Date(leave.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </TeacherLayout>
  );
}
