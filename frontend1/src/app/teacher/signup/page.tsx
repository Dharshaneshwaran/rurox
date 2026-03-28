"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

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
      await apiFetch(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        }
      );

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f5f1_0%,_#f0efe8_45%,_#e8e3d8_100%)]">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-16">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            Teacher Access
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-zinc-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Sign up to request access. An admin will approve your account before you can log in.
          </p>
        </header>

        {success ? (
          <div className="rounded-3xl border border-green-200 bg-green-50/90 p-8 shadow-[0_24px_60px_-40px_rgba(24,24,27,0.6)]">
            <p className="text-sm font-semibold text-green-800">
              ✓ Signup successful!
            </p>
            <p className="mt-3 text-sm text-green-700">
              Your account has been created. An administrator will review and approve your request. You'll be able to log in once approved.
            </p>
            <p className="mt-4 text-xs text-green-600">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-[0_24px_60px_-40px_rgba(24,24,27,0.6)]"
          >
            <label className="block text-sm font-semibold text-zinc-700">
              Full Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                required
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-zinc-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                required
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-zinc-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                required
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-zinc-700">
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                required
              />
            </label>

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="mt-6 text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <Link href="/teacher/login" className="font-semibold text-amber-700 hover:text-amber-800">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
