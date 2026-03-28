import type { Substitution } from "@/lib/types";

type SubstitutionListProps = {
  substitutions: Substitution[];
};

export default function SubstitutionList({ substitutions }: SubstitutionListProps) {
  if (!substitutions.length) {
    return <p className="text-sm text-zinc-500">No substitutions yet.</p>;
  }

  return (
    <div className="space-y-3">
      {substitutions.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {item.day} • Period {item.period}
              </p>
              <p className="text-xs text-zinc-600">
                Absent: {item.absentTeacher?.name ?? "Unknown"} · Replacement:{" "}
                {item.replacementTeacher?.name ?? "Pending"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.autoAssigned
                  ? "bg-emerald-100 text-emerald-700"
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
