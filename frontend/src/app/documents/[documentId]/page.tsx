"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, authHeaders } from "@/lib/api";
import { StageTimeline } from "@/components/StageTimeline";
import { DocumentStatusBadge } from "@/components/DocumentStatusBadge";
import type { DocumentRecord } from "@/components/stageTypes";
import { RequireAdmin } from "@/components/RequireAdmin";

function DocumentDetailInner() {
  const params = useParams();
  const documentId = params.documentId as string;
  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;
    api
      .get(`/documents/${documentId}`, { headers: authHeaders() })
      .then((r) => setDoc(r.data))
      .catch(() => setError("Не удалось загрузить документ (нужен JWT?)"));
  }, [documentId]);

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
        <p className="text-[var(--danger)]">{error}</p>
        <Link href="/documents" className="mt-4 inline-block text-[var(--accent)]">
          К списку
        </Link>
      </main>
    );
  }

  if (!doc) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
        <p className="text-gray-500 dark:text-gray-400">Загрузка…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Документ</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{doc.documentId}</h1>
        </div>
        <DocumentStatusBadge status={doc.status} />
      </div>
      <div className="panel p-6 space-y-2 text-sm">
        <p>
          <span className="text-[var(--muted)]">Студент:</span> {doc.studentFullName}
        </p>
        <p>
          <span className="text-[var(--muted)]">Специальность:</span> {doc.specialty}
        </p>
        <p>
          <span className="text-[var(--muted)]">Год:</span> {doc.year}
        </p>
        <p>
          <span className="text-[var(--muted)]">ИИ-аудит:</span> {doc.aiCheckStatus}
        </p>
        {doc.ownerWalletAddress && (
          <p>
            <span className="text-[var(--muted)]">Кошелёк:</span> {doc.ownerWalletAddress}
          </p>
        )}
      </div>
      <StageTimeline document={doc} />
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        Действия администратора →
      </Link>
    </main>
  );
}

export default function DocumentDetailPage() {
  return (
    <RequireAdmin>
      <DocumentDetailInner />
    </RequireAdmin>
  );
}
