"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AppMark from "@/components/ui/AppMark";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import {
  DashboardIcon,
  LogOutIcon,
  MenuIcon,
  SwapIcon,
  UsersIcon,
  XIcon,
} from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    description: "Teachers and schedules",
    icon: DashboardIcon,
  },
  {
    label: "Substitutions",
    href: "/admin/substitutions",
    description: "Coverage and absences",
    icon: SwapIcon,
  },
  {
    label: "Users",
    href: "/admin/users",
    description: "Approvals and access",
    icon: UsersIcon,
  },
];

function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-4 rounded-[24px] border px-4 py-3.5 transition",
              isActive
                ? "border-[color:color-mix(in_oklab,var(--color-brand)_18%,white)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                : "border-transparent bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-stroke)] hover:bg-white hover:text-[var(--color-text)]"
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl transition",
                isActive
                  ? "bg-white text-[var(--color-brand)]"
                  : "bg-[var(--color-panel-muted)] text-[var(--color-text-soft)] group-hover:bg-[var(--color-brand-soft)] group-hover:text-[var(--color-brand)]"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{item.label}</p>
              <p
                className={cn(
                  "truncate text-xs",
                  isActive ? "text-[var(--color-brand)]/80" : "text-[var(--color-text-soft)]"
                )}
              >
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, clear, loading } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading || !user) {
    return (
      <div className="page-shell min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center px-6 py-12 text-sm text-[var(--color-text-muted)]">
          Loading workspace...
        </div>
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  const handleSignOut = () => {
    clear();
    window.location.href = "/";
  };

  return (
    <div className="page-shell min-h-screen lg:grid lg:grid-cols-[296px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[var(--color-stroke)] bg-[rgba(255,255,255,0.62)] px-5 py-5 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-6">
        <Panel tone="highlight" className="px-5 py-5">
          <div className="space-y-4">
            <AppMark />
            <div className="space-y-2">
              <Badge tone="brand">Admin portal</Badge>
              <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                Manage staff records, substitution coverage, and pending approvals
                from a single command surface.
              </p>
            </div>
          </div>
        </Panel>

        <Panel tone="muted" className="flex-1 px-4 py-4">
          <div className="space-y-3">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              Navigation
            </p>
            <NavItems pathname={pathname} />
          </div>
        </Panel>

        <Panel className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)] text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                {user.name || "Administrator"}
              </p>
              <p className="truncate text-xs text-[var(--color-text-soft)]">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-4 w-full justify-start"
            icon={<LogOutIcon className="h-4 w-4" />}
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </Panel>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--color-stroke)] bg-[rgba(247,249,252,0.84)] px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <AppMark className="min-w-0" />
            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-stroke)] bg-white text-[var(--color-text)]"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            >
              {mobileOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {mobileOpen ? (
            <div className="pt-4">
              <Panel tone="muted" className="space-y-4 px-4 py-4">
                <div className="flex items-center gap-3 rounded-[24px] border border-[var(--color-stroke)] bg-white px-4 py-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand)] text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {user.name || "Administrator"}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-soft)]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <NavItems pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  icon={<LogOutIcon className="h-4 w-4" />}
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </Panel>
            </div>
          ) : null}
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
