import type { Substitution } from "@/lib/types";
import { cn } from "@/lib/cn";
import { badgeClasses } from "@/components/ui/Badge";

type SubstitutionListProps = {
  substitutions: Substitution[];
  variant?: "light" | "dark";
};

export default function SubstitutionList({
  substitutions,
  variant = "light",
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
            "border px-4 py-4",
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
                    "font-medium",
                    dark ? "text-white" : "text-foreground"
                  )}
                >
                  {item.day} / Period {item.period}
                </p>
                <span
                  className={cn(
                    "text-xs uppercase tracking-[0.2em]",
                    dark ? "text-white/55" : "text-muted-foreground"
                  )}
                >
                  {new Date(item.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p
                className={cn(
                  "mt-3 text-sm",
                  dark ? "text-white/75" : "text-muted-foreground"
                )}
              >
                Absent: {item.absentTeacher?.name ?? "Unknown"}
              </p>
              <p
                className={cn(
                  "mt-1 text-sm",
                  dark ? "text-white/75" : "text-muted-foreground"
                )}
              >
                Cover: {item.replacementTeacher?.name ?? "Pending"}
              </p>
            </div>
            <span
              className={badgeClasses({
                variant: item.autoAssigned ? "success" : "warning",
              })}
            >
              {item.autoAssigned ? "Auto" : "Manual"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
