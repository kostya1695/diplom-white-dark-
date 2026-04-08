"use client";

import { useEffect, useState } from "react";
import { api, authHeaders } from "@/lib/api";
import { DocumentStatusBadge } from "@/components/DocumentStatusBadge";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";

type Doc = {
  documentId: string;
  studentFullName: string;
  specialty: string;
  status: string;
  createdAt: string;
};

type DocEvent = {
  id: string;
  eventType: string;
  actorEmail?: string;
  txHash?: string;
  comment?: string;
  createdAt: string;
};

function DocumentsList() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [events, setEvents] = useState<DocEvent[]>([]);
  const [eventsDocId, setEventsDocId] = useState<string | null>(null);
  const { user } = useAuth();

  function reload() {
    api
      .get("/documents", { headers: authHeaders() })
      .then((r) => setDocs(r.data))
      .catch(() => setDocs([]));
  }

  useEffect(() => {
    reload();
  }, []);

  async function approve(documentId: string) {
    setLoadingId(documentId);
    try {
      await api.post(`/documents/${documentId}/approve`, { comment: "" }, { headers: authHeaders() });
      reload();
    } finally {
      setLoadingId(null);
    }
  }

  async function reject(documentId: string) {
    const reason = window.prompt("Причина отклонения") ?? "";
    setLoadingId(documentId);
    try {
      await api.post(`/documents/${documentId}/reject`, { reason }, { headers: authHeaders() });
      reload();
    } finally {
      setLoadingId(null);
    }
  }

  async function openHistory(documentId: string) {
    const res = await api.get(`/documents/${documentId}/events`, { headers: authHeaders() });
    setEvents(res.data);
    setEventsDocId(documentId);
  }

  function dotClass(eventType: string) {
    if (eventType === "KAFEDRA_APPROVED") return "bg-blue-500";
    if (eventType === "DEKANAT_APPROVED") return "bg-green-500";
    if (eventType === "REJECTED") return "bg-red-500";
    return "bg-gray-400";
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 lg:px-8 pt-12 bg-white dark:bg-[#0a0a0a] min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Документы</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Список загруженных документов и этапы согласования</p>
      <div className="mt-8 border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-[#111111] overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400">
              <th className="px-5 py-4 whitespace-nowrap">Документ</th>
              <th className="px-5 py-4 whitespace-nowrap">Студент</th>
              <th className="px-5 py-4 whitespace-nowrap">Специальность</th>
              <th className="px-5 py-4 whitespace-nowrap">Статус</th>
              <th className="px-5 py-4 whitespace-nowrap">Дата загрузки</th>
              <th className="px-5 py-4 whitespace-nowrap">Действия</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => {
              const canKafedra = user?.role === "KAFEDRA" && d.status === "PENDING";
              const canDekanat = user?.role === "DEKANAT" && d.status === "KAFEDRA_APPROVED";
              const busy = loadingId === d.documentId;
              return (
                <tr key={d.documentId} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-5 py-4 min-h-[60px] align-middle text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="block whitespace-nowrap overflow-hidden text-ellipsis" title={d.documentId}>{d.documentId}</span>
                  </td>
                  <td className="px-5 py-4 min-h-[60px] align-middle text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="block whitespace-nowrap overflow-hidden text-ellipsis" title={d.studentFullName}>{d.studentFullName}</span>
                  </td>
                  <td className="px-5 py-4 min-h-[60px] align-middle text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="block whitespace-nowrap overflow-hidden text-ellipsis" title={d.specialty}>{d.specialty}</span>
                  </td>
                  <td className="px-5 py-4 min-h-[60px] align-middle whitespace-nowrap"><DocumentStatusBadge status={d.status} /></td>
                  <td className="px-5 py-4 min-h-[60px] align-middle text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="block whitespace-nowrap overflow-hidden text-ellipsis">{new Date(d.createdAt).toLocaleString("ru-RU")}</span>
                  </td>
                  <td className="px-5 py-4 min-h-[60px] align-middle whitespace-nowrap">
                    <div className="flex gap-2">
                      {(canKafedra || canDekanat) && (
                        <>
                          <button disabled={busy} onClick={() => approve(d.documentId)} className="border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-md py-1.5 px-3 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20">Одобрить</button>
                          <button disabled={busy} onClick={() => reject(d.documentId)} className="border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-md py-1.5 px-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20">Отклонить</button>
                        </>
                      )}
                      <button
                        onClick={() => openHistory(d.documentId)}
                        className="rounded-lg border border-[rgba(59,130,246,0.4)] bg-transparent px-3 py-1.5 text-sm text-[#3b82f6] shadow-none transition-colors hover:border-[#3b82f6] hover:bg-[rgba(59,130,246,0.08)] active:bg-[rgba(59,130,246,0.15)] dark:text-[rgba(59,130,246,0.9)] dark:hover:bg-[rgba(59,130,246,0.1)] dark:active:bg-[rgba(59,130,246,0.18)]"
                      >
                        История
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {eventsDocId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-[#111111] max-w-lg w-full relative">
            <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setEventsDocId(null)}>✕</button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">История: {eventsDocId}</h2>
            <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-3 pl-4 space-y-5">
              {events.map((e) => (
                <div key={e.id} className="flex">
                  <div className={`w-3 h-3 rounded-full -ml-[22px] mr-3 mt-1 flex-shrink-0 ${dotClass(e.eventType)}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{e.eventType}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{e.actorEmail ?? "system"}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(e.createdAt).toLocaleString("ru-RU")}</p>
                    {e.txHash && <p className="text-xs text-gray-500 dark:text-gray-400">tx: {`${e.txHash.slice(0, 6)}...${e.txHash.slice(-4)}`}</p>}
                    {e.comment && <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">{e.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function DocumentsPage() {
  return (
    <RequireAuth>
      <DocumentsList />
    </RequireAuth>
  );
}
