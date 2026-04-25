import { useState } from "react";
import Button from "./ui/Button";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; rollNumber: string; className: string; email?: string; password?: string; teacherId?: string }) => Promise<void>;
  loading?: boolean;
  teachers?: Array<{ id: string; name: string }>;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  teachers = [],
}: AddStudentModalProps) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [className, setClassName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherId, setTeacherId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNumber || !className) return;
    await onSubmit({ name, rollNumber, className, email, password, teacherId });
    // Reset form after submit
    setName("");
    setRollNumber("");
    setClassName("");
    setEmail("");
    setPassword("");
    setTeacherId("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border">
        <h2 className="text-xl font-semibold text-foreground">Add New Student</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the student&apos;s details to add them to the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
              required
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label htmlFor="rollNumber" className="block text-sm font-medium text-foreground">
              Roll Number
            </label>
            <input
              type="text"
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
              required
              placeholder="e.g. CS101"
            />
          </div>

          <div>
            <label htmlFor="className" className="block text-sm font-medium text-foreground">
              Class Name
            </label>
            <input
              type="text"
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
              required
              placeholder="e.g. 10th Grade"
            />
          </div>

          <div>
            <label htmlFor="teacherId" className="block text-sm font-medium text-foreground">
              Class Teacher (Optional)
            </label>
            <select
              id="teacherId"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
            >
              <option value="">Select a teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Student Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
                placeholder="student@school.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
                placeholder="Min 6 chars"
                minLength={6}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !name || !rollNumber || !className}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
