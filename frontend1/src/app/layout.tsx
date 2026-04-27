import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ruroxz — School ERP",
    template: "%s | ruroxz",
  },
  description:
    "Manage teacher timetables, substitutions, approvals, exams, attendance, and notices in one unified School ERP.",
};

import ThemeToggle from "@/components/ThemeToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full font-body">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
