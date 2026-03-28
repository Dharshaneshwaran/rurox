import type { SpecialClass } from "@/lib/types";
import Badge from "@/components/ui/Badge";

type SpecialClassesListProps = {
  items: SpecialClass[];
};

export default function SpecialClassesList({ items }: SpecialClassesListProps) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No special classes scheduled.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="border border-border bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">{item.subject}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.className}</p>
            </div>
            <Badge>{new Date(item.date).toLocaleDateString()}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="accent">
              {item.fromTime} - {item.toTime}
            </Badge>
            {item.notes ? <Badge variant="neutral">{item.notes}</Badge> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
