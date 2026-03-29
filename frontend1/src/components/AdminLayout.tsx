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
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-200",
              isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            )}
          >
            {isActive && (
              <div className="absolute left-0 h-6 w-1 rounded-r-full bg-[var(--color-brand)] shadow-[0_0_10px_var(--color-brand)]" />
            )}
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                isActive
                  ? "bg-[var(--color-brand)] text-white shadow-[0_4px_12px_rgba(var(--color-brand-rgb),0.3)]"
                  : "bg-zinc-900 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-200"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <p className="text-[14px] font-black leading-none tracking-tight">{item.label}</p>
              <p
                className={cn(
                  "mt-1.5 truncate text-[10px] uppercase font-bold tracking-[0.12em] transition-colors",
                  isActive ? "text-white/60" : "text-zinc-500 group-hover:text-zinc-400"
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
    <div className="page-shell min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden border-r border-zinc-900 bg-zinc-950 px-3 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-8">
        <div className="px-3 space-y-6">
          <div className="flex items-center gap-3.5 px-1.5">
             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <AppMark className="invert opacity-100 h-5 w-5" />
             </div>
             <div className="flex flex-col">
                <span className="text-[14px] font-black tracking-[-0.02em] text-white">Antigravity</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold leading-none mt-0.5">Admin Portal</span>
             </div>
          </div>
          
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4.5 backdrop-blur-md">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2.5">System Status</h3>
            <p className="text-[12px] font-bold leading-[1.6] text-zinc-500">
              Operational oversight and resource orchestration in real-time.
            </p>
          </div>
        </div>

        <div className="flex-1 px-1">
          <div className="space-y-4">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
              Navigation
            </p>
            <NavItems pathname={pathname} />
          </div>
        </div>

        <div className="px-3 py-4 mt-auto">
          <div className="rounded-2xl bg-zinc-900/40 border border-white/5 p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand)] text-xs font-black text-white shadow-[0_4px_12px_rgba(var(--color-brand-rgb),0.3)]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-black text-zinc-100">
                {user.name || "Administrator"}
              </p>
              <p className="truncate text-[10px] text-zinc-500 font-bold tracking-tight">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
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
