"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { LogoutIcon } from "./icons";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "📊",
  },
  {
    label: "Substitutions",
    href: "/admin/substitutions",
    icon: "🔄",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "👥",
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

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 w-full",
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-slate-100 text-slate-900 hover:bg-slate-200"
            )}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <span className="font-medium text-slate-900">{item.label}</span>
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 lg:grid lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col gap-8 px-6 py-8">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            R
          </div>
          <span className="font-bold text-lg text-slate-900">Ruroxz</span>
        </Link>

        {/* Nav */}
        <div className="flex-1">
          <NavItems pathname={pathname} />
        </div>

        {/* User Profile */}
        <div className="border-t border-slate-200 pt-8">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate text-sm">{user.name}</p>
              <p className="text-xs text-slate-700 font-semibold truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LogoutIcon className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
