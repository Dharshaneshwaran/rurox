"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";

const STORAGE_KEY = "rurox-theme";

type ThemeMode = "modern" | "legacy";

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.remove("theme-modern", "theme-legacy");
  document.documentElement.classList.add(mode === "legacy" ? "theme-legacy" : "theme-modern");
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("modern");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const resolved: ThemeMode = saved === "legacy" ? "legacy" : "modern";
    setMode(resolved);
    applyTheme(resolved);
    setReady(true);
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = mode === "modern" ? "legacy" : "modern";
    setMode(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-[100]">
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleTheme}
        className="border-border/90 bg-surface/92 px-4 shadow-[0_18px_45px_-24px_rgba(24,49,45,0.28)] backdrop-blur-md"
      >
        {mode === "modern" ? "Switch to Old Colour" : "Switch to New Colour"}
      </Button>
    </div>
  );
}
