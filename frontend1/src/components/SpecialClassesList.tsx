import type { SpecialClass } from "@/lib/types";

type SpecialClassesListProps = {
  items: SpecialClass[];
};

export default function SpecialClassesList({ items }: SpecialClassesListProps) {
  if (!items.length) {
    return <p className="text-sm text-zinc-500">No special classes scheduled.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3"
        >
          <p className="text-sm font-semibold text-zinc-900">
            {item.subject} · {item.className}
          </p>
          <p className="text-xs text-zinc-600">
            {new Date(item.date).toLocaleDateString()} · {item.fromTime} -
            {" "}
            {item.toTime}
          </p>
          {item.notes ? (
            <p className="mt-1 text-xs text-zinc-500">{item.notes}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
