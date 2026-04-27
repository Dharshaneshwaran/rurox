"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type MessageResponse = {
  message: string;
};

function RecoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;

    async function validateToken() {
      if (!token) {
        setCheckingToken(false);
        return;
      }

      try {
        await apiFetch<{ valid: boolean }>(
          `/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`
        );
        if (!cancelled) {
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Invalid reset link");
        }
      } finally {
        if (!cancelled) {
          setCheckingToken(false);
        }
      }
    }

    void validateToken();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const mode = useMemo(() => (token ? "reset" : "request"), [token]);

  const onRequestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await apiFetch<MessageResponse>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset link");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<MessageResponse>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(data.message);
      setTimeout(() => {
        router.push("/");
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] hero-gradient text-[var(--color-text)] px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center">
        <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-lg)]">
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]/70">
              Account Recovery
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
              {mode === "reset" ? "Set a new password" : "Recover access"}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {mode === "reset"
                ? "Choose a new password for your account."
                : "Enter your email and we will send you a reset link."}
            </p>
          </div>

          {checkingToken ? (
            <p className="text-sm text-[var(--color-text-muted)]">Checking your reset link...</p>
          ) : mode === "reset" ? (
            <form onSubmit={onResetPassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="Enter a new password"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="Repeat your new password"
                  required
                />
              </div>

              {error ? <div className="rounded-sm bg-red-50 p-3 text-xs text-red-600">{error}</div> : null}
              {success ? <div className="rounded-sm bg-green-50 p-3 text-xs text-green-700">{success}</div> : null}

              <button
                type="submit"
                disabled={loading || Boolean(error && !success)}
                className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "UPDATING..." : "RESET PASSWORD"}
              </button>
            </form>
          ) : (
            <form onSubmit={onRequestReset} className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="name@school.edu"
                  required
                />
              </div>

              {error ? <div className="rounded-sm bg-red-50 p-3 text-xs text-red-600">{error}</div> : null}
              {success ? <div className="rounded-sm bg-green-50 p-3 text-xs text-green-700">{success}</div> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "SENDING..." : "SEND RESET LINK"}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-[var(--color-border)] pt-5 text-center">
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]/70 transition-colors hover:text-[var(--color-primary)]">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecoverPage() {
  return (
    <Suspense fallback={null}>
      <RecoverContent />
    </Suspense>
  );
}
