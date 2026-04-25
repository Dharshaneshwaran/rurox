"use client";

import { useCallback, useEffect, useState } from "react";
import StudentLayout from "@/components/StudentLayout";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import { BookIcon, CalendarIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface ExamResult {
  id: string;
  marksObtained: number;
  grade: string;
  createdAt: string;
  exam: {
    id: string;
    name: string;
    className: string;
    subject: string;
    maxMarks: number;
    examDate: string;
  };
}

function gradeColor(grade: string) {
  if (grade === "A1") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (grade === "A2") return "text-green-600 bg-green-50 border-green-200";
  if (grade === "B1") return "text-blue-600 bg-blue-50 border-blue-200";
  if (grade === "B2") return "text-sky-600 bg-sky-50 border-sky-200";
  if (grade === "C1") return "text-amber-600 bg-amber-50 border-amber-200";
  if (grade === "C2") return "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (grade === "D") return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function gradeLabel(grade: string) {
  const labels: Record<string, string> = {
    A1: "Excellent", A2: "Very Good", B1: "Good", B2: "Above Average",
    C1: "Average", C2: "Below Average", D: "Needs Improvement", E: "Fail",
  };
  return labels[grade] ?? grade;
}

export default function StudentReportCardPage() {
  const { token, loading } = useAuth({ role: "STUDENT", redirectTo: "/student/login" });
  const [results, setResults] = useState<ExamResult[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    if (!token) return;
    setPageLoading(true);
    try {
      const data = await apiFetch<ExamResult[]>("/api/exams/my-results", {}, token);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results");
    } finally {
      setPageLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) void loadResults();
  }, [loading, loadResults]);

  if (loading) return null;

  // Stats
  const totalExams = results.length;
  const avgPercentage = totalExams > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.marksObtained / r.exam.maxMarks) * 100, 0) / totalExams)
    : 0;
  const bestGrade = results.find((r) => r.grade === "A1")
    ? "A1" : results.find((r) => r.grade === "A2")
    ? "A2" : results[0]?.grade ?? "—";

  // Group by subject
  const bySubject = results.reduce((acc, r) => {
    if (!acc[r.exam.subject]) acc[r.exam.subject] = [];
    acc[r.exam.subject].push(r);
    return acc;
  }, {} as Record<string, ExamResult[]>);

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <PageHeader
          eyebrow="Student workspace"
          title="My Report Card"
          description="View your examination results and CBSE grade performance across all subjects."
          meta={
            <>
              <Badge variant="accent">{totalExams} exams</Badge>
              <Badge variant={avgPercentage >= 75 ? "success" : "warning"}>{avgPercentage}% avg</Badge>
            </>
          }
        />

        {error && <div className="mt-4 rounded-xl border border-danger/40 bg-danger-soft/30 p-3 text-sm text-danger">{error}</div>}

        {/* Summary Stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total Exams"
            value={String(totalExams)}
            detail="Exams you have appeared in"
            icon={<BookIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Average Score"
            value={`${avgPercentage}%`}
            detail="Overall performance average"
            tone={avgPercentage >= 75 ? "success" : "accent"}
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Best Grade"
            value={bestGrade}
            detail={gradeLabel(bestGrade)}
            tone={bestGrade === "A1" || bestGrade === "A2" ? "success" : "accent"}
            icon={<BookIcon className="h-5 w-5" />}
          />
        </div>

        {/* Results by Subject */}
        <div className="mt-6 space-y-6">
          {pageLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading your results...</div>
          ) : results.length === 0 ? (
            <SectionCard title="No Results Yet" subtitle="Your exam results will appear here once your teacher enters marks.">
              <div className="py-10 text-center text-sm text-muted-foreground">
                Check back after your exams are graded.
              </div>
            </SectionCard>
          ) : (
            Object.entries(bySubject).map(([subject, subjectResults]) => {
              const subjectAvg = Math.round(
                subjectResults.reduce((s, r) => s + (r.marksObtained / r.exam.maxMarks) * 100, 0) / subjectResults.length
              );
              return (
                <SectionCard
                  key={subject}
                  title={subject}
                  subtitle={`${subjectResults.length} exam(s) · Average: ${subjectAvg}%`}
                >
                  <div className="space-y-3">
                    {subjectResults.map((result) => {
                      const percentage = Math.round((result.marksObtained / result.exam.maxMarks) * 100);
                      return (
                        <div
                          key={result.id}
                          className="flex flex-col gap-3 rounded-[18px] border border-border bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-sm text-foreground">{result.exam.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {new Date(result.exam.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-lg text-foreground">{result.marksObtained}<span className="text-xs text-muted-foreground">/{result.exam.maxMarks}</span></p>
                              <p className="text-xs text-muted-foreground">{percentage}%</p>
                            </div>
                            {/* Progress bar */}
                            <div className="w-24 hidden sm:block">
                              <div className="h-2 rounded-full bg-border overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${percentage >= 75 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-sm font-bold ${gradeColor(result.grade)}`}>
                              {result.grade}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              );
            })
          )}
        </div>

        {/* CBSE Grade Scale Reference */}
        <div className="mt-6">
          <SectionCard title="CBSE Grade Scale" subtitle="Reference for understanding your grades.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {[
                { grade: "A1", range: "91-100" }, { grade: "A2", range: "81-90" },
                { grade: "B1", range: "71-80" }, { grade: "B2", range: "61-70" },
                { grade: "C1", range: "51-60" }, { grade: "C2", range: "41-50" },
                { grade: "D", range: "33-40" }, { grade: "E", range: "0-32" },
              ].map(({ grade, range }) => (
                <div key={grade} className={`rounded-xl border p-3 text-center ${gradeColor(grade)}`}>
                  <p className="text-xl font-black">{grade}</p>
                  <p className="text-xs font-medium mt-0.5">{range}%</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </StudentLayout>
  );
}
