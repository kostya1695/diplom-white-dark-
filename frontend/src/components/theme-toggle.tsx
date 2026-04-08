"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <button
      className="border border-zinc-300 dark:border-zinc-800 px-3 py-2 text-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Переключить тему"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
