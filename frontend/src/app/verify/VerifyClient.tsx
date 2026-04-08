"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { StageTimeline } from "@/components/StageTimeline";
import type { DocumentRecord } from "@/components/stageTypes";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type VerifyResult = DocumentRecord & {
  calculatedHash: string;
  hashMatches: boolean;
  blockchainVerified: boolean;
  authentic: boolean;
  verificationMessage: string;
};

function shortAddr(a: string) {
  if (!a || a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function VerifyClient() {
  const search = useSearchParams();
  const [documentId, setDocumentId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    const q = search.get("documentId");
    if (q) setDocumentId(q);
  }, [search]);

  async function verify() {
    if (!file || !documentId) return;
    const form = new FormData();
    form.append("file", file);
    const res = await axios.post(`${apiBase}/documents/${documentId}/verify`, form);
    setResult(res.data as VerifyResult);
  }

  return (
    <main className="mx-auto max-w-3xl min-h-screen space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Проверка диплома</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Загрузите PDF — хэш сравнивается с записью в реестре.
        </p>
      </div>

      <div className="panel space-y-3 p-6">
        <input
          className="w-full border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none"
          style={{ borderRadius: 6 }}
          placeholder="Document ID"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
        />
        <input
          type="file"
          accept="application/pdf"
          className="w-full text-sm text-[var(--muted)]"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="button" className="btn-primary" onClick={verify} disabled={!file || !documentId}>
          Проверить
        </button>
      </div>

      {result && (
        <>
          <div
            className="panel border p-4 text-center text-sm font-semibold"
            style={{
              borderColor: result.authentic ? "var(--success)" : "var(--danger)",
              color: result.authentic ? "var(--success)" : "var(--danger)",
              background: "var(--surface)",
            }}
          >
            {result.verificationMessage}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel flex flex-col items-center justify-center gap-3 p-6">
              <p className="text-sm text-[var(--muted)]">QR проверки</p>
              {result.qrVerificationUrl ? (
                <QRCodeSVG value={result.qrVerificationUrl} size={160} />
              ) : (
                <p className="text-xs text-[var(--muted)]">QR будет после регистрации</p>
              )}
            </div>
            <div className="panel space-y-2 p-6 text-sm">
              <p>
                <span className="text-[var(--muted)]">Хэш совпал:</span>{" "}
                {result.hashMatches ? "да" : "нет"}
              </p>
              <p>
                <span className="text-[var(--muted)]">Блокчейн:</span>{" "}
                {result.blockchainVerified ? "подтверждён" : "нет / контракт не задан"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">События в блокчейне</h2>
            <div className="panel divide-y" style={{ borderColor: "var(--border)" }}>
              {(result.blockchainEvents ?? []).length === 0 && (
                <p className="p-4 text-sm text-[var(--muted)]">Нет записанных событий</p>
              )}
              {(result.blockchainEvents ?? []).map((ev) => (
                <div key={`${ev.txHash}-${ev.timestamp}`} className="grid gap-1 p-4 text-sm md:grid-cols-3">
                  <span className="font-mono text-xs text-[var(--muted)]">{shortAddr(ev.actor)}</span>
                  <span>{ev.actionType}</span>
                  <span className="text-[var(--muted)]">
                    {new Date(ev.timestamp).toLocaleString("ru-RU")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <StageTimeline document={result} />
        </>
      )}
    </main>
  );
}
