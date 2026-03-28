import type { Substitution } from "@/lib/types";

type SubstitutionListProps = {
  substitutions: Substitution[];
  variant?: "light" | "dark";
};

export default function SubstitutionList({
  substitutions,
  variant = "light",
}: SubstitutionListProps) {
  if (!substitutions.length) {
    return (
      <p className={`text-sm ${variant === "dark" ? "text-zinc-500" : "text-zinc-500"}`}>
        No substitutions yet.
      </p>
    );
  }

  const isDark = variant === "dark";

  return (
    <div className="space-y-3">
      {substitutions.map((item) => (
        <div
          key={item.id}
          className={`rounded-2xl border px-4 py-3 ${
            isDark
              ? "border-zinc-700/50 bg-zinc-800/50"
              : "border-zinc-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                {item.day} • Period {item.period}
              </p>
              <p
                className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
              >
                Absent: {item.absentTeacher?.name ?? "Unknown"} · Replacement:{" "}
                {item.replacementTeacher?.name ?? "Pending"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.autoAssigned
                  ? isDark
                    ? "bg-emerald-400/15 text-emerald-400"
                    : "bg-emerald-100 text-emerald-700"
                  : isDark
                    ? "bg-amber-400/15 text-amber-400"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {item.autoAssigned ? "Auto" : "Manual"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
