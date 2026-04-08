"use client";

import { useState } from "react";
import { api, authHeaders } from "@/lib/api";
import { RequireAdmin } from "@/components/RequireAdmin";

const states = ["UNDER_REVIEW", "APPROVED_DEPARTMENT", "APPROVED_DEAN", "REGISTERED"];

function ApprovalInner() {
  const [documentId, setDocumentId] = useState("");
  const [status, setStatus] = useState(states[0]);
  const [message, setMessage] = useState("");

  async function submit() {
    try {
      const res = await api.post(
        `/documents/${documentId}/transition`,
        { toStatus: status },
        { headers: authHeaders() },
      );
      setMessage(`Статус обновлен: ${res.data.status}`);
    } catch {
      setMessage("Ошибка обновления");
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 bg-white dark:bg-[#0a0a0a] min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Согласование (legacy transition)</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Предпочтительно использовать «Админ» с отдельными кнопками этапов.
      </p>
      <div className="panel space-y-3 p-6">
        <input
          className="w-full border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          style={{ borderRadius: 6 }}
          placeholder="Document ID"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
        />
        <select
          className="w-full border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
          style={{ borderRadius: 6 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="button" className="btn-primary" onClick={submit}>
          Подтвердить этап
        </button>
      </div>
      {message && <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>}
    </main>
  );
}

export default function ApprovalPage() {
  return (
    <RequireAdmin>
      <ApprovalInner />
    </RequireAdmin>
  );
}
