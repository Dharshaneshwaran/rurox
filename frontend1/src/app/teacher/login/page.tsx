"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import Button from "@/components/ui/Button";
import Field, { inputClassName } from "@/components/ui/Field";
import { setStoredAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<{ token: string; user: User }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      if (data.user.role !== "TEACHER") {
        setError("This account is not approved for teacher access.");
        setLoading(false);
        return;
      }

      setStoredAuth(data.token, data.user);
      router.push("/teacher/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Teacher access"
      title="Sign in to your weekly workspace"
      description="View your timetable, track substitution alerts, and stay on top of special classes from a focused teacher dashboard."
      panelTitle="Teaching"
      panelDescription="Your schedule, substitutions, and special classes in one place."
      highlights={[
        {
          label: "Weekly timetable",
          value: "5 days",
          description: "See the full week clearly, with substitutions and open slots surfaced in the same view.",
        },
        {
          label: "Alerts",
          value: "Substitutions",
          description: "Assigned cover periods appear alongside your timetable so nothing gets missed.",
        },
        {
          label: "Extra sessions",
          value: "Special classes",
          description: "Review additional sessions, room details, and notes without jumping across tools.",
        },
      ]}
      footer={
        <>
          <span>New to the system?</span>
          <Link href="/teacher/signup" className="font-medium text-accent">
            Request teacher access
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            required
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            required
          />
        </Field>

        {error ? (
          <div className="border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <Button type="submit" variant="accent" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Open teacher workspace"}
        </Button>
      </form>
    </AuthShell>
  );
}
