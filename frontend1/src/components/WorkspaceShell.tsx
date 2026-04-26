"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "@/lib/types";
import { cn } from "@/lib/cn";

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
  if (pathname === item.href) return true;
  return item.matches?.some((match) => pathname.startsWith(match)) ?? false;
}

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// Simple SVG icons for nav
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const MenuBars = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

function SidebarContents({
  user,
  roleLabel,
  navItems,
  pathname,
  onSignOut,
  onNavigate,
}: {
  user: User;
  roleLabel: string;
  navItems: WorkspaceNavItem[];
  pathname: string;
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[var(--sidebar-bg)]">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 border-b border-[var(--sidebar-border)] px-5 py-[18px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white shadow-sm">
          <HomeIcon />
        </div>
        <div>
          <p className="text-[14px] font-bold text-[var(--color-text)] leading-none">ruroxz</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)] leading-none">{roleLabel}</p>
        </div>
      </div>

      {/* User Card */}
      <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[12px] font-bold text-white shadow-sm">
          {getInitials(user.name, user.email)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[var(--color-text)] leading-tight">{user.name || "User"}</p>
          <p className="truncate text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Nav Label */}
      <p className="px-6 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Navigation
      </p>

      {/* Nav Items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {navItems.map((item, idx) => {
          const active = matchesPath(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              style={{ animationDelay: `${idx * 40}ms` }}
              className={cn(
                "animate-slide-in-left flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 relative",
                active
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--color-text)]"
              )}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[var(--sidebar-active-border)]" />
              )}
              <span className={cn("shrink-0", active ? "text-[var(--sidebar-active-text)]" : "text-[var(--color-text-muted)]")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-[var(--color-border)] p-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
        >
          <LogoutIcon />
          Sign Out
        </button>
      </div>
    </div>
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
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = useMemo(
    () => navItems.find((item) => matchesPath(pathname, item)) ?? navItems[0],
    [navItems, pathname]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = getInitials(user.name, user.email);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-60 hidden lg:flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] z-40">
        <SidebarContents
          user={user}
          roleLabel={roleLabel}
          navItems={navItems}
          pathname={pathname}
          onSignOut={onSignOut}
        />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:ml-60 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-subtle)] lg:hidden"
              aria-label="Open menu"
            >
              <MenuBars />
            </button>
            <div>
              <h1 className="text-[15px] font-bold text-[var(--color-text)] leading-tight">{activeItem?.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Profile Dropdown Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-full p-0.5 pr-3 transition-all hover:bg-[var(--color-surface-subtle)] focus:outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white shadow-sm ring-2 ring-[var(--color-surface)] ring-offset-1 ring-offset-[var(--color-border)]">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[13px] font-bold text-[var(--color-text)] leading-none">{user.name || "User"}</p>
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">{roleLabel}</p>
                </div>
                <svg className={cn("h-3 w-3 text-[var(--color-text-muted)] transition-transform", profileOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-2xl animate-scale-in z-50">
                  <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                    <p className="text-[13px] font-bold text-[var(--color-text)]">{user.name || "User"}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors"
                  >
                    <UserIcon />
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors"
                  >
                    <SettingsIcon />
                    Account Settings
                  </Link>
                  
                  <div className="my-1 border-t border-[var(--color-border)]" />
                  
                  <button
                    onClick={() => { setProfileOpen(false); onSignOut(); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors"
                  >
                    <LogoutIcon />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[var(--sidebar-bg)] shadow-2xl z-10 animate-slide-in-left">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            >
              <CloseIcon />
            </button>
            <SidebarContents
              user={user}
              roleLabel={roleLabel}
              navItems={navItems}
              pathname={pathname}
              onSignOut={() => { setMenuOpen(false); onSignOut(); }}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
