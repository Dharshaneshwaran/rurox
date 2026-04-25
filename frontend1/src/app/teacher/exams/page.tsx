"use client";

import { useCallback, useEffect, useState } from "react";
import TeacherLayout from "@/components/TeacherLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface Exam {
  id: string;
  name: string;
  className: string;
  subject: string;
  maxMarks: number;
  examDate: string;
  _count?: { results: number };
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface ExamWithStudents {
  exam: Exam;
  students: Student[];
  submittedIds: string[];
}

export default function TeacherExamsPage() {
  const { token, loading } = useAuth({ role: "TEACHER", redirectTo: "/teacher/login" });
  const [exams, setExams] = useState<Exam[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create exam form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", className: "", subject: "", maxMarks: 100, examDate: "" });
  const [submitting, setSubmitting] = useState(false);

  // Marks entry
  const [marksExam, setMarksExam] = useState<ExamWithStudents | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [savingMarks, setSavingMarks] = useState(false);

  const loadExams = useCallback(async () => {
    if (!token) return;
    setPageLoading(true);
    try {
      const data = await apiFetch<Exam[]>("/api/exams", {}, token);
      setExams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exams");
    } finally {
      setPageLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) void loadExams();
  }, [loading, loadExams]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/exams", { method: "POST", body: JSON.stringify(formData) }, token);
      setShowForm(false);
      setFormData({ name: "", className: "", subject: "", maxMarks: 100, examDate: "" });
      setSuccess("Exam created successfully.");
      await loadExams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create exam");
    } finally {
      setSubmitting(false);
    }
  };

  const openMarksEntry = async (examId: string) => {
    if (!token) return;
    setError(null);
    try {
      const data = await apiFetch<ExamWithStudents>(`/api/exams/${examId}/enter-marks`, {}, token);
      setMarksExam(data);
      // Pre-fill existing marks with empty string
      const prefilled: Record<string, string> = {};
      data.students.forEach((s) => { prefilled[s.id] = ""; });
      setMarks(prefilled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    }
  };

  const handleSaveMarks = async () => {
    if (!token || !marksExam) return;
    setSavingMarks(true);
    setError(null);
    try {
      const results = Object.entries(marks)
        .filter(([, v]) => v !== "")
        .map(([studentId, v]) => ({ studentId, marksObtained: parseInt(v, 10) }));

      await apiFetch(`/api/exams/${marksExam.exam.id}/results`, {
        method: "POST",
        body: JSON.stringify({ results }),
      }, token);
      setSuccess("Marks saved successfully.");
      setMarksExam(null);
      await loadExams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save marks");
    } finally {
      setSavingMarks(false);
    }
  };

  function gradeColor(grade: string) {
    if (grade === "A1" || grade === "A2") return "text-emerald-600";
    if (grade === "B1" || grade === "B2") return "text-blue-600";
    if (grade === "C1" || grade === "C2") return "text-amber-600";
    if (grade === "D") return "text-orange-600";
    return "text-red-600";
  }

  function calcGrade(marks: number, max: number) {
    const p = (marks / max) * 100;
    if (p >= 91) return "A1";
    if (p >= 81) return "A2";
    if (p >= 71) return "B1";
    if (p >= 61) return "B2";
    if (p >= 51) return "C1";
    if (p >= 41) return "C2";
    if (p >= 33) return "D";
    return "E";
  }

  if (loading) return null;

  // Marks entry panel
  if (marksExam) {
    return (
      <TeacherLayout>
        <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <PageHeader
            eyebrow="Exam Management"
            title={`Enter Marks: ${marksExam.exam.name}`}
            description={`${marksExam.exam.subject} · Class ${marksExam.exam.className} · Max: ${marksExam.exam.maxMarks}`}
            meta={<Badge variant="accent">{marksExam.students.length} students</Badge>}
            actions={
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setMarksExam(null)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveMarks} disabled={savingMarks}>
                  {savingMarks ? "Saving..." : "Save All Marks"}
                </Button>
              </div>
            }
          />
          {error && <div className="mt-4 rounded-xl border border-danger/40 bg-danger-soft/30 p-3 text-sm text-danger">{error}</div>}
          <div className="mt-6">
            <SectionCard title="Student Mark Sheet" subtitle="Enter marks for each student. Grade is auto-calculated.">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Roll No.</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3 w-32">Marks / {marksExam.exam.maxMarks}</th>
                      <th className="px-4 py-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {marksExam.students.map((s) => {
                      const val = marks[s.id] ?? "";
                      const numVal = parseInt(val, 10);
                      const grade = val !== "" && !isNaN(numVal) ? calcGrade(numVal, marksExam.exam.maxMarks) : "—";
                      return (
                        <tr key={s.id} className="hover:bg-background/60 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.rollNumber}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              max={marksExam.exam.maxMarks}
                              value={val}
                              onChange={(e) => setMarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                              className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
                              placeholder="0"
                            />
                          </td>
                          <td className={`px-4 py-3 font-bold text-base ${gradeColor(grade)}`}>{grade}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Teacher workspace"
          title="Exam Management"
          description="Create exams, enter student marks, and track academic performance."
          meta={<Badge variant="accent">{exams.length} exams</Badge>}
          actions={
            <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cancel" : "+ Create Exam"}
            </Button>
          }
        />

        {error && <div className="mt-4 rounded-xl border border-danger/40 bg-danger-soft/30 p-3 text-sm text-danger">{error}</div>}
        {success && <div className="mt-4 rounded-xl border border-success/40 bg-success-soft/30 p-3 text-sm text-success">{success}</div>}

        {showForm && (
          <div className="mt-6">
            <SectionCard title="Create New Exam" subtitle="Fill in the exam details below.">
              <form onSubmit={handleCreateExam} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam Name</label>
                  <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                    placeholder="e.g. Unit Test 1" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Class</label>
                  <input required value={formData.className} onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                    placeholder="e.g. 10A" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subject</label>
                  <input required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                    placeholder="e.g. Mathematics" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Max Marks</label>
                  <input required type="number" min={1} value={formData.maxMarks} onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Exam Date</label>
                  <input required type="date" value={formData.examDate} onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none" />
                </div>
                <div className="flex items-end">
                  <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                    {submitting ? "Creating..." : "Create Exam"}
                  </Button>
                </div>
              </form>
            </SectionCard>
          </div>
        )}

        <div className="mt-6">
          <SectionCard title="All Exams" subtitle="Click 'Enter Marks' to input student marks for any exam.">
            {pageLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading exams...</div>
            ) : exams.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No exams created yet. Create your first exam above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Exam Name</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Max</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-background/60 transition-colors">
                        <td className="px-4 py-4 font-medium text-foreground">{exam.name}</td>
                        <td className="px-4 py-4"><Badge variant="neutral">{exam.className}</Badge></td>
                        <td className="px-4 py-4 text-muted-foreground">{exam.subject}</td>
                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {new Date(exam.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs">{exam.maxMarks}</td>
                        <td className="px-4 py-4">
                          <Button variant="accent" size="sm" onClick={() => openMarksEntry(exam.id)}>
                            Enter Marks
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </TeacherLayout>
  );
}
