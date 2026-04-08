"use client";

import { FormEvent, useState } from "react";
import { api, authHeaders } from "@/lib/api";
import { RequireAdmin } from "@/components/RequireAdmin";

function UploadForm() {
  const [message, setMessage] = useState("");
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
    try {
      const res = await api.post("/documents/upload", fd, {
        headers: { ...authHeaders() },
      });
      setMessage(`Документ успешно загружен. ID документа: ${res.data.documentId}. Ожидает проверки кафедры.`);
      form.reset();
      setFile(null);
    } catch {
      setMessage("Ошибка загрузки (нужен JWT администратора)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 pt-12 bg-white dark:bg-[#0a0a0a] min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Загрузка диплома</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Форма загрузки PDF-документа</p>
      <form className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-[#111111] space-y-4 mt-8" onSubmit={handleSubmit}>
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
      {message && <p className={`rounded-md p-4 text-sm mt-4 ${message.startsWith("Документ успешно") ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"}`}>{message}</p>}
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
