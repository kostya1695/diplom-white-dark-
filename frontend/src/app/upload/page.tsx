"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { api, authHeaders } from "@/lib/api";
import { RequireAdmin } from "@/components/RequireAdmin";
import { DocumentStatusBadge } from "@/components/DocumentStatusBadge";
import type { DocumentRecord } from "@/components/stageTypes";

/** Ответ POST /documents/upload (поля из backend toResponse) */
type UploadSuccessState = {
  documentId: string;
  status: string;
};

function statusDescription(status: string): string {
  switch (status) {
    case "PENDING":
      return "Ожидает проверки кафедры";
    case "KAFEDRA_APPROVED":
      return "Ожидает проверки деканата";
    case "DEKANAT_APPROVED":
      return "Согласован деканатом";
    case "REJECTED":
      return "Отклонён";
    default:
      return status;
  }
}

function UploadForm() {
  const [success, setSuccess] = useState<UploadSuccessState | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (file) fd.set("file", file);
    setLoading(true);
    setUploadError(null);
    setSuccess(null);
    try {
      const res = await api.post("/documents/upload", fd, {
        headers: { ...authHeaders() },
      });
      setSuccess({
        documentId: res.data.documentId as string,
        status: res.data.status as string,
      });
      form.reset();
      setFile(null);
    } catch {
      setUploadError("Ошибка загрузки (нужен JWT администратора)");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 pt-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Загрузка диплома</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Форма загрузки PDF-документа</p>
      <form className="surface mt-8 space-y-4 rounded-lg border border-gray-200 p-6 dark:border-gray-800" onSubmit={handleSubmit}>
        <input
          name="studentFullName"
          placeholder="ФИО"
          className="border border-gray-300 rounded-md px-3 py-2 w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
          required
        />
        <input
          name="studentCode"
          placeholder="ID студента"
          className="border border-gray-300 rounded-md px-3 py-2 w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
          required
        />
        <input
          name="specialty"
          placeholder="Специальность"
          className="border border-gray-300 rounded-md px-3 py-2 w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
          required
        />
        <select
          name="year"
          className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
          required
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
          <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M12 4l-4 4m4-4l4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Перетащите PDF-файл сюда или нажмите для выбора</p>
          <input type="file" name="file" accept="application/pdf" className="hidden" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        {file && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{file.name}</p>}
        <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium rounded-md py-2 px-4 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center">
          {loading && <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"/><path d="M22 12a10 10 0 0 1-10 10" fill="currentColor" className="opacity-75"/></svg>}
          Отправить
        </button>
      </form>

      {uploadError && (
        <div
          className="mt-6 rounded-lg border border-red-200/90 bg-red-50/50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300/95"
          role="alert"
        >
          {uploadError}
        </div>
      )}

      {success && (
        <div
          className="mt-6 rounded-lg border border-gray-200 bg-gray-50/90 px-5 py-5 dark:border-gray-700 dark:bg-[#141414]/90"
          role="status"
        >
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Документ успешно загружен
          </h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-500">
                ID документа
              </p>
              <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400 break-all">
                {success.documentId}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-500">
                Статус
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <DocumentStatusBadge status={success.status as DocumentRecord["status"]} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {statusDescription(success.status)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/documents/${success.documentId}`}
              className="inline-flex items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Перейти к документу
            </Link>
            <Link
              href="/documents"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-[#1a1a1a] dark:text-gray-200 dark:hover:bg-gray-800"
            >
              К списку документов
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function UploadPage() {
  return (
    <RequireAdmin>
      <UploadForm />
    </RequireAdmin>
  );
}
