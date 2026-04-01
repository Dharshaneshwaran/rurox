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
        "flex flex-1 items-center gap-3 border px-6 py-4 transition-all duration-500 relative overflow-hidden",
        active
          ? "border-primary/30 bg-primary/10 text-white"
          : complete
            ? "border-white/10 bg-white/5 text-slate-300"
            : "border-white/5 bg-transparent text-slate-600"
      )}
    >
      {active && <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_#3b82f6]" />}
      <span className={cn(
        "flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black transition-colors",
        active ? "bg-primary text-white" : "bg-white/5 text-slate-500"
      )}>
        {step}
      </span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
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
    <div className="card-reveal group p-8 relative overflow-hidden">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {suggestion.isSpecial ? (
              <Badge variant="warning" className="scale-90 origin-left">Special: {suggestion.time}</Badge>
            ) : (
              <Badge variant="accent" className="scale-90 origin-left italic">Period {suggestion.period}</Badge>
            )}
            <SuggestionStatus
              hasSubstitute={Boolean(assignment)}
              hasCandidates={suggestion.allCandidates.length > 0}
            />
          </div>
          <div>
            <h3 className="text-[20px] font-black tracking-tighter text-white italic">
               {suggestion.className}
            </h3>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1">
               {suggestion.subject}
               {suggestion.room ? ` // ${suggestion.room}` : ""}
            </p>
          </div>
        </div>

        {suggestion.allCandidates.length > 0 ? (
          <select
            className="w-full lg:w-72 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] font-black text-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            value={assignment || ""}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="" className="bg-[#020617]">SKIP SECTOR COVER</option>
            {suggestion.allCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id} className="bg-[#020617]">
                {candidate.name.toUpperCase()}
                {candidate.subjectMatch ? " // MATCH" : ""}
                {` // LOAD: ${candidate.workload}`}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/5 px-4 py-3 rounded-2xl border border-red-500/10">
            <AlertIcon className="h-4 w-4" />
            No candidates registered
          </div>
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
  const [assignments, setAssignments] = useState<Record<string, string>>({});
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
      const initial: Record<string, string> = {};
      result.suggestions.forEach((suggestion) => {
        if (suggestion.suggestedTeacher) {
          const key = suggestion.isSpecial ? `special-${suggestion.specialClassId}` : `period-${suggestion.period}`;
          initial[key] = suggestion.suggestedTeacher.id;
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
        .map(([key, teacherId]) => {
          if (key.startsWith("period-")) {
            return {
              period: Number(key.replace("period-", "")),
              replacementTeacherId: teacherId,
            };
          } else {
            return {
              specialClassId: key.replace("special-", ""),
              replacementTeacherId: teacherId,
            };
          }
        });

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
    
    const confirm = window.confirm("Cleanup will delete all substitution records. Proceed?");
    if (!confirm) return;

    try {
      const response = await apiFetch("/api/substitutions/cleanup", { method: "DELETE" }, token) as { count?: number };
      await loadData();
      alert(`Cleanup complete. Deleted ${response.count || 0} records.`);
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
          variant="command"
          backgroundImage="/substitution.png"
          kicker="Substitution Management"
          title="Coordinate Absences & Coverage"
          description="Identify coverage gaps, analyze workloads, and deploy optimized substitutions from the centralized orchestrator hub."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            backgroundImage="/teacher.png"
            label="Teachers available"
            value={teachers.length.toString()}
            detail="Active teacher roster synchronized."
            badge="Roster"
            badgeTone="brand"
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <MetricCard
            backgroundImage="/teacher_2.png"
            label="Recent substitutions"
            value={substitutions.length.toString()}
            detail="Substitutions tracked by system."
            badge="Live updates"
            badgeTone="success"
            icon={<SwapIcon className="h-5 w-5" />}
          />
          <MetricCard
            backgroundImage="/substitution.png"
            label="Assignments selected"
            value={assignedCount.toString()}
            detail="Assignments in active session."
            badge="Wizard state"
            badgeTone="warning"
            icon={<SparklesIcon className="h-5 w-5" />}
          />
        </div>

        {error ? (
          <SurfaceCard className="border border-danger/30 bg-danger/5 px-6 py-4 text-[13px] font-black uppercase tracking-widest text-danger">
            SYSTEM ALERT: {error}
          </SurfaceCard>
        ) : null}

        <div className="card-reveal px-8 py-8 sm:px-10 sm:py-10">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <StepPill step="1" label="Select absence" active={step === "select"} complete={step !== "select"} />
              <StepPill step="2" label="Review coverage" active={step === "review"} complete={step === "confirmed"} />
              <StepPill step="3" label="Confirm" active={step === "confirmed"} complete={false} />
            </div>

            {step === "select" ? (
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <SurfaceCard className="bg-white/5 border-dashed border-white/10 p-10">
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

                <div className="lg:col-span-4 translate-y-[-1px]">
                  <div className="relative group overflow-hidden h-full rounded-[32px] bg-zinc-950 p-8 text-white shadow-2xl ring-1 ring-white/10">
                    {/* Integrated Imagery */}
                    <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <div className="h-1 w-1 rounded-full bg-slate-900" />
                           <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">System Ready</span>
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                          Coverage Protocol
                        </h2>
                        <p className="text-[13px] font-medium leading-relaxed text-slate-500">
                          Select the absent teacher and date to initiate the matching algorithm based on real-time availability.
                        </p>
                      </div>
                      
                      <div className="space-y-3 pt-6 border-t border-white/10">
                        <Button
                          className="w-full shadow-2xl"
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
                          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:opacity-30 active:scale-95"
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
                    <div className="hidden overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] lg:block relative backdrop-blur-3xl">
                      <div className="grid grid-cols-[100px_1fr_1fr_1fr_1.5fr_140px] items-center border-b border-white/5 bg-white/5 px-8 py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                        <span>Period</span>
                        <span>Sector</span>
                        <span>Topic</span>
                        <span>Node</span>
                        <span>Deployment</span>
                        <span className="text-center">Status</span>
                      </div>
                      {suggestions.suggestions.map((suggestion) => {
                        const key = suggestion.isSpecial ? `special-${suggestion.specialClassId}` : `period-${suggestion.period}`;
                        const assignment = assignments[key];

                        return (
                          <div
                            key={key}
                            className="grid grid-cols-[100px_1fr_1fr_1fr_1.5fr_140px] items-center border-b border-white/5 px-8 py-6 last:border-b-0 hover:bg-white/[0.01] transition-colors"
                          >
                            <span className={cn(
                              "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-[18px] font-black italic",
                              suggestion.isSpecial ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                            )}>
                              {suggestion.isSpecial ? "S" : suggestion.period}
                            </span>
                            <span className="pr-4 text-[16px] font-black tracking-tighter text-white italic">
                              {suggestion.className}
                            </span>
                            <span className="pr-4 text-[13px] font-bold text-slate-400">
                              {suggestion.subject}
                            </span>
                            <span className="pr-4 text-[11px] font-black uppercase tracking-[0.1em] text-slate-600">
                              {suggestion.isSpecial ? (suggestion.time || "—") : (suggestion.room || "—")}
                            </span>
                            <div className="pr-4">
                              {suggestion.allCandidates.length > 0 ? (
                                <select
                                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] font-black text-slate-300 focus:border-primary transition-all outline-none"
                                  value={assignment || ""}
                                  onChange={(event) =>
                                    setAssignments((current) => ({
                                      ...current,
                                      [key]: event.target.value,
                                    }))
                                  }
                                >
                                  <option value="" className="bg-[#020617]">SKIP SECTOR COVER</option>
                                  {suggestion.allCandidates.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id} className="bg-[#020617]">
                                      {candidate.name.toUpperCase()}
                                      {candidate.subjectMatch ? " // MATCH" : ""}
                                      {` // LOAD: ${candidate.workload}`}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-[11px] font-black uppercase text-red-500/60">
                                  No availability
                                </span>
                              )}
                            </div>
                            <div className="flex justify-center">
                                <SuggestionStatus
                                  hasSubstitute={Boolean(assignment)}
                                  hasCandidates={suggestion.allCandidates.length > 0}
                                />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 lg:hidden">
                      {suggestions.suggestions.map((suggestion) => {
                        const key = suggestion.isSpecial ? `special-${suggestion.specialClassId}` : `period-${suggestion.period}`;
                        return (
                          <PeriodReviewCard
                            key={key}
                            suggestion={suggestion}
                            assignment={assignments[key]}
                            onChange={(teacherId) =>
                              setAssignments((current) => ({
                                ...current,
                                [key]: teacherId,
                              }))
                            }
                          />
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-6 lg:items-center py-6">
                        <div className="flex flex-wrap gap-4">
                          <Badge variant="accent" className="px-5 transition-transform hover:scale-110">
                            {suggestions.suggestions.length} SECTORS DETECTED
                          </Badge>
                          <Badge variant="success" className="px-5 transition-transform hover:scale-110 italic">{assignedCount} NODES DEPLOYED</Badge>
                          <Badge variant="warning" className="px-5 transition-transform hover:scale-110">
                            {suggestions.suggestions.length - assignedCount} VOID SECTORS
                          </Badge>
                        </div>
                        <Button
                          size="lg"
                          variant="accent"
                          disabled={confirmingAll || assignedCount === 0}
                          onClick={handleConfirmAll}
                          className="px-16 font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                        >
                          {confirmingAll
                            ? "INSCRIBING DATA..."
                            : `DEPLOY ${assignedCount} COVER PROTOCO${assignedCount === 1 ? "L" : "LS"}`}
                        </Button>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {step === "confirmed" ? (
              <div className="card-reveal mx-auto max-w-2xl py-24 px-12 border border-primary/20 relative overflow-hidden group">
                 {/* Success Ring Decoration */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                 
                <div className="relative z-10 flex flex-col items-center gap-10 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-white shadow-[0_0_40px_rgba(59,130,246,0.5)] rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <CheckCircleIcon className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-4 max-w-md">
                    <h2 className="text-4xl font-black tracking-tighter text-white italic">
                      ORCHESTRATION COMPLETE
                    </h2>
                    <p className="text-[13px] font-black uppercase tracking-[0.3em] leading-relaxed text-slate-500">
                      Successfully assigned {confirmedCount} substitution{confirmedCount === 1 ? "" : "s"} for{" "}
                      <span className="text-primary font-black italic">
                        {selectedTeacher?.name || "the designated agent"}
                      </span>.
                    </p>
                  </div>
                   <div className="flex flex-col gap-3 sm:flex-row pt-6">
                    <Button size="lg" onClick={handleReset} className="min-w-[280px] shadow-2xl font-black uppercase tracking-widest text-[11px]">
                      Initiate New Sequence
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

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
                   Cleanup records
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
