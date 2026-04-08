"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, authHeaders } from "@/lib/api";
import { RequireAuth } from "@/components/RequireAuth";
import { DocumentStatusBadge } from "@/components/DocumentStatusBadge";

type ProfileDoc = {
  documentId: string;
  studentFullName: string;
  status: string;
  createdAt: string;
};

type Profile = {
  email: string;
  fullName: string;
  role: string;
  walletAddress?: string;
  createdAt: string;
  documents: ProfileDoc[];
};

function ProfileInner() {
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/auth/me", { headers: authHeaders() })
      .then((r) => setData(r.data))
      .catch(() => setError("Не удалось загрузить профиль"));
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 bg-white dark:bg-[#0a0a0a] min-h-screen">
        <p className="text-[var(--danger)]">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0a0a0a] min-h-screen">Загрузка…</main>
    );
  }

  const roleLabel = data.role === "ADMIN" ? "Администратор" : "Пользователь";
  const wallet = data.walletAddress ?? "";
  const walletShort = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "—";

  async function copyWallet() {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 space-y-8 bg-white dark:bg-[#0a0a0a] min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Профиль</h1>

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-[#111111] space-y-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <span className="text-sm text-blue-500 dark:text-blue-400">Email</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{data.email}</span>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <span className="text-sm text-blue-500 dark:text-blue-400">Имя</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{data.fullName}</span>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <span className="text-sm text-blue-500 dark:text-blue-400">Роль</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
            {data.role} — {roleLabel}
          </span>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <span className="text-sm text-blue-500 dark:text-blue-400">Кошелёк</span>
          <div className="relative group inline-flex items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{walletShort}</span>
            {wallet && (
              <>
                <span className="hidden group-hover:block absolute z-10 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap -top-8 right-0">
                  {wallet}
                </span>
                <button onClick={copyWallet} type="button" className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {copied ? "✓" : "⧉"}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <span className="text-sm text-blue-500 dark:text-blue-400">Дата регистрации</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{new Date(data.createdAt).toLocaleString("ru-RU")}</span>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Загруженные вами документы</h2>
        {data.documents.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Пока нет. Загрузка доступна администраторам в разделе «Загрузка».
          </p>
        ) : (
          <ul className="space-y-2">
            {data.documents.map((d) => (
              <li key={d.documentId}>
                <Link
                  href={`/documents/${d.documentId}`}
                  className="panel flex flex-wrap items-center justify-between gap-2 p-4 transition hover:border-[var(--accent)]"
                >
                  <div>
                    <p className="font-medium">{d.studentFullName}</p>
                    <p className="font-mono text-xs text-[var(--muted)]">{d.documentId}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(d.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <DocumentStatusBadge status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}
