"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!isOpen) {
      setSubject("");
      setClassName("");
      setRoom("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!className.trim()) {
      setError("Class name is required");
      return;
    }
    try {
      await onAdd(subject.trim(), className.trim(), room.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add subject");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-zinc-900">
          Add Subject - {day} Period {period}
        </h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Class Name
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. 10A"
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Room (Optional)
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. 101"
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
