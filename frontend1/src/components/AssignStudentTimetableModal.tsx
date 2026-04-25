"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { X } from "@/components/icons";

interface AssignStudentTimetableModalProps {
  studentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    day: string;
    period: number;
    subject: string;
    className: string;
    teacher?: string;
    room?: string;
  }) => void;
  loading?: boolean;
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function AssignStudentTimetableModal({
  studentName,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: AssignStudentTimetableModalProps) {
  const [formData, setFormData] = useState({
    day: "MON",
    period: 1,
    subject: "",
    className: "",
    teacher: "",
    room: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.className) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
    setFormData({
      day: "MON",
      period: 1,
      subject: "",
      className: "",
      teacher: "",
      room: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-[24px] border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/10 px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            Assign Timetable - {studentName}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Day *
            </label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="mt-1.5 w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Period *
            </label>
            <select
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: parseInt(e.target.value) })
              }
              className="mt-1.5 w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {PERIODS.map((period) => (
                <option key={period} value={period}>
                  Period {period}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="e.g., Mathematics"
              className="mt-1.5 w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Class Name *
            </label>
            <input
              type="text"
              value={formData.className}
              onChange={(e) =>
                setFormData({ ...formData, className: e.target.value })
              }
              placeholder="e.g., 10-A"
              className="mt-1.5 w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Teacher
            </label>
            <input
              type="text"
              value={formData.teacher}
              onChange={(e) =>
                setFormData({ ...formData, teacher: e.target.value })
              }
              placeholder="Teacher name (optional)"
              className="mt-1.5 w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Room
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) =>
                setFormData({ ...formData, room: e.target.value })
              }
              placeholder="Room number (optional)"
              className="mt-1.5 w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
