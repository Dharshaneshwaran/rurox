"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Field, { inputClassName } from "@/components/ui/Field";

type AddSubjectModalProps = {
  isOpen: boolean;
  day: string;
  period: number;
  onClose: () => void;
  onAdd: (subject: string, className: string, room: string) => Promise<void>;
  loading?: boolean;
};

export default function AddSubjectModal({
  isOpen,
  day,
  period,
  onClose,
  onAdd,
  loading = false,
}: AddSubjectModalProps) {
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSubject("");
    setClassName("");
    setRoom("");
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
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!className.trim()) {
      setError("Class name is required.");
      return;
    }

    try {
      await onAdd(subject.trim(), className.trim(), room.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add subject.");
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0"
        onClick={loading ? undefined : handleClose}
      />

      <div className="relative w-full max-w-lg border border-border bg-white">
        <div className="border-b border-border bg-background/70 px-6 py-5 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent">
            Add schedule item
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-[-0.04em] text-foreground">
            {day} / Period {period}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Fill the open slot with a subject, class, and optional room.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
          <div className="grid gap-4">
            <Field label="Subject" htmlFor="subject">
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Mathematics"
                className={inputClassName}
              />
            </Field>

            <Field label="Class name" htmlFor="className">
              <input
                id="className"
                type="text"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="10A"
                className={inputClassName}
              />
            </Field>

            <Field label="Room" htmlFor="room" hint="Optional">
              <input
                id="room"
                type="text"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="101"
                className={inputClassName}
              />
            </Field>
          </div>

          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? "Saving..." : "Add subject"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
