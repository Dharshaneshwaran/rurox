"use client";

import { useCallback, useEffect, useState } from "react";

import AdminLayout from "@/components/AdminLayout";
import SubstitutionList from "@/components/SubstitutionList";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { SelectField, TextField } from "@/components/ui/Field";
import MetricCard from "@/components/ui/MetricCard";
import PageHeader from "@/components/ui/PageHeader";
import SurfaceCard from "@/components/ui/SurfaceCard";
import {
  AlertIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  SearchIcon,
  SparklesIcon,
  SwapIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  FullDaySuggestionResponse,
  PeriodSuggestion,
  Substitution,
  Teacher,
} from "@/lib/types";
import { cn } from "@/lib/cn";

const days = ["MON", "TUE", "WED", "THU", "FRI"] as const;

type Step = "select" | "review" | "confirmed";

function StepPill({
  step,
  label,
  active,
  complete,
}: {
  step: string;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition",
        active
          ? "border-[color:color-mix(in_oklab,var(--color-brand)_18%,white)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
          : complete
            ? "border-[color:color-mix(in_oklab,var(--color-success)_18%,white)] bg-[color:color-mix(in_oklab,var(--color-success)_9%,white)] text-[var(--color-success)]"
            : "border-[var(--color-stroke)] bg-white text-[var(--color-text-muted)]"
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold">
        {step}
      </span>
      <span>{label}</span>
    </div>
  );
}

function SuggestionStatus({
  hasSubstitute,
  hasCandidates,
}: {
  hasSubstitute: boolean;
  hasCandidates: boolean;
}) {
  if (hasSubstitute) {
    return <Badge tone="success">Ready</Badge>;
  }

  if (!hasCandidates) {
    return <Badge tone="danger">No substitute</Badge>;
  }

  return <Badge tone="warning">Skipped</Badge>;
}

function PeriodReviewCard({
  suggestion,
  assignment,
  onChange,
}: {
  suggestion: PeriodSuggestion;
  assignment?: string;
  onChange: (teacherId: string) => void;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--color-stroke)] bg-white px-5 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">Period {suggestion.period}</Badge>
            <SuggestionStatus
              hasSubstitute={Boolean(assignment)}
              hasCandidates={suggestion.allCandidates.length > 0}
            />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            {suggestion.className}
          </h3>
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">
            {suggestion.subject}
            {suggestion.room ? ` • ${suggestion.room}` : ""}
          </p>
        </div>

        {suggestion.allCandidates.length > 0 ? (
          <select
            className="w-full rounded-[20px] border border-[var(--color-stroke)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--color-brand)_12%,white)] lg:max-w-sm"
            value={assignment || ""}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="">Skip this period</option>
            {suggestion.allCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
                {candidate.subjectMatch ? " • subject match" : ""}
                {` • load ${candidate.workload}`}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-medium text-[var(--color-danger)]">
            No available teachers
          </p>
        )}
      </div>
    </div>
  );
}

