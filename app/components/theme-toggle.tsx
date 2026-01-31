"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vocab.theme";

const themes = [
  { value: "main", label: "Standard" },
  { value: "ui", label: "UI" },
  { value: "ui2", label: "UI2" }
] as const;

type ThemeValue = (typeof themes)[number]["value"];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeValue>("main");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeValue | null;
    const initial = stored && themes.some((item) => item.value === stored) ? stored : "main";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="no-print fixed right-4 top-4 z-50 flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[var(--bg-white)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--text-sub)]">
      <span className="hidden sm:inline">Thema</span>
      <select
        aria-label="Thema waehlen"
        className="bg-transparent text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-main)] outline-none"
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeValue)}
      >
        {themes.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
