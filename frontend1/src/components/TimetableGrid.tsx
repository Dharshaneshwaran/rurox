"use client";

import { useMemo } from "react";
import type { TimetableEntry } from "@/lib/types";

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

export default function TimetableGrid({ entries, onAddSubject, isTeacher = false }: TimetableGridProps) {
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
    <div className="overflow-hidden rounded-2xl border border-zinc-200">
      <div className="grid grid-cols-6 bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <div className="px-4 py-3">Period</div>
        {days.map((day) => (
          <div
            key={day.key}
            className={`px-4 py-3 ${today === day.key ? "text-amber-700" : ""}`}
          >
            {day.label}
          </div>
        ))}
      </div>
      {periods.map((period) => (
        <div
          key={period}
          className="grid grid-cols-6 border-t border-zinc-200 bg-white text-sm"
        >
          <div className="px-4 py-4 font-semibold text-zinc-700">{period}</div>
          {days.map((day) => {
            const entry = byKey.get(`${day.key}-${period}`);
            const isToday = today === day.key;
            return (
              <div
                key={`${day.key}-${period}`}
                className={`px-4 py-4 ${
                  isToday ? "bg-amber-50" : "bg-white"
                }`}
              >
                {entry ? (
                  <div
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      entry.isSubstitution
                        ? "border-amber-500 bg-amber-100"
                        : "border-zinc-200"
                    }`}
                  >
                    <p className="font-semibold text-zinc-900">
                      {entry.subject}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {entry.className}
                      {entry.room ? ` • ${entry.room}` : ""}
                    </p>
                  </div>
                ) : (
                  <>
                    {isTeacher && onAddSubject ? (
                      <button
                        onClick={() => onAddSubject(day.key, period)}
                        className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                      >
                        <span>Free</span>
                        <span className="text-lg leading-none">+</span>
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-400">Free</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
