"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { api } from "@/lib/api";
import { StageTimeline } from "@/components/StageTimeline";
import { DocumentStatusBadge } from "@/components/DocumentStatusBadge";
import type { DocumentRecord } from "@/components/stageTypes";

type FullVerifyResult = DocumentRecord & {
  calculatedHash: string;
  hashMatches: boolean;
  blockchainVerified: boolean;
  authentic: boolean;
  verificationMessage: string;
};

type PublicLookupResult = DocumentRecord & {
  lookupById: true;
  verificationMessage: string;
  calculatedHash: null;
  hashMatches: null;
  blockchainVerified: null;
  authentic: null;
};

type VerifyOutcome = FullVerifyResult | PublicLookupResult;

type VerifyTab = "file" | "id";

function isLookupOnly(r: VerifyOutcome): r is PublicLookupResult {
  return "lookupById" in r && r.lookupById === true;
}

function shortAddr(a: string) {
  if (!a || a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function parseAxiosMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string | string[] } } };
  const m = e.response?.data?.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  return "Не удалось выполнить запрос";
}

type ChecksDisplay =
  | { kind: "lookup"; hash: string; chain: string }
  | { kind: "full"; qrUrl: string | null | undefined; hash: string; chain: string };

function verifyChecksDisplay(r: VerifyOutcome): ChecksDisplay {
  if (isLookupOnly(r)) {
    return { kind: "lookup", hash: "не выполнялась", chain: "нет данных" };
  }
  return {
    kind: "full",
    qrUrl: r.qrVerificationUrl,
    hash: r.hashMatches ? "да" : "нет",
    chain: r.blockchainVerified ? "подтверждён" : "нет / контракт не задан",
  };
}

