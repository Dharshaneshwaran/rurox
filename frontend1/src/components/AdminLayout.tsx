"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, clear } = useAuth({
    role: "ADMIN",
    redirectTo: "/admin/login",
  });
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Substitutions", href: "/admin/substitutions", icon: "🔁" },
    { label: "Users", href: "/admin/users", icon: "👥" },
  ];

  if (!user) {
    return null; // Let the hook redirect
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#f8f5f1_0%,_#f0efe8_45%,_#e8e3d8_100%)]">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 flex-shrink-0 border-r border-zinc-200 bg-white/80 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className="flex h-full flex-col px-6 py-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
              Admin Portal
            </p>
            <h2 className="mt-2 text-xl font-bold text-zinc-900 leading-tight">
              Smart Teacher<br />System
            </h2>
          </div>

          <nav className="flex flex-col gap-2 flex-grow">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-amber-100/50 text-amber-900 shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-zinc-200 pt-6">
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 font-bold text-white">
                {user.name?.charAt(0) || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold text-zinc-900">
                  {user.name}
                </p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                clear();
                window.location.href = "/";
              }}
              className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-red-50 hover:text-red-700"
            >
              <span className="text-lg transition-transform group-hover:-translate-x-1">🚪</span>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
