"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  createdAt: string;
}

interface NoticeBoardProps {
  token: string | null;
  compact?: boolean;
}

export default function NoticeBoard({ token, compact = false }: NoticeBoardProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotices = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Notice[]>("/api/notices", {}, token);
      setNotices(data);
    } catch {
      // silently fail on widget
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadNotices();
  }, [loadNotices]);

  const displayed = compact ? notices.slice(0, 3) : notices;

  if (loading) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground animate-pulse">
        Loading notices...
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No notices posted yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayed.map((notice) => (
        <div
          key={notice.id}
          className="group relative rounded-[18px] border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4 transition-all hover:border-amber-300/80 hover:shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base">
              📢
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-foreground leading-tight">{notice.title}</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{notice.content}</p>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-amber-600/70">
                {new Date(notice.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
