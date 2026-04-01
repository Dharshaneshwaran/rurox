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
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
              isActive
                ? "bg-primary text-white shadow-[0_8px_16px_rgba(59,130,246,0.3)]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
            )} />
            <span className={cn(
              "text-[14px] font-semibold tracking-tight",
              isActive ? "text-white" : "text-slate-300 group-hover:text-white"
            )}>
              {item.label}
            </span>
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
      <div className="admin-theme bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/5 border-t-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Securing Session</p>
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
    <div className="admin-theme min-h-screen lg:grid lg:grid-cols-[300px_1fr] bg-[#020617] page-shell selection:bg-primary/30 selection:text-white">
      <aside className="hidden border-r border-white/5 bg-[#020617] px-6 py-10 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-12 relative overflow-hidden">
        {/* Architectural Sidebar Lines */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        
        <div className="relative z-10 flex items-center gap-4 px-2 hover:translate-x-1 transition-transform duration-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_12px_24px_rgba(59,130,246,0.35)] relative group cursor-pointer overflow-hidden">
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
             <AppMark hideText inverse className="scale-75 relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-[22px] font-black tracking-tighter text-white leading-none italic">ruroxz</span>
            <div className="flex items-center gap-2 mt-1">
               <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#10b981]" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Node active</span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-1 relative z-10">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-3">
                 <div className="h-px w-6 bg-slate-800" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                   Orchestrator
                 </p>
              </div>
              <NavItems pathname={pathname} />
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-white/5 pt-8 px-2 relative z-10">
          <div className="group relative p-1 rounded-[30px] bg-gradient-to-br from-white/10 to-transparent transition-all hover:bg-white/5">
            <div className="flex items-center gap-4 p-4 rounded-[29px] bg-[#0f172a]/50 backdrop-blur-3xl border border-white/5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white shadow-2xl border border-white/10 group-hover:border-primary/50 transition-colors">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-black text-white tracking-tight">
                  {user.name?.split(' ')[0] || "Admin"}
                </p>
                <p className="truncate text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">
                  Lead Admin
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent transition-all duration-300"
          >
            <LogOutIcon className="h-4 w-4" />
            De-authenticate
          </button>
        </div>
      </aside>

      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 px-4 py-4 lg:hidden backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <AppMark hideText inverse className="scale-50" />
              </div>
              <span className="text-[16px] font-bold text-white">ruroxz</span>
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl border border-white/10 text-white bg-white/5"
            >
              {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
          {mobileOpen && (
            <div className="mt-4 py-6 border-t border-white/5 h-screen bg-background">
              <div className="space-y-8">
                <NavItems pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                <button onClick={handleSignOut} className="flex items-center gap-2 px-4 text-red-400 text-[14px] font-bold">
                  <LogOutIcon className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </header>
 
        <main className="flex-1 bg-background relative overflow-hidden group/main">
          {/* Digital Blueprint Visualization */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {/* Dynamic Mesh Grid */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-100%,rgba(59,130,246,0.3),transparent_60%)]" />
             <div className="absolute inset-0 page-shell opacity-[0.8]" />
             
             {/* Animated Node Circles */}
             <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-[120px] animate-pulse" />
             <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[160px] animate-pulse [animation-delay:1s]" />
             
             {/* Architectural Technical Lines */}
             <div className="absolute top-0 left-1/4 w-px h-full bg-white/[0.03] shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
             <div className="absolute top-0 left-2/4 w-px h-full bg-white/[0.03] shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
             <div className="absolute top-0 left-3/4 w-px h-full bg-white/[0.03] shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
             
             <div className="absolute top-1/4 left-0 w-full h-px bg-white/[0.02]" />
             <div className="absolute top-2/4 left-0 w-full h-px bg-white/[0.02]" />
             <div className="absolute top-3/4 left-0 w-full h-px bg-white/[0.02]" />
             
             {/* Technical Callout */}
             <div className="absolute bottom-12 right-12 flex flex-col items-end gap-2 opacity-10">
                <div className="h-0.5 w-24 bg-white" />
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white italic">Institutional Core // v4.2.0</p>
             </div>
          </div>
          
          <div className="mx-auto max-w-[1400px] relative z-10 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
