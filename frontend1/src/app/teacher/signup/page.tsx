"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/ui/AuthShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { FieldNote, TextField } from "@/components/ui/Field";
import { apiFetch } from "@/lib/api";

export default function TeacherSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/teacher/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Teacher access"
      title="Request access to the teacher workspace."
      description="Create your account once. An administrator reviews and activates teacher access before sign-in is enabled."
      panelLabel="Teacher onboarding"
      panelTitle="A cleaner signup flow for teachers joining the schedule."
      panelDescription="Submit a straightforward request, let admin approval handle access control, and return to a workspace that matches the rest of the product."
      highlights={[
        "Teacher requests enter a dedicated admin approval queue immediately after submission.",
        "Form spacing, validation, and messaging stay consistent with the login experience.",
        "The layout stays readable on mobile, tablet, and desktop without collapsing the hierarchy.",
        "Approved teachers move straight into the same timetable and substitution system used every day.",
      ]}
      footer={
        <FieldNote>
          Already have an account?{" "}
          <Link
            href="/teacher/login"
            className="font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
          >
            Sign in here.
          </Link>
        </FieldNote>
      }
    >
      {success ? (
        <div className="rounded-[28px] border border-success/15 bg-success-soft px-6 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="success">Request sent</Badge>
            <Badge tone="default">Pending approval</Badge>
          </div>
          <p className="mt-4 text-base font-semibold text-success">
            Signup successful
          </p>
          <p className="mt-3 text-sm leading-6 text-foreground/85">
            Your account has been created and is waiting for administrator
            approval. You will be redirected to login shortly.
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Redirecting to login page...
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand">Approval workflow</Badge>
            <Badge tone="default">Responsive form</Badge>
          </div>

          <div className="grid gap-4">
            <TextField
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-[22px] border border-danger/15 bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="space-y-3 pt-2">
            <Button type="submit" size="lg" fullWidth disabled={loading}>
              {loading ? "Creating account..." : "Create teacher account"}
            </Button>
            <FieldNote>
              Admin approval is required before the teacher dashboard can be
              accessed.
            </FieldNote>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
