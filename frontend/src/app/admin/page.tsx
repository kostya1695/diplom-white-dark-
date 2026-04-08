"use client";

import { useState } from "react";
import { api, authHeaders } from "@/lib/api";
import { RequireAdmin } from "@/components/RequireAdmin";

function AdminInner() {
  const [documentId, setDocumentId] = useState("");
  const [wallet, setWallet] = useState("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  const [message, setMessage] = useState("");

  const id = documentId.trim();
  const base = id ? `/documents/${id}` : "";
  const disabled = !id;

  async function call(path: string, body?: object) {
    setMessage("…");
    try {
      const res = await api.post(path, body ?? {}, { headers: authHeaders() });
      setMessage(JSON.stringify(res.data, null, 2));
    } catch (e: unknown) {
      const err = e as { response?: { data?: unknown }; message?: string };
      setMessage(JSON.stringify(err.response?.data ?? err.message ?? e, null, 2));
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Админ-панель этапов</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        UUID документа из списка или после загрузки. Нужен JWT в{" "}
        <code className="text-xs">localStorage.token</code>.
      </p>
      <input
        className="panel w-full px-3 py-2 text-sm"
        placeholder="Document ID"
        value={documentId}
        onChange={(e) => setDocumentId(e.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          disabled={disabled}
          onClick={() => call(`${base}/approve/department`)}
        >
          Подтвердить (Кафедра)
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={disabled}
          onClick={() => call(`${base}/approve/deanery`)}
        >
          Подтвердить (Деканат)
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={disabled}
          onClick={() => call(`${base}/register`)}
        >
          Зарегистрировать в блокчейне
        </button>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-gray-500 dark:text-gray-400">Адрес кошелька студента (0x…)</label>
        <input
          className="panel w-full px-3 py-2 text-sm"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
        <button
          type="button"
          className="btn-ghost"
          disabled={disabled}
          onClick={() => call(`${base}/assign-owner`, { walletAddress: wallet })}
        >
          Привязать к студенту
        </button>
      </div>
      {message && (
        <pre className="panel max-h-96 overflow-auto p-4 text-xs text-gray-500 dark:text-gray-400">{message}</pre>
      )}
    </main>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminInner />
    </RequireAdmin>
  );
}
