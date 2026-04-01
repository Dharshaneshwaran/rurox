"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/lib/types";
import { cn } from "@/lib/cn";
import { AppMark, LogoutIcon, MenuIcon } from "@/components/icons";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";

export type WorkspaceNavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  description?: string;
  matches?: string[];
};

type WorkspaceShellProps = {
  roleLabel: string;
  subtitle: string;
  user: User;
  navItems: WorkspaceNavItem[];
  onSignOut: () => void;
  children: ReactNode;
};

function matchesPath(pathname: string, item: WorkspaceNavItem) {
  if (pathname === item.href) {
    return true;
  }

  return item.matches?.some((match) => pathname.startsWith(match)) ?? false;
}

function SidebarNav({
  pathname,
  navItems,
  onNavigate,
}: {
  pathname: string;
  navItems: WorkspaceNavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => {
        const active = matchesPath(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-300",
              active
                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                : "text-zinc-300 hover:bg-white/5 hover:text-white"
            )}
          >
            {active && (
              <div className="absolute left-0 h-6 w-1 rounded-r-full bg-[var(--color-brand)] shadow-[0_0_15px_var(--color-brand)]" />
            )}
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                active
                  ? "bg-[var(--color-brand)] text-white shadow-[0_4px_12px_rgba(var(--color-brand-rgb),0.3)]"
                  : "bg-zinc-900 border border-white/5 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-200"
              )}
            >
              <div className="h-4.5 w-4.5">{item.icon}</div>
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <span 
                className={cn(
                  "text-[14px] font-black tracking-tight transition-colors",
                  active ? "text-white" : "text-zinc-200 group-hover:text-white"
                )}
              >
                {item.label}
              </span>
              {item.description && (
                <p
                  className={cn(
                    "mt-1.5 truncate text-[10px] uppercase font-bold tracking-[0.14em] transition-colors",
                    active ? "text-white/70" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                >
                  {item.description}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export default function WorkspaceShell({
  roleLabel,
  subtitle,
  user,
  navItems,
  onSignOut,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeItem = useMemo(
    () => navItems.find((item) => matchesPath(pathname, item)) ?? navItems[0],
    [navItems, pathname]
  );

  return (
    <div className="min-h-screen bg-zinc-50/60">
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-72 flex-col border-r border-zinc-900 bg-zinc-950 spine-gradient lg:flex sticky top-0 h-screen overflow-hidden group/sidebar">

          <div className="relative z-10 flex flex-col h-full gap-8 p-6">
            <Link href="/" className="inline-flex items-center gap-3.5 px-1.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md transition-transform group-hover:scale-105">
                <AppMark className="h-6 w-6 invert opacity-100" />
              </div>
              <div>
                <p className="text-[14px] font-black tracking-tight text-white leading-tight">
                  ruroxz
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-brand)] font-black mt-2 leading-none">
                  {roleLabel}
                </p>
              </div>
            </Link>

            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2.5">
                Focus Mode
              </h3>
              <p className="text-[12px] font-bold leading-relaxed text-zinc-500">
                {subtitle}
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                Workspace
              </p>
              <SidebarNav pathname={pathname} navItems={navItems} />
            </div>

            <div className="mt-auto space-y-4">
              <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4.5 flex items-center gap-3.5 backdrop-blur-md transition-colors hover:bg-white/[0.07]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand)] text-xs font-black text-white shadow-[0_4px_12px_rgba(var(--color-brand-rgb),0.3)]">
                  {user.name?.slice(0, 2).toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-black text-white tracking-tight">
                    {user.name ?? "Unnamed user"}
                  </p>
                  <p className="truncate text-[10px] text-zinc-400 font-bold tracking-tight mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 transition-all hover:bg-red-500/15 hover:text-red-400 ring-1 ring-white/5"
              >
                <LogoutIcon className="h-4 w-4 opacity-70" />
                Terminating Session
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[var(--color-stroke)] bg-white/80 backdrop-blur-xl transition-all">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-stroke)] bg-white text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-95 lg:hidden"
                  aria-label="Open navigation"
                >
                  <MenuIcon className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-brand)]">
                    {roleLabel}
                  </p>
                  <h1 className="truncate text-2xl font-black tracking-tight text-zinc-900">
                    {activeItem?.label ?? "Workspace"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden text-right md:block">
                  <p className="text-[13px] font-black text-zinc-900 leading-none">
                    {user.name || "User"}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1 tracking-tight">
                    {user.email}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-[11px] font-black text-white shadow-lg md:h-11 md:w-11">
                  {user.name?.slice(0, 2).toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/35"
          />
          <aside className="relative flex h-full w-[min(88vw,21rem)] flex-col border-r border-zinc-900 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-1.5 mb-8">
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <AppMark className="invert opacity-100 h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black tracking-[-0.02em] text-white">Smart Teacher</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold leading-none mt-0.5">{roleLabel}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:text-white"
              >
                <LogoutIcon className="h-4 w-4 rotate-180" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                Navigation
              </p>
              <SidebarNav
                pathname={pathname}
                navItems={navItems}
                onNavigate={() => setMenuOpen(false)}
              />
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="flex items-center gap-3.5 px-3 py-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)] text-xs font-black text-white">
                   {user.name?.slice(0, 2).toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">{user.name || "Teacher"}</p>
                  <p className="truncate text-[10px] text-zinc-500 font-bold tracking-tight">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="mt-4 flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold"
              >
                <LogoutIcon className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
