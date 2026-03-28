"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setStoredAuth } from "@/hooks/useAuth";
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
        setError("This account is not an admin.");
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f5f1_0%,_#f0efe8_45%,_#e8e3d8_100%)]">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-16">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            Admin Access
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-zinc-900">
            Sign in to manage schedules
          </h1>
        </header>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-[0_24px_60px_-40px_rgba(24,24,27,0.6)]"
        >
          <label className="block text-sm font-semibold text-zinc-700">
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

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}
