import Link from "next/link";
import {
  AppMark,
  ArrowRightIcon,
  CalendarIcon,
  ShieldIcon,
  SwapIcon,
  UsersIcon,
} from "@/components/icons";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6 lg:p-6">
      <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1500px] flex-col border border-border bg-white">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3">
            <AppMark className="h-10 w-10 text-foreground" />
            <div>
              <p className="font-display text-lg tracking-[-0.03em] text-foreground">
                Smart Teacher Assignment
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Scheduling workspace
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/teacher/signup" className={buttonClasses({ variant: "secondary" })}>
              Request teacher access
            </Link>
            <Link href="/admin/login" className={buttonClasses({ variant: "accent" })}>
              Admin login
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative border-b border-border px-6 py-10 sm:px-10 sm:py-14 lg:border-b-0 lg:border-r lg:py-18">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(194,65,12,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(194,65,12,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="relative max-w-3xl">
              <Badge variant="accent">Real-time staffing operations</Badge>
              <h1 className="mt-8 font-display text-5xl tracking-[-0.07em] text-foreground sm:text-6xl lg:text-7xl">
                Keep timetables stable even when the day shifts underneath you.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Give admins one place to assign coverage, review staffing, and
                approve accounts. Give teachers a clearer view of their week,
                substitutions, and special sessions.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/admin/login" className={buttonClasses({ variant: "accent", size: "lg" })}>
                  Open admin workspace
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link href="/teacher/login" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                  Open teacher workspace
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: "Live coverage",
                    value: "8 periods",
                    detail: "Review, assign, and confirm substitutions without leaving the screen.",
                  },
                  {
                    label: "Teacher access",
                    value: "Approval flow",
                    detail: "Pending accounts and staff visibility stay inside the same admin system.",
                  },
                  {
                    label: "Weekly clarity",
                    value: "40 slots",
                    detail: "Teachers get a full-week schedule with free slots and special classes surfaced clearly.",
                  },
                ].map((item) => (
                  <div key={item.label} className="border border-border bg-white/92 p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-3 font-display text-3xl tracking-[-0.04em] text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-0">
            <div className="border-b border-border px-6 py-8 sm:px-8 sm:py-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent">
                    Workspace split
                  </p>
                  <h2 className="mt-3 font-display text-3xl tracking-[-0.05em] text-foreground">
                    One system, two focused experiences
                  </h2>
                </div>
                <ShieldIcon className="h-8 w-8 text-accent" />
              </div>
            </div>

            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-1">
              <article className="border-b border-border px-6 py-8 sm:px-8">
                <div className="flex items-center gap-3 text-foreground">
                  <UsersIcon className="h-5 w-5" />
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Admin experience
                  </p>
                </div>
                <h3 className="mt-4 font-display text-2xl tracking-[-0.04em] text-foreground">
                  Command center for staffing decisions
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Review teacher capacity, approve new accounts, manage full-day
                  absences, and assign substitute coverage from a consistent
                  operations layout.
                </p>
                <Link
                  href="/admin/login"
                  className={buttonClasses({
                    variant: "secondary",
                    className: "mt-6 w-full justify-between sm:w-auto",
                  })}
                >
                  Continue as admin
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </article>

              <article className="border-b border-border px-6 py-8 sm:border-l sm:border-b-0 sm:px-8 lg:border-l-0 lg:border-b">
                <div className="flex items-center gap-3 text-foreground">
                  <CalendarIcon className="h-5 w-5" />
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Teacher experience
                  </p>
                </div>
                <h3 className="mt-4 font-display text-2xl tracking-[-0.04em] text-foreground">
                  Weekly view built for the day-to-day
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Check your timetable, spot substitutions, review special
                  classes, and fill open slots without the interface getting in
                  the way.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/teacher/login" className={buttonClasses({ variant: "secondary" })}>
                    Teacher sign in
                  </Link>
                  <Link href="/teacher/signup" className={buttonClasses({ variant: "accent" })}>
                    Request access
                  </Link>
                </div>
              </article>

              <article className="px-6 py-8 sm:col-span-2 sm:px-8 lg:col-span-1">
                <div className="flex items-center gap-3 text-foreground">
                  <SwapIcon className="h-5 w-5" />
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Built for change
                  </p>
                </div>
                <h3 className="mt-4 font-display text-2xl tracking-[-0.04em] text-foreground">
                  Absences, coverage, and class updates stay traceable
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  The product is structured like a real operational tool: clear
                  action hierarchy, visible system state, and responsive layouts
                  that stay usable on mobile, tablet, and desktop.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
