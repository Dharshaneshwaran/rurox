"use client";

import { useMemo, useState } from "react";
import type { TimetableEntry } from "@/lib/types";
import { cn } from "@/lib/cn";
import { PlusIcon } from "@/components/icons";
import Badge from "@/components/ui/Badge";

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
  onEntryClick?: (entry: TimetableEntry) => void;
  isTeacher?: boolean;
};

export default function TimetableGrid({
  entries,
  onAddSubject,
  onEntryClick,
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
  
  const [activeDay, setActiveDay] = useState<string>(today || "MON");

  const byKey = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    for (const entry of entries) {
      map.set(`${entry.day}-${entry.period}`, entry);
    }
    return map;
  }, [entries]);

  return (
    <div className="space-y-5">
      {/* Mobile Day Selector */}
      <div className="flex gap-1 overflow-x-auto pb-1 lg:hidden no-scrollbar">
        {days.map((day) => (
          <button
            key={day.key}
            onClick={() => setActiveDay(day.key)}
            className={cn(
              "flex-1 min-w-[70px] px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
              activeDay === day.key 
                ? "bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.3)] scale-105" 
                : "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            )}
          >
            {day.key}
          </button>
        ))}
      </div>

      <div className="space-y-4 lg:hidden">
        {days.filter(d => d.key === activeDay).map((day) => (
          <section key={day.key} className="border border-border bg-white rounded-2xl overflow-hidden shadow-sm">
            <div
              className={cn(
                "flex items-center justify-between border-b border-border px-4 py-3",
                today === day.key ? "bg-indigo-50" : "bg-zinc-50"
              )}
            >
              <h3 className="font-display text-xl tracking-[-0.03em] text-foreground">
                {day.label}
              </h3>
              {today === day.key && (
                 <Badge variant="accent">Today</Badge>
              )}
            </div>
            <div className="divide-y divide-border">
              {periods.map((period) => {
                const entry = byKey.get(`${day.key}-${period}`);
                return (
                  <div
                    key={`${day.key}-${period}`}
                    className="grid grid-cols-[auto_1fr] gap-4 px-4 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] font-black text-zinc-900 shadow-sm">
                      {period}
                    </div>
                    {entry ? (
                      <div
                        onClick={() => onEntryClick?.(entry)}
                        className={cn(
                          "rounded-2xl border p-4 min-w-0 flex-1 shadow-sm",
                          onEntryClick && "cursor-pointer hover:border-[var(--color-primary)] hover:shadow-md transition-all",
                          entry.isSubstitution
                            ? "border-emerald-200 bg-emerald-50/80"
                            : "border-zinc-200 bg-white"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-black text-[14px] text-zinc-900 leading-tight uppercase tracking-tight truncate">
                            {entry.subject}
                          </p>
                          {entry.isSubstitution && (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white">
                              S
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
                          {entry.className}
                          {entry.room ? ` • RM ${entry.room}` : ""}
                        </p>
                      </div>
                    ) : onAddSubject ? (
                      <button
                        type="button"
                        onClick={() => onAddSubject(day.key, period)}
                        className="flex-1 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/30 px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-[var(--color-brand)] transition-all active:scale-[0.98]"
                      >
                        <span>Assign Class</span>
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="flex-1 border border-dashed border-zinc-100 rounded-2xl px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                        Free Slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="hidden border border-border bg-white lg:block shadow-sm rounded-2xl overflow-hidden">
        <div className="w-full">
          {/* Header Row: Periods */}
          <div
            className="grid border-b border-border bg-zinc-50 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500"
            style={{ gridTemplateColumns: "80px repeat(8, minmax(0, 1fr))" }}
          >
            <div className="px-4 py-3.5 flex items-center bg-zinc-100 font-bold border-r border-zinc-200">
              DAY
            </div>
            {periods.map((period) => (
              <div
                key={period}
                className="px-2 py-3.5 text-center border-l border-zinc-200 first:border-l-0"
              >
                P{period}
              </div>
            ))}
          </div>

          {/* Data Rows: Days */}
          {days.map((day) => (
            <div
              key={day.key}
              className="grid border-b border-border last:border-b-0 hover:bg-zinc-50/30 transition-colors"
              style={{ gridTemplateColumns: "80px repeat(8, minmax(0, 1fr))" }}
            >
              {/* Day Label (First Column) */}
              <div
                className={cn(
                  "flex items-center justify-center px-4 py-6 font-black text-[12px] uppercase tracking-wider border-r border-zinc-200",
                  today === day.key ? "bg-[var(--color-brand)] text-white shadow-inner" : "bg-zinc-100 text-zinc-900"
                )}
              >
                {day.key}
              </div>

              {/* Period Cells */}
              {periods.map((period) => {
                const entry = byKey.get(`${day.key}-${period}`);
                return (
                  <div
                    key={`${day.key}-${period}`}
                    className={cn(
                      "border-l border-zinc-200 px-1.5 py-1.5 flex flex-col min-h-[140px]",
                      today === day.key && "bg-[rgba(var(--color-brand-rgb),0.02)]"
                    )}
                  >
                    {entry ? (
                      <div
                        onClick={() => onEntryClick?.(entry)}
                        className={cn(
                          "h-full rounded-xl border p-2.5 transition-all shadow-sm",
                          onEntryClick && "cursor-pointer hover:border-[var(--color-primary)] hover:shadow-md",
                          entry.isSubstitution
                            ? "border-emerald-200 bg-emerald-50/80"
                            : "border-zinc-200 bg-white"
                        )}
                      >
                         <div className="flex items-start justify-between gap-1">
                           <p className="font-extrabold text-[12px] text-zinc-900 leading-none uppercase tracking-tight line-clamp-2">
                             {entry.subject}
                           </p>
                           {entry.isSubstitution && (
                             <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[7px] font-black text-white">
                               S
                             </span>
                           )}
                         </div>
                        
                        <p className="mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                          {entry.className}
                        </p>
                        
                        <div className="mt-auto pt-2 flex items-center justify-between border-t border-zinc-50">
                           <span className="text-[8px] font-black uppercase tracking-tight text-zinc-300 truncate">
                              {entry.room ? `RM ${entry.room}` : "No Rm"}
                           </span>
                        </div>
                      </div>
                    ) : onAddSubject ? (
                      <button
                        type="button"
                        onClick={() => onAddSubject(day.key, period)}
                        className="group flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/10 text-zinc-300 transition-all hover:bg-[rgba(var(--color-brand-rgb),0.05)] hover:text-[var(--color-brand)]"
                      >
                        <PlusIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Assign
                        </span>
                      </button>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-50 bg-zinc-50/5 text-[9px] font-bold uppercase tracking-widest text-zinc-200">
                        -
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