export default function SubstitutionManagementPage() {
  const { token, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [step, setStep] = useState<Step>("select");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [suggestions, setSuggestions] = useState<FullDaySuggestionResponse | null>(null);
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [subLoadingId, setSubLoadingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualForm, setManualForm] = useState({
    absentTeacherId: "",
    replacementTeacherId: "",
    day: "MON",
    period: 1,
    date: new Date().toISOString().slice(0, 10),
  });
  const [autoForm, setAutoForm] = useState({
    absentTeacherId: "",
    day: "MON",
    period: 1,
    date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const [teacherData, substitutionData] = await Promise.all([
        apiFetch<{ teachers: Teacher[] }>("/api/teachers", {}, token),
        apiFetch<{ substitutions: Substitution[] }>("/api/substitutions", {}, token),
      ]);
      setTeachers(teacherData.teachers);
      setSubstitutions(substitutionData.substitutions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void loadData();
    }
  }, [loading, loadData]);

  const handleFindSubstitutes = async () => {
    if (!token || !selectedTeacherId || !selectedDate) {
      return;
    }

    setError(null);
    setLoadingSuggestions(true);

    try {
      const result = await apiFetch<FullDaySuggestionResponse>(
        "/api/substitutions/suggest-full-day",
        {
          method: "POST",
          body: JSON.stringify({
            absentTeacherId: selectedTeacherId,
            date: selectedDate,
          }),
        },
        token
      );

      setSuggestions(result);
      const initial: Record<number, string> = {};
      result.suggestions.forEach((suggestion) => {
        if (suggestion.suggestedTeacher) {
          initial[suggestion.period] = suggestion.suggestedTeacher.id;
        }
      });
      setAssignments(initial);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleConfirmAll = async () => {
    if (!token || !suggestions) {
      return;
    }

    setError(null);
    setConfirmingAll(true);

    try {
      const assignmentList = Object.entries(assignments)
        .filter(([, teacherId]) => teacherId)
        .map(([period, teacherId]) => ({
          period: Number(period),
          replacementTeacherId: teacherId,
        }));

      if (assignmentList.length === 0) {
        setError("No assignments selected");
        return;
      }

      const result = await apiFetch<{ count: number }>(
        "/api/substitutions/confirm-full-day",
        {
          method: "POST",
          body: JSON.stringify({
            absentTeacherId: suggestions.absentTeacher.id,
            date: suggestions.date,
            assignments: assignmentList,
          }),
        },
        token
      );

      setConfirmedCount(result.count);
      setStep("confirmed");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm");
    } finally {
      setConfirmingAll(false);
    }
  };

  const handleReset = () => {
    setStep("select");
    setSuggestions(null);
    setAssignments({});
    setConfirmedCount(0);
    setSelectedTeacherId("");
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setError(null);
  };

  const handleManual = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError(null);

    try {
      await apiFetch(
        "/api/substitutions/manual",
        { method: "POST", body: JSON.stringify(manualForm) },
        token
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manual assignment failed");
    }
  };

  const handleAuto = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError(null);

    try {
      await apiFetch(
        "/api/substitutions/auto",
        { method: "POST", body: JSON.stringify(autoForm) },
        token
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto assignment failed");
    }
  };

  const handleMarkPresent = async () => {
    if (!token || !selectedTeacherId || !selectedDate) return;
    
    const confirm = window.confirm("Are you sure? This will cancel all scheduled substitutions for this teacher on this day.");
    if (!confirm) return;

    setLoadingSuggestions(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/substitutions/teacher/${selectedTeacherId}/date/${selectedDate}`, {
        method: "DELETE",
      }, token) as { count?: number };
      
      handleReset();
      await loadData();
      alert(`Teacher marked as present. ${response.count || 0} substitutions canceled.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark present");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCleanup = async () => {
    if (!token) return;
    
    const confirm = window.confirm("Cleanup will delete all past substitution records. Proceed?");
    if (!confirm) return;

    try {
      const response = await apiFetch("/api/substitutions/cleanup", { method: "DELETE" }, token) as { count?: number };
      await loadData();
      alert(`Cleanup complete. Deleted ${response.count || 0} old records.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cleanup failed");
    }
  };

  const handleApproveRejection = async (id: string) => {
    if (!token) return;
    setSubLoadingId(id);
    try {
      await apiFetch(`/api/substitutions/${id}/approve-rejection`, { method: "POST" }, token);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reassign substitute");
    } finally {
      setSubLoadingId(null);
    }
  };

  const handleDeleteSubstitution = async (id: string) => {
    if (!token) return;
    
    if (!window.confirm("Delete this substitution record?")) return;

    setSubLoadingId(id);
    try {
      await apiFetch(`/api/substitutions/${id}`, { method: "DELETE" }, token);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete substitution");
    } finally {
      setSubLoadingId(null);
    }
  };

  const selectedTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId);
  const assignedCount = Object.values(assignments).filter(Boolean).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center px-6 py-12 text-sm text-[var(--color-text-muted)]">
          Loading substitutions...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageHeader
          kicker="Substitution management"
          title="Coordinate full-day absences and period coverage"
          description="Run the complete substitution workflow from teacher selection to confirmed assignments, then use the advanced tools for manual or single-period overrides."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Teachers available"
            value={teachers.length.toString()}
            detail="Total teachers currently available for substitution matching."
            badge="Roster"
            badgeTone="brand"
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <MetricCard
            label="Recent substitutions"
            value={substitutions.length.toString()}
            detail="All substitution records currently tracked by the system."
            badge="Live updates"
            badgeTone="success"
            icon={<SwapIcon className="h-5 w-5" />}
          />
          <MetricCard
            label="Assignments selected"
            value={assignedCount.toString()}
            detail="Current assignments selected in the active full-day review step."
            badge="Wizard state"
            badgeTone="warning"
            icon={<SparklesIcon className="h-5 w-5" />}
          />
        </div>

        {error ? (
          <SurfaceCard className="border border-[color:color-mix(in_oklab,var(--color-danger)_18%,white)] bg-[color:color-mix(in_oklab,var(--color-danger)_9%,white)] px-5 py-4 text-sm text-[var(--color-danger)]">
            {error}
          </SurfaceCard>
        ) : null}

        <SurfaceCard className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <StepPill step="1" label="Select absence" active={step === "select"} complete={step !== "select"} />
              <StepPill step="2" label="Review coverage" active={step === "review"} complete={step === "confirmed"} />
              <StepPill step="3" label="Confirm" active={step === "confirmed"} complete={false} />
            </div>

            {step === "select" ? (
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <SurfaceCard className="bg-[var(--color-panel-muted)]/50 border-dashed border-[var(--color-stroke)] p-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <SelectField
                        label="Absent teacher"
                        value={selectedTeacherId}
                        onChange={(event) => setSelectedTeacherId(event.target.value)}
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name} • {teacher.subjects.join(", ")}
                          </option>
                        ))}
                      </SelectField>

                      <TextField
                        label="Date of absence"
                        type="date"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                      />
                    </div>
                  </SurfaceCard>
                </div>

                <div className="lg:col-span-4">
                  <div className="h-full rounded-[28px] bg-zinc-950 p-6 text-white shadow-xl ring-1 ring-white/10">
                    <div className="flex flex-col h-full justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Selection Engine</span>
                        </div>
                        <h2 className="text-lg font-black leading-tight tracking-tight">
                          Orchestrate Coverage
                        </h2>
                        <p className="text-[13px] font-medium leading-relaxed text-zinc-400">
                          Select the absent teacher and date to generate optimized matchings based on workload and subject expertise.
                        </p>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <Button
                          className="w-full"
                          size="lg"
                          disabled={!selectedTeacherId || !selectedDate || loadingSuggestions}
                          icon={<SearchIcon className="h-4 w-4" />}
                          onClick={handleFindSubstitutes}
                        >
                          {loadingSuggestions ? "Analyzing..." : "Find candidates"}
                        </Button>
                        <button
                          disabled={!selectedTeacherId || !selectedDate || loadingSuggestions}
                          onClick={handleMarkPresent}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:opacity-30"
                        >
                          Mark as present
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === "review" && suggestions ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">{suggestions.absentTeacher.name}</Badge>
                      <Badge tone="default">
                        {new Date(suggestions.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-[var(--color-text)]">
                      Review suggested coverage
                    </h2>
                    <p className="text-[14px] font-medium leading-relaxed text-zinc-500">
                      Verify selected teachers for each period before confirming the entire day.
                    </p>
                  </div>
                  <Button variant="secondary" size="md" onClick={handleReset} className="font-black text-[10px] uppercase tracking-widest">
                    Switch Teacher
                  </Button>
                </div>

                {suggestions.suggestions.length === 0 ? (
                  <EmptyState
                    title="No classes found for this day"
                    description={
                      suggestions.message ||
                      "The selected teacher has no timetable entries on the chosen day."
                    }
                    action={
                      <Button variant="secondary" onClick={handleReset}>
                        Choose another teacher
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <div className="hidden overflow-hidden rounded-[28px] border border-[var(--color-stroke)] bg-white lg:block shadow-sm">
                      <div className="grid grid-cols-[84px_1fr_1fr_1fr_1.35fr_140px] items-center border-b border-[var(--color-stroke)] bg-zinc-50 px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        <span>Period</span>
                        <span>Classroom</span>
                        <span>Subject</span>
                        <span>Location</span>
                        <span>Substitute Selection</span>
                        <span className="text-center">Selection</span>
                      </div>
                      {suggestions.suggestions.map((suggestion) => {
                        const assignment = assignments[suggestion.period];

                        return (
                          <div
                            key={suggestion.period}
                            className="grid grid-cols-[84px_1fr_1fr_1fr_1.35fr_140px] items-center border-b border-[var(--color-stroke)] px-5 py-4 last:border-b-0"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-sm font-semibold text-[var(--color-brand)]">
                              {suggestion.period}
                            </span>
                            <span className="pr-4 text-sm font-semibold text-[var(--color-text)]">
                              {suggestion.className}
                            </span>
                            <span className="pr-4 text-sm text-[var(--color-text-muted)]">
                              {suggestion.subject}
                            </span>
                            <span className="pr-4 text-sm text-[var(--color-text-muted)]">
                              {suggestion.room || "—"}
                            </span>
                            <div className="pr-4">
                              {suggestion.allCandidates.length > 0 ? (
                                <select
                                  className="w-full rounded-[18px] border border-[var(--color-stroke)] bg-[var(--color-panel)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--color-brand)_12%,white)]"
                                  value={assignment || ""}
                                  onChange={(event) =>
                                    setAssignments((current) => ({
                                      ...current,
                                      [suggestion.period]: event.target.value,
                                    }))
                                  }
                                >
                                  <option value="">Skip this period</option>
                                  {suggestion.allCandidates.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id}>
                                      {candidate.name}
                                      {candidate.subjectMatch ? " • subject match" : ""}
                                      {` • load ${candidate.workload}`}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm text-[var(--color-danger)]">
                                  No teachers available
                                </span>
                              )}
                            </div>
                            <SuggestionStatus
                              hasSubstitute={Boolean(assignment)}
                              hasCandidates={suggestion.allCandidates.length > 0}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 lg:hidden">
                      {suggestions.suggestions.map((suggestion) => (
                        <PeriodReviewCard
                          key={suggestion.period}
                          suggestion={suggestion}
                          assignment={assignments[suggestion.period]}
                          onChange={(teacherId) =>
                            setAssignments((current) => ({
                              ...current,
                              [suggestion.period]: teacherId,
                            }))
                          }
                        />
                      ))}
                    </div>

                    <SurfaceCard className="bg-[var(--color-panel-muted)] px-5 py-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-3">
                          <Badge tone="brand">
                            {suggestions.suggestions.length} periods to cover
                          </Badge>
                          <Badge tone="success">{assignedCount} assigned</Badge>
                          <Badge tone="warning">
                            {suggestions.suggestions.length - assignedCount} skipped
                          </Badge>
                        </div>
                        <Button
                          size="lg"
                          disabled={confirmingAll || assignedCount === 0}
                          onClick={handleConfirmAll}
                        >
                          {confirmingAll
                            ? "Confirming..."
                            : `Confirm ${assignedCount} assignment${assignedCount === 1 ? "" : "s"}`}
                        </Button>
                      </div>
                    </SurfaceCard>
                  </>
                )}
              </div>
            ) : null}

            {step === "confirmed" ? (
              <div className="mx-auto max-w-2xl py-12 px-6">
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-950 text-white shadow-2xl ring-1 ring-white/10">
                    <CheckCircleIcon className="h-10 w-10" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tight text-[var(--color-text)]">
                      Coverage Orchestrated
                    </h2>
                    <p className="text-[15px] font-bold leading-relaxed text-zinc-500">
                      Successfully assigned {confirmedCount} substitution{confirmedCount === 1 ? "" : "s"} for{" "}
                      <span className="text-zinc-900 font-black">
                        {selectedTeacher?.name || "the selected teacher"}
                      </span>.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row pt-6">
                    <Button size="lg" onClick={handleReset} className="min-w-[200px] shadow-lg">
                      Start new session
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
                    Recent substitutions
                  </h2>
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    Monitor the latest substitution activity across the system.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCleanup} className="text-xs text-red-500 hover:text-red-600">
                   Cleanup old records
                </Button>
              </div>
            <SubstitutionList
              substitutions={substitutions}
              isAdmin={true}
              onApproveRejection={handleApproveRejection}
              onDelete={handleDeleteSubstitution}
              loadingId={subLoadingId}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="px-5 py-5 sm:px-6 sm:py-6">
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div className="space-y-1">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
                Advanced period-level tools
              </h2>
              <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                Use manual or single-period auto assignment when the full-day flow is more than you need.
              </p>
            </div>
            <ChevronDownIcon
              className={cn(
                "h-5 w-5 text-[var(--color-text-soft)] transition",
                showAdvanced && "rotate-180"
              )}
            />
          </button>

          {showAdvanced ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SurfaceCard className="bg-[var(--color-panel-muted)] px-5 py-5">
                <form onSubmit={handleManual} className="space-y-4">
                  <div className="space-y-1">
                    <Badge tone="brand">Manual substitution</Badge>
                    <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                      Explicitly choose the absent teacher, replacement, day, and
                      period.
                    </p>
                  </div>
                  <SelectField
                    label="Absent teacher"
                    value={manualForm.absentTeacherId}
                    onChange={(event) =>
                      setManualForm((current) => ({
                        ...current,
                        absentTeacherId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Replacement teacher"
                    value={manualForm.replacementTeacherId}
                    onChange={(event) =>
                      setManualForm((current) => ({
                        ...current,
                        replacementTeacherId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select replacement</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </SelectField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      label="Day"
                      value={manualForm.day}
                      onChange={(event) =>
                        setManualForm((current) => ({
                          ...current,
                          day: event.target.value,
                        }))
                      }
                    >
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </SelectField>
                    <TextField
                      label="Period"
                      type="number"
                      min={1}
                      max={8}
                      value={String(manualForm.period)}
                      onChange={(event) =>
                        setManualForm((current) => ({
                          ...current,
                          period: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <TextField
                    label="Date"
                    type="date"
                    value={manualForm.date}
                    onChange={(event) =>
                      setManualForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />
                  <Button type="submit" className="w-full">
                    Assign manually
                  </Button>
                </form>
              </SurfaceCard>

              <SurfaceCard className="bg-[var(--color-panel-muted)] px-5 py-5">
                <form onSubmit={handleAuto} className="space-y-4">
                  <div className="space-y-1">
                    <Badge tone="warning">Auto assign</Badge>
                    <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                      Request a single-period recommendation without running the
                      full-day wizard.
                    </p>
                  </div>
                  <SelectField
                    label="Absent teacher"
                    value={autoForm.absentTeacherId}
                    onChange={(event) =>
                      setAutoForm((current) => ({
                        ...current,
                        absentTeacherId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </SelectField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      label="Day"
                      value={autoForm.day}
                      onChange={(event) =>
                        setAutoForm((current) => ({
                          ...current,
                          day: event.target.value,
                        }))
                      }
                    >
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </SelectField>
                    <TextField
                      label="Period"
                      type="number"
                      min={1}
                      max={8}
                      value={String(autoForm.period)}
                      onChange={(event) =>
                        setAutoForm((current) => ({
                          ...current,
                          period: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <TextField
                    label="Date"
                    type="date"
                    value={autoForm.date}
                    onChange={(event) =>
                      setAutoForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />
                  <Button type="submit" variant="secondary" className="w-full">
                    Auto-assign this period
                  </Button>
                </form>
              </SurfaceCard>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Advanced tools are collapsed"
                description="Expand this section when you need manual overrides or single-period auto assignment."
                action={
                  <Button
                    variant="secondary"
                    icon={<AlertIcon className="h-4 w-4" />}
                    onClick={() => setShowAdvanced(true)}
                  >
                    Open advanced tools
                  </Button>
                }
              />
            </div>
          )}
        </SurfaceCard>
      </div>
    </AdminLayout>
  );
}
