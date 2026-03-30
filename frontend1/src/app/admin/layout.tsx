import type { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground transition-colors duration-500">
      {children}
    </div>
  );
}
