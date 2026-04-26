"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLegacy, setIsLegacy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rurox-theme-legacy") === "true";
    setIsLegacy(saved);
    if (saved) {
      document.documentElement.classList.add("theme-legacy");
    }
  }, []);

  const toggleTheme = () => {
    const newVal = !isLegacy;
    setIsLegacy(newVal);
    localStorage.setItem("rurox-theme-legacy", String(newVal));
    if (newVal) {
      document.documentElement.classList.add("theme-legacy");
    } else {
      document.documentElement.classList.remove("theme-legacy");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-[9999] flex h-12 items-center gap-3 rounded-full bg-white px-5 text-[13px] font-bold text-gray-900 shadow-2xl border border-gray-200 transition-all hover:scale-105 active:scale-95"
    >
      <div className={`h-2.5 w-2.5 rounded-full ${isLegacy ? 'bg-[#346739]' : 'bg-[#4f46e5]'}`} />
      {isLegacy ? "Switch to Modern UI" : "Switch to Old UI"}
    </button>
  );
}
