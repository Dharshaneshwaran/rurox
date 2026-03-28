import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f5f1_0%,_#f0efe8_45%,_#e8e3d8_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-700">
            Smart Teacher Assignment System
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
            Assign classes faster, handle absences smarter, and keep every
            teacher in sync.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-700">
            Choose your role to manage timetables, substitutions, and special
            sessions with a clean, responsive workspace.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-[0_24px_60px_-40px_rgba(24,24,27,0.6)]">
            <h2 className="text-2xl font-semibold text-zinc-900">Admin Login</h2>
            <p className="mt-3 text-sm text-zinc-600">
              Create timetables, assign substitutions, and monitor workloads in
              real time.
            </p>
            <Link
              href="/admin/login"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Continue as Admin
            </Link>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-[0_24px_60px_-40px_rgba(24,24,27,0.6)]">
            <h2 className="text-2xl font-semibold text-zinc-900">Teacher Login</h2>
            <p className="mt-3 text-sm text-zinc-600">
              View your week at a glance, check special classes, and spot
              substitutions instantly.
            </p>
            <Link
              href="/teacher/login"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
            >
              Continue as Teacher
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
