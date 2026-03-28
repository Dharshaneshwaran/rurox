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

export default function AdminLoginPage() {
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

      if (data.user.role !== "ADMIN") {
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }

      setStoredAuth(data.token, data.user);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Admin access"
      title="Sign in to manage staffing"
      description="Use your admin account to review teachers, resolve absences, and keep the schedule coordinated."
      panelTitle="Operations"
      panelDescription="Run the staffing desk with a cleaner command surface."
      highlights={[
        {
          label: "Teacher visibility",
          value: "Directory",
          description: "See staffing coverage, workload, and weekly structure from one dashboard.",
        },
        {
          label: "Absence flow",
          value: "3-step review",
          description: "Select an absent teacher, review suggestions, and confirm coverage without guesswork.",
        },
        {
          label: "Approvals",
          value: "Pending queue",
          description: "Approve new teacher accounts and keep access decisions inside the same workspace.",
        },
      ]}
      footer={
        <>
          <span>Need teacher access instead?</span>
          <Link href="/teacher/login" className="font-medium text-accent">
            Teacher sign in
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
          {loading ? "Signing in..." : "Open admin workspace"}
        </Button>
      </form>
    </AuthShell>
  );
}
