"use client";

import { useCallback, useEffect, useState } from "react";
import StudentLayout from "@/components/StudentLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PlusIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import ApplyLeaveModal from "@/components/ApplyLeaveModal";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function StudentLeavesPage() {
  const { token, loading } = useAuth({
    role: "STUDENT",
    redirectTo: "/student/login",
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = useCallback(async () => {
    if (!token) return;
    setPageLoading(true);
    try {
      const data = await apiFetch<LeaveRequest[]>("/api/leaves/my", {}, token);
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

  const handleApplyLeave = async (formData: {
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    if (!token) return;
    setSubmitting(true);
    try {
      await apiFetch(
        "/api/leaves",
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        token
      );
      setModalOpen(false);
      await loadLeaves();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Student workspace"
          title="Leave Requests"
          description="Track your leave applications and submit new requests."
          meta={
            <>
              <Badge variant="accent">Attendance Management</Badge>
              <Badge variant="neutral">{leaves.length} requests</Badge>
            </>
          }
          actions={
            <Button
              variant="primary"
              onClick={() => setModalOpen(true)}
              className="gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Apply for Leave
            </Button>
          }
        />

        {error && (
          <div className="mt-6 rounded-[16px] border border-danger/50 bg-danger-soft/40 p-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <SectionCard
            title="Leave History"
            subtitle="View the status of your past and pending leave requests."
          >
            {pageLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading history...
              </div>
            ) : leaves.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No leave requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-foreground">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-xs truncate">
                          <span className="text-muted-foreground">{leave.reason}</span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              leave.status === "APPROVED"
                                ? "success"
                                : leave.status === "REJECTED"
                                ? "danger"
                                : "warning"
                            }
                          >
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

      <ApplyLeaveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleApplyLeave}
        loading={submitting}
      />
    </StudentLayout>
  );
}
