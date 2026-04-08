"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  authCardClass,
  authFieldClass,
  authTabBtn,
  authTitleClass,
} from "@/components/auth/authStyles";

type Tab = "login" | "register";

function AuthPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = search.get("tab");
    if (t === "register") setTab("register");
    else setTab("login");
  }, [search]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.accessToken, data.user);
      const next = search.get("next") || "/";
      router.push(next);
    } catch {
      setError("Неверный email или пароль");
    }
  }

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        fullName,
      });
      login(data.accessToken, data.user);
      router.push("/");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data
              ?.message
          : undefined;
      setError(
        Array.isArray(msg) ? msg.join(", ") : (msg as string) ?? "Не удалось зарегистрироваться",
      );
    }
  }

  return (
    <main className="mx-auto max-w-2xl min-h-screen px-6 pt-12">
      <div className={authCardClass}>
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            className={authTabBtn(tab === "login")}
            onClick={() => {
              setTab("login");
              router.replace("/login");
            }}
          >
            Вход
          </button>
          <button
            type="button"
            className={authTabBtn(tab === "register")}
            onClick={() => {
              setTab("register");
              router.replace("/login?tab=register");
            }}
          >
            Регистрация
          </button>
        </div>

        <h1 className={authTitleClass}>{tab === "login" ? "Вход" : "Регистрация"}</h1>

        {tab === "login" ? (
          <form className="space-y-4" onSubmit={onLogin}>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className={authFieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Пароль</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className={authFieldClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium rounded-md py-2 px-4 transition-colors w-full">
              Войти
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={onRegister}>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">ФИО</label>
              <input
                required
                autoComplete="name"
                className={authFieldClass}
                placeholder="Иванов Иван"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className={authFieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Пароль</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={authFieldClass}
                placeholder="Не короче 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium rounded-md py-2 px-4 transition-colors w-full">
              Зарегистрироваться
            </button>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              После регистрации вы получите роль «STUDENT».
            </p>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            На главную
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-10 text-center text-sm text-gray-500 dark:text-gray-400">Загрузка…</main>}>
      <AuthPageInner />
    </Suspense>
  );
}
