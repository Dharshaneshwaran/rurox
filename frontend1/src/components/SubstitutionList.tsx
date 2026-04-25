import type { Substitution } from "@/lib/types";
import { cn } from "@/lib/cn";
import { badgeClasses } from "@/components/ui/Badge";

import Button from "@/components/ui/Button";

type SubstitutionListProps = {
  substitutions: Substitution[];
  variant?: "light" | "dark";
  onAccept?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onApproveRejection?: (id: string) => Promise<void>;
  currentTeacherId?: string;
  isAdmin?: boolean;
  loadingId?: string | null;
  onDelete?: (id: string) => Promise<void>;
};

export default function SubstitutionList({
  substitutions,
  variant = "light",
  onAccept,
  onReject,
  onApproveRejection,
  currentTeacherId,
  isAdmin,
  loadingId,
  onDelete,
}: SubstitutionListProps) {
  if (!substitutions.length) {
    return <p className="text-sm text-muted-foreground">No substitutions scheduled.</p>;
  }

  const dark = variant === "dark";

  return (
    <div className="space-y-3">
      {substitutions.map((item) => (
        <article
          key={item.id}
          className={cn(
            "rounded-[24px] border px-4 py-4",
            dark
              ? "border-white/15 bg-white/5"
              : "border-border bg-white"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "font-black tracking-tight",
                    dark ? "text-white" : "text-zinc-900"
                  )}
                >
                  {item.day} / Period {item.period}
                </p>
                <span
                  className={cn(
                    "text-[11px] uppercase tracking-[0.14em] font-bold",
                    dark ? "text-zinc-400" : "text-zinc-500"
                  )}
                >
                  {new Date(item.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p
                className={cn(
                  "mt-4 text-[13px] font-bold",
                  dark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                Absent: <span className={cn("font-black", dark ? "text-white" : "text-zinc-900")}>{item.absentTeacher?.name ?? "Unknown"}</span>
              </p>
              <p
                className={cn(
                  "mt-1 text-[13px] font-bold",
                  dark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                Cover: <span className={cn("font-black", dark ? "text-zinc-100" : "text-zinc-800")}>{item.replacementTeacher?.name ?? "Searching..."}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={badgeClasses({
                  variant: 
                    item.status === "PENDING" ? "warning" :
                    item.status === "REJECTED" ? "danger" :
                    item.status === "REASSIGNED" ? "neutral" :
                    "success",
                })}
              >
                {item.status || (item.autoAssigned ? "Auto" : "Manual")}
              </span>
              
              {onAccept && onReject && item.status === "PENDING" && item.replacementTeacherId === currentTeacherId && (
                <div className="mt-2 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onReject(item.id)}
                    disabled={loadingId === item.id}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => onAccept(item.id)}
                    disabled={loadingId === item.id}
                  >
                    Accept
                  </Button>
                </div>
              )}
              
              {isAdmin && onApproveRejection && item.status === "REJECTED" && (
                <div className="mt-2 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => onApproveRejection(item.id)}
                    disabled={loadingId === item.id}
                  >
                    Reassign cover
                  </Button>
                </div>
              )}

              {isAdmin && onDelete && (
                <Button
                  onClick={() => onDelete(item.id)}
                  disabled={loadingId === item.id}
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  Delete Record
                </Button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
