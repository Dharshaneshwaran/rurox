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
              "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-300",
              isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-secondary/70 hover:bg-white/5 hover:text-white"
            )}
          >
            {isActive && (
              <div className="absolute left-0 h-6 w-1 rounded-r-full bg-[var(--color-brand)] shadow-[0_0_10px_var(--color-brand)]" />
            )}
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                isActive
                  ? "bg-accent text-white shadow-[0_4px_12px_rgba(var(--color-brand-rgb),0.3)]"
                  : "bg-primary-strong/40 text-secondary/50 group-hover:bg-primary-strong/60 group-hover:text-secondary/90"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <p 
                className={cn(
                  "text-[14px] font-black leading-none tracking-tight transition-colors",
                  isActive ? "text-white" : "text-secondary group-hover:text-white"
                )}
              >
                {item.label}
              </p>
              <p
                className={cn(
                  "mt-1.5 truncate text-[10px] uppercase font-bold tracking-[0.15em] transition-colors",
                  isActive ? "text-white/70" : "text-secondary/50 group-hover:text-secondary/80"
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
    <div className="admin-theme page-shell min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden border-r border-primary/20 bg-primary px-3 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-8 overflow-hidden group/sidebar">
        {/* Background Texture */}
        <div 
          className="absolute inset-0 opacity-[0.25] mix-blend-overlay grayscale transition-opacity duration-700 group-hover/sidebar:opacity-[0.40] pointer-events-none"
          style={{ 
            backgroundImage: 'url(/substitution.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.2) brightness(0.8)'
          }}
        />
        <div className="px-3 space-y-6">
          <div className="flex items-center gap-4 px-2 translate-x-[-2px]">
            <AppMark hideText inverse className="shrink-0 scale-105" />
            <div className="flex flex-col">
              <span className="text-[15px] font-black tracking-tight text-secondary leading-none">ruroxz</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-black mt-2">Command Hub</span>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-primary-strong/60 p-5 shadow-2xl transition-all hover:bg-primary-strong/90">
            {/* Professional Texture Integration */}
            <div
              className="absolute inset-0 opacity-[0.25] mix-blend-screen pointer-events-none grayscale group-hover:opacity-40 transition-all duration-700 scale-[1.3] group-hover:scale-100"
              style={{
                backgroundImage: "url('/substitution.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="relative z-10">
              <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-secondary/50 mb-2.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                Network Live
              </h3>
              <p className="text-[12px] font-bold leading-relaxed text-secondary/70">
                Orchestrating school resources and deployment in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-1">
          <div className="space-y-4">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
              Navigation
            </p>
            <NavItems pathname={pathname} />
          </div>
        </div>

        <div className="px-3 py-4 mt-auto">
          <div className="rounded-2xl bg-primary-strong/40 border border-white/5 p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-xs font-black text-white shadow-[0_4px_12px_rgba(var(--color-brand-rgb),0.3)]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-black text-white">
                {user.name || "Administrator"}
              </p>
              <p className="truncate text-[10px] text-secondary/60 font-bold tracking-tight">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 transition-all hover:bg-red-500/15 hover:text-red-400 ring-1 ring-white/5"
          >
            <LogOutIcon className="h-4 w-4 opacity-70" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-primary/10 bg-surface/80 px-4 py-3 backdrop-blur-xl lg:hidden">
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

        <main className="flex-1 overflow-y-auto bg-surface transition-colors duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
