"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

// ── Icons ──────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const SwapIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
  </svg>
);
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const UserMenuIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

// ── Nav items ─────────────────────────────────────────────
const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { label: "Substitutions", href: "/admin/substitutions", icon: SwapIcon },
  { label: "Classes", href: "/admin/classes", icon: ClipboardIcon },
  { label: "Users", href: "/admin/users", icon: UsersIcon },
  { label: "Notices", href: "/admin/notices", icon: BellIcon },
];

function getInitials(name: string | null | undefined, email: string) {
  if (name) return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function SidebarContent({
  pathname,
  user,
  onSignOut,
  onNavigate,
}: {
  pathname: string;
  user: { name: string | null; email: string };
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[var(--sidebar-bg)]">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-[var(--sidebar-border)] px-5 py-[18px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white shadow-sm">
          <HomeIcon />
        </div>
        <div>
          <p className="text-[14px] font-bold text-[var(--color-text)] leading-none">ruroxz</p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)] leading-none">Admin Panel</p>
        </div>
      </div>

      {/* User Card */}
      <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[12px] font-bold text-white shadow-sm">
          {getInitials(user.name, user.email)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[var(--color-text)] leading-tight">{user.name || "Admin"}</p>
          <p className="mt-0.5 text-[10px] font-medium text-[var(--color-primary)] leading-none">System Owner</p>
        </div>
      </div>

      {/* Section label */}
      <p className="px-6 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Management
      </p>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {navItems.map((item, idx) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              style={{ animationDelay: `${idx * 40}ms` }}
              className={cn(
                "animate-slide-in-left group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150",
                active
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--color-text)]"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[var(--sidebar-active-border)]" />
              )}
              <span className={cn("shrink-0 transition-colors", active ? "text-[var(--sidebar-active-text)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]")}>
                <Icon />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, clear, loading } = useAuth({ role: "ADMIN", redirectTo: "/admin/login" });
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-sm text-[var(--color-text-muted)] animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  const handleSignOut = () => { clear(); window.location.href = "/"; };

  // Find active nav label
  const activeLabel = navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Dashboard";
  const initials = getInitials(user.name, user.email);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-60 hidden lg:flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] z-40">
        <SidebarContent pathname={pathname} user={user} onSignOut={handleSignOut} />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col lg:ml-60 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)] lg:hidden"
            >
              <MenuIcon />
            </button>
            <h1 className="text-[15px] font-bold text-[var(--color-text)]">{activeLabel}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-full p-0.5 pr-3 transition-all hover:bg-[var(--color-surface-subtle)] focus:outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white shadow-sm ring-2 ring-[var(--color-surface)] ring-offset-1 ring-offset-[var(--color-border)]">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[13px] font-bold text-[var(--color-text)] leading-none">{user.name || "Admin"}</p>
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">Administrator</p>
                </div>
                <svg className={cn("h-3 w-3 text-[var(--color-text-muted)] transition-transform", profileOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-2xl animate-scale-in z-50">
                  <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                    <p className="text-[13px] font-bold text-[var(--color-text)]">{user.name || "Admin"}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors"
                  >
                    <UserMenuIcon />
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
                    onClick={() => { setProfileOpen(false); handleSignOut(); }}
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

        {/* Content */}
        <main className="flex-1 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[var(--sidebar-bg)] shadow-2xl z-10 animate-slide-in-left">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            >
              <XIcon />
            </button>
            <SidebarContent
              pathname={pathname}
              user={user}
              onSignOut={() => { setMobileOpen(false); handleSignOut(); }}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
