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
    <nav className="space-y-2">
      {navItems.map((item) => {
        const active = matchesPath(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 border px-4 py-3 text-sm font-medium transition",
              active
                ? "border-accent/25 bg-accent-soft text-accent"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center border border-current/15">
              {item.icon}
            </span>
            <span>{item.label}</span>
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-72 flex-col border-r border-border bg-white lg:flex">
          <div className="flex h-full flex-col p-8">
            <Link href="/" className="inline-flex items-center gap-3 text-foreground">
              <AppMark className="h-10 w-10" />
              <div>
                <p className="font-display text-lg tracking-[-0.03em]">
                  Smart Teacher Assignment
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </Link>

            <div className="mt-10 border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Workspace
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground">{subtitle}</p>
            </div>

            <div className="mt-10">
              <SidebarNav pathname={pathname} navItems={navItems} />
            </div>

            <div className="mt-auto border border-border bg-background p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Signed in as
              </p>
              <p className="mt-4 font-display text-2xl tracking-[-0.04em] text-foreground">
                {user.name ?? "Unnamed user"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
              <Button
                onClick={onSignOut}
                variant="secondary"
                className="mt-6 w-full justify-between"
              >
                Sign out
                <LogoutIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-white/92 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center border border-border bg-white text-foreground transition hover:bg-background lg:hidden"
                  aria-label="Open navigation"
                >
                  <MenuIcon className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent">
                    {roleLabel}
                  </p>
                  <h1 className="truncate font-display text-2xl tracking-[-0.04em] text-foreground">
                    {activeItem?.label ?? "Workspace"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="accent" className="hidden sm:inline-flex">
                  {roleLabel}
                </Badge>
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium text-foreground">{user.name ?? user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className={buttonClasses({
                    variant: "secondary",
                    size: "sm",
                    className: "hidden sm:inline-flex",
                  })}
                >
                  Exit
                </button>
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
          <aside className="relative flex h-full w-[min(88vw,20rem)] flex-col border-r border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-5">
              <div>
                <p className="font-display text-lg tracking-[-0.03em] text-foreground">
                  Smart Teacher Assignment
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <SidebarNav
                pathname={pathname}
                navItems={navItems}
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
            <div className="border-t border-border p-5">
              <p className="text-sm font-medium text-foreground">{user.name ?? user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
              <Button
                onClick={onSignOut}
                variant="secondary"
                className="mt-5 w-full justify-between"
              >
                Sign out
                <LogoutIcon className="h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
