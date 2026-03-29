import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const headlineFont = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Smart Teacher Assignment System",
    template: "%s | Smart Teacher Assignment System",
  },
  description:
    "Manage teacher timetables, substitutions, approvals, and special classes in a polished scheduling workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headlineFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full font-body text-on-surface">
        <div className="flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
