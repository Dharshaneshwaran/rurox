"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  createdAt: string;
}

export default function AdminNoticesPage() {
  const { token, loading } = useAuth({ role: "ADMIN", redirectTo: "/admin/login" });
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadNotices = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Notice[]>("/api/notices", {}, token);
      setNotices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notices");
    } finally {
      setPageLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) void loadNotices();
  }, [loading, loadNotices]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch("/api/notices", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      }, token);
      setTitle("");
      setContent("");
      setSuccess("Notice posted successfully.");
      await loadNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this notice?")) return;
    try {
      await apiFetch(`/api/notices/${id}`, { method: "DELETE" }, token);
      setSuccess("Notice deleted.");
      await loadNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notice");
    }
  };

  if (loading) return null;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Admin workspace"
          title="Notice Board"
          description="Post school-wide announcements visible to all teachers and students."
          meta={
            <>
              <Badge variant="accent">{notices.length} notices</Badge>
            </>
          }
        />

        {error && <div className="mt-4 rounded-xl border border-danger/40 bg-danger-soft/30 p-3 text-sm text-danger">{error}</div>}
        {success && <div className="mt-4 rounded-xl border border-success/40 bg-success-soft/30 p-3 text-sm text-success">{success}</div>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Post Notice Form */}
          <SectionCard title="Post New Notice" subtitle="Announce holidays, events, or important information.">
            <form onSubmit={handlePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                  placeholder="e.g. Holiday on Monday"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Content</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                  placeholder="Full details of the notice..."
                />
              </div>
              <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                {submitting ? "Posting..." : "Post Notice"}
              </Button>
            </form>
          </SectionCard>

          {/* All Notices */}
          <SectionCard title="All Notices" subtitle="Recent announcements posted for the school.">
            {pageLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
            ) : notices.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No notices posted yet.</div>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="rounded-[18px] border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-xl mt-0.5">📢</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground">{notice.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{notice.content}</p>
                          <p className="mt-2 text-[10px] uppercase tracking-wider text-amber-600/70">
                            {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(notice.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </AdminLayout>
  );
}
