"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Field, { inputClassName } from "@/components/ui/Field";
import type { Teacher } from "@/lib/types";

type AddSpecialClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
  loading?: boolean;
  teachers: Teacher[];
};

export default function AddSpecialClassModal({
  isOpen,
  onClose,
  onAdd,
  loading = false,
  teachers
}: AddSpecialClassModalProps) {
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [notes, setNotes] = useState("");
  const [substituteTeacherId, setSubstituteTeacherId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSubject("");
    setClassName("");
    setDate(new Date().toISOString().slice(0, 10));
    setFromTime("");
    setToTime("");
    setNotes("");
    setSubstituteTeacherId("");
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        resetForm();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !className.trim() || !date || !fromTime || !toTime) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      await onAdd({
        subject: subject.trim(),
        className: className.trim(),
        date,
        fromTime,
        toTime,
        notes: notes.trim() || undefined,
        substituteTeacherId: substituteTeacherId || undefined,
      });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add special class.");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg border border-border bg-white my-8">
        <div className="border-b border-border bg-background/70 px-6 py-5 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent">
            Add special class
          </p>
          <h2 className="mt-3 font-display text-2xl tracking-[-0.04em] text-foreground">
            Schedule new extra class
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            You can schedule up to one special class per day between Monday and Friday.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
          <div className="grid gap-4">
            <Field label="Subject" htmlFor="sc-subject">
              <input
                id="sc-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Physics Revision"
                className={inputClassName}
              />
            </Field>

            <Field label="Class name" htmlFor="sc-className">
              <input
                id="sc-className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="12th Grade"
                className={inputClassName}
              />
            </Field>

            <Field label="Date" htmlFor="sc-date">
              <input
                id="sc-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClassName}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="From Time" htmlFor="sc-from">
                <input
                  id="sc-from"
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field label="To Time" htmlFor="sc-to">
                <input
                  id="sc-to"
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field label="Notes" htmlFor="sc-notes" hint="Optional">
              <input
                id="sc-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Exam prep..."
                className={inputClassName}
              />
            </Field>

            <Field label="Requested Substitute" htmlFor="sc-sub" hint="Optional">
              <select
                id="sc-sub"
                value={substituteTeacherId}
                onChange={(e) => setSubstituteTeacherId(e.target.value)}
                className={inputClassName}
              >
                <option value="">None</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? "Saving..." : "Schedule class"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