function VerifyResultSection({ result }: { result: VerifyOutcome }) {
  const lookup = isLookupOnly(result);
  const checks = verifyChecksDisplay(result);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gray-50/90 px-5 py-5 dark:border-gray-700 dark:bg-[#141414]/90">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{result.verificationMessage}</p>
        <div className="mt-4 grid gap-3 text-sm">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-500">
              ID документа
            </span>
            <p className="mt-1 font-mono text-gray-800 dark:text-gray-200 break-all">{result.documentId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-500">
              Статус
            </span>
            <DocumentStatusBadge status={result.status as DocumentRecord["status"]} />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-500">ФИО</span>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              {result.studentFullName?.trim() ? result.studentFullName : "—"}
            </p>
          </div>
        </div>
        {lookup && (
          <p className="mt-4 border-t border-gray-200 pt-4 text-sm leading-relaxed text-gray-600 dark:border-gray-700 dark:text-gray-400">
            Проверка выполнена по ID. Для полной проверки загрузите документ.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl p-6">
          <p className="text-sm text-[var(--muted)]">QR проверки</p>
          {checks.kind === "lookup" ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">не выполнялась</p>
          ) : checks.qrUrl ? (
            <QRCodeSVG value={checks.qrUrl} size={160} />
          ) : (
            <p className="text-center text-xs text-[var(--muted)]">QR будет после регистрации</p>
          )}
        </div>
        <div className="surface flex flex-col justify-center space-y-3 rounded-xl p-6 text-sm">
          <p>
            <span className="text-[var(--muted)]">Сверка хэша:</span>{" "}
            <span className="text-gray-800 dark:text-gray-200">{checks.hash}</span>
          </p>
          <p>
            <span className="text-[var(--muted)]">Блокчейн:</span>{" "}
            <span className="text-gray-800 dark:text-gray-200">{checks.chain}</span>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">События в блокчейне</h2>
        <div className="panel divide-y rounded-xl" style={{ borderColor: "var(--border)" }}>
          {(result.blockchainEvents ?? []).length === 0 && (
            <p className="p-4 text-sm text-[var(--muted)]">Нет записанных событий</p>
          )}
          {(result.blockchainEvents ?? []).map((ev) => (
            <div key={`${ev.txHash}-${ev.timestamp}`} className="grid gap-1 p-4 text-sm md:grid-cols-3">
              <span className="font-mono text-xs text-[var(--muted)]">{shortAddr(ev.actor)}</span>
              <span>{ev.actionType}</span>
              <span className="text-[var(--muted)]">{new Date(ev.timestamp).toLocaleString("ru-RU")}</span>
            </div>
          ))}
        </div>
      </div>

      <StageTimeline document={result} />
    </div>
  );
}

export function VerifyClient() {
  const search = useSearchParams();
  const [tab, setTab] = useState<VerifyTab>("file");
  const [documentIdInput, setDocumentIdInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerifyOutcome | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [loadingId, setLoadingId] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);

  useEffect(() => {
    const q = search.get("documentId");
    if (q) {
      setDocumentIdInput(q);
      setTab("id");
    }
  }, [search]);

  useEffect(() => {
    setResult(null);
    setFileError(null);
    setIdError(null);
  }, [tab]);

  async function verifyByFile() {
    if (!file) {
      setFileError("Выберите PDF-файл");
      return;
    }
    setLoadingFile(true);
    setFileError(null);
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await api.post<FullVerifyResult>("/documents/verify-file", form);
      setResult(res.data);
    } catch (e) {
      setFileError(parseAxiosMessage(e));
      setResult(null);
    } finally {
      setLoadingFile(false);
    }
  }

  async function verifyById() {
    const id = documentIdInput.trim();
    if (!id) {
      setIdError("Введите ID документа");
      return;
    }
    setLoadingId(true);
    setIdError(null);
    setResult(null);
    try {
      const res = await api.get<PublicLookupResult>(`/documents/public/${encodeURIComponent(id)}`);
      setResult(res.data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        setIdError("Документ с таким ID в системе не найден");
      } else {
        setIdError(parseAxiosMessage(e));
      }
      setResult(null);
    } finally {
      setLoadingId(false);
    }
  }

  const tabClass = (active: boolean) =>
    [
      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "text-blue-600 underline decoration-blue-600 decoration-2 underline-offset-8 dark:text-blue-400 dark:decoration-blue-400"
        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
    ].join(" ");

  return (
    <main className="mx-auto max-w-3xl min-h-screen space-y-8 px-4 py-10 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Проверка документа
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Загрузите документ или введите ID
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/40 dark:border-gray-800 dark:bg-[#141414]/40">
        <div className="border-b border-gray-200 px-5 pt-3 dark:border-gray-800">
          <div className="inline-flex gap-1" role="tablist" aria-label="Способ проверки">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "file"}
              id="tab-file"
              className={tabClass(tab === "file")}
              onClick={() => setTab("file")}
            >
              По файлу
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "id"}
              id="tab-id"
              className={tabClass(tab === "id")}
              onClick={() => setTab("id")}
            >
              По ID
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4" role="tabpanel" aria-labelledby={tab === "file" ? "tab-file" : "tab-id"}>
          {tab === "file" ? (
            <div className="mx-auto max-w-lg space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PDF сопоставляется с записью в реестре по содержимому (хэшу).
              </p>
              <label className="block w-full cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white/60 px-4 py-8 text-center transition-colors hover:border-blue-400/70 hover:bg-gray-50/90 dark:border-gray-600 dark:bg-[#1a1a1a]/60 dark:hover:border-blue-500/40 dark:hover:bg-white/[0.04]">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setFileError(null);
                  }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {file ? file.name : "Нажмите, чтобы выбрать PDF"}
                </span>
              </label>
              <button
                type="button"
                className="btn-primary w-full sm:max-w-xs"
                disabled={loadingFile || !file}
                onClick={() => void verifyByFile()}
              >
                {loadingFile ? "Проверка…" : "Проверить"}
              </button>
              {fileError && (
                <p
                  className="rounded-lg border border-gray-200 bg-gray-50/90 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-300"
                  role="status"
                >
                  {fileError}
                </p>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-lg space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Показать сведения о документе, если он есть в системе.
              </p>
              <label className="sr-only" htmlFor="verify-doc-id">
                ID документа
              </label>
              <input
                id="verify-doc-id"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#1a1a1a] dark:text-white dark:placeholder:text-gray-500"
                placeholder="UUID документа"
                value={documentIdInput}
                onChange={(e) => {
                  setDocumentIdInput(e.target.value);
                  setIdError(null);
                }}
              />
              <button
                type="button"
                className="btn-primary w-full sm:max-w-xs"
                disabled={loadingId || !documentIdInput.trim()}
                onClick={() => void verifyById()}
              >
                {loadingId ? "Проверка…" : "Проверить"}
              </button>
              {idError && (
                <p
                  className="rounded-lg border border-gray-200 bg-gray-50/90 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-300"
                  role="status"
                >
                  {idError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {result && <VerifyResultSection result={result} />}
    </main>
  );
}
