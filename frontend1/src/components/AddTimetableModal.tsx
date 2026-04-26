"use client";

import { useState, useEffect } from "react";
import Button from "./ui/Button";
import { apiFetch } from "@/lib/api";

interface Teacher {
  id: string;
  name: string;
  subjects: string[];
}

interface AddTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  classId: string;
  className: string;
  slot: { day: string; period: number } | null;
}

export default function AddTimetableModal({
  isOpen,
  onClose,
  onSuccess,
  token,
  classId,
  className,
  slot
}: AddTimetableModalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeachers() {
      if (!isOpen) return;
      try {
        const data = await apiFetch<{ teachers: Teacher[] }>("/api/teachers", {}, token);
        setTeachers(data.teachers);
      } catch (err) {
        console.error("Failed to load teachers", err);
      }
    }
    void loadTeachers();
  }, [isOpen, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot || !selectedTeacherId || !subject) return;

    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/timetables", {
        method: "POST",
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          day: slot.day,
          period: slot.period,
          subject,
          className,
          schoolClassId: classId,
          room
        })
      }, token);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save timetable session");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !slot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-6 shadow-2xl border border-[var(--color-border)] animate-scale-in">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Assign Session</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {slot.day} - Period {slot.period} for {className}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[var(--color-text)] mb-1.5">Teacher</label>
            <select
              required
              value={selectedTeacherId}
              onChange={(e) => {
                const tId = e.target.value;
                setSelectedTeacherId(tId);
                const teacher = teachers.find(t => t.id === tId);
                if (teacher && teacher.subjects.length > 0) {
                  setSubject(teacher.subjects[0]);
                }
              }}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            >
              <option value="">Select a teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[var(--color-text)] mb-1.5">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[var(--color-text)] mb-1.5">Room (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Room 101"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>

          {error && <p className="text-xs text-[var(--color-danger)] font-medium bg-[var(--color-danger-soft)] p-2 rounded">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="neutral" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>Save Session</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
