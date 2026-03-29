"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";
import { cn } from "@/lib/cn";
import { PlusIcon } from "@/components/icons";

const days = [
  { key: "MON", label: "Monday" },
  { key: "TUE", label: "Tuesday" },
  { key: "WED", label: "Wednesday" },
  { key: "THU", label: "Thursday" },
  { key: "FRI", label: "Friday" },
] as const;

const periods = Array.from({ length: 8 }, (_, index) => index + 1);

type TimetableGridProps = {
  entries: TimetableEntry[];
  onAddSubject?: (day: string, period: number) => void;
  isTeacher?: boolean;
};

export default function TimetableGrid({
  entries,
  onAddSubject,
}: TimetableGridProps) {
  const today = useMemo(() => {
    const dayIndex = new Date().getDay();
    const map: Record<number, string> = {
      1: "MON",
      2: "TUE",
      3: "WED",
      4: "THU",
      5: "FRI",
    };
    return map[dayIndex] ?? null;
  }, []);

  const byKey = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    for (const entry of entries) {
      map.set(`${entry.day}-${entry.period}`, entry);
    }
    return map;
  }, [entries]);

  return (
    <div className="space-y-5">
      <div className="space-y-4 lg:hidden">
        {days.map((day) => (
          <section key={day.key} className="border border-border bg-white">
            <div
              className={cn(
                "flex items-center justify-between border-b border-border px-4 py-3",
                today === day.key && "bg-accent-soft/60"
              )}
            >
              <h3 className="font-display text-xl tracking-[-0.03em] text-foreground">
                {day.label}
              </h3>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                8 periods
              </span>
            </div>
            <div className="divide-y divide-border">
              {periods.map((period) => {
                const entry = byKey.get(`${day.key}-${period}`);
                return (
                  <div
                    key={`${day.key}-${period}`}
                    className="grid grid-cols-[auto_1fr] gap-4 px-4 py-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center border border-border text-sm font-medium text-foreground">
                      {period}
                    </div>
                    {entry ? (
                      <div
                        className={cn(
                          "border px-4 py-3 min-w-0",
                          entry.isSubstitution
                            ? "border-accent bg-accent-soft/70"
                            : "border-border bg-background/55"
                        )}
                      >
                        <p className="font-medium text-foreground truncate">{entry.subject}</p>
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                          {entry.className}
                          {entry.room ? ` | Room ${entry.room}` : ""}
                        </p>
                      </div>
                    ) : onAddSubject ? (
                      <button
                        type="button"
                        onClick={() => onAddSubject(day.key, period)}
                        className="inline-flex items-center justify-between gap-3 border border-dashed border-border px-4 py-3 text-left text-sm font-medium text-accent transition hover:bg-accent-soft/40"
                      >
                        <span>Assign class to this free slot</span>
                        <PlusIcon className="h-4 w-4 flex-none" />
                      </button>
                    ) : (
                      <div className="border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                        Free slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="hidden overflow-x-auto border border-border bg-white lg:block">
        <div className="scroll-area min-w-[980px]">
          <div
            className="grid border-b border-border bg-background/80 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground"
            style={{ gridTemplateColumns: "92px repeat(5, minmax(0, 1fr))" }}
          >
            <div className="px-4 py-4">Period</div>
            {days.map((day) => (
              <div
                key={day.key}
                className={cn(
                  "border-l border-border px-4 py-4",
                  today === day.key && "bg-accent-soft/70 text-accent"
                )}
              >
                {day.label}
              </div>
            ))}
          </div>

          {periods.map((period) => (
            <div
              key={period}
              className="grid border-b border-border last:border-b-0"
              style={{ gridTemplateColumns: "92px repeat(5, minmax(0, 1fr))" }}
            >
              <div className="flex items-start justify-center px-4 py-5 text-sm font-medium text-foreground">
                {period}
              </div>
              {days.map((day) => {
                const entry = byKey.get(`${day.key}-${period}`);
                return (
                  <div
                    key={`${day.key}-${period}`}
                    className={cn(
                      "border-l border-border px-3 py-3",
                      today === day.key && "bg-accent-soft/20"
                    )}
                  >
                    {entry ? (
                      <div
                        className={cn(
                          "h-full border px-4 py-3 min-w-0 flex flex-col",
                          entry.isSubstitution
                            ? "border-accent bg-accent-soft/80"
                            : "border-border bg-white"
                        )}
                      >
                        <p className="font-medium text-foreground truncate">{entry.subject}</p>
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                          {entry.className}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground truncate mt-auto">
                          {entry.room ? `Room ${entry.room}` : "Room not assigned"}
                        </p>
                      </div>
                    ) : onAddSubject ? (
                      <button
                        type="button"
                        onClick={() => onAddSubject(day.key, period)}
                        className="flex h-full min-h-24 w-full items-center justify-between border border-dashed border-border px-4 py-3 text-left text-sm text-accent transition hover:bg-accent-soft/40"
                      >
                        <span className="font-medium">Assign class</span>
                        <PlusIcon className="h-4 w-4 flex-none" />
                      </button>
                    ) : (
                      <div className="flex h-full min-h-24 items-center border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                        Free slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
