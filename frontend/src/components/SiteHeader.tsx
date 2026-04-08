"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";

const publicLinks = [{ href: "/", label: "Главная" }];

const verifyLink = { href: "/verify", label: "Проверка" };

const adminLinks = [
  { href: "/documents", label: "Документы" },
  { href: "/upload", label: "Загрузка" },
  { href: "/admin", label: "Админ" },
];

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, ready, logout } = useAuth();
  const isDark = resolvedTheme === "dark";

  const navLinks = [
    ...publicLinks,
    verifyLink,
    ...(ready && user?.role === "ADMIN" ? adminLinks : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="text-sm font-bold text-gray-900 dark:text-white">
          blockchain-diplom
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex min-h-[36px] shrink-0 items-center gap-2 sm:gap-3">
          {!ready ? (
            <span className="text-sm text-gray-500 dark:text-gray-400">…</span>
          ) : user ? (
            <div className="inline-flex items-center gap-2">
              <span className="max-w-56 truncate text-sm text-gray-500 dark:text-gray-400" title={user.email}>
                {user.email}
              </span>
              <Link href="/profile" className="border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md py-1.5 px-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                Профиль
              </Link>
              <button
                type="button"
                className="border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md py-1.5 px-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={logout}
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2">
              <Link href="/login" className="border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md py-1.5 px-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                Вход
              </Link>
              <Link href="/login?tab=register" className="border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md py-1.5 px-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                Регистрация
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-white"
            aria-label="Тема"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
