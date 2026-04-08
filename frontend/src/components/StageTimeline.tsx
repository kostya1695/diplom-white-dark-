import { Check, Circle, CircleDot, SkipForward } from "lucide-react";
import type { DocumentRecord } from "./stageTypes";

const STAGES: { title: string; description: string; optional?: boolean }[] = [
  {
    title: "Фиксация и блокировка",
    description: "Загрузка PDF, UUID, хэш SHA-256, событие в блокчейне",
  },
  {
    title: "ИИ-аудит",
    description: "Автоматическая проверка (бета)",
    optional: true,
  },
  {
    title: "Экспертное подтверждение",
    description: "Кафедра → деканат, каждый шаг в блокчейне",
  },
  {
    title: "Регистрация в реестре",
    description: "Финальная запись смарт-контракта",
  },
  {
    title: "Владелец и верификация",
    description: "Привязка к кошельку, QR, публичная проверка",
  },
];

function stageState(
  index: number,
  doc: Pick<DocumentRecord, "status" | "currentStage" | "aiCheckStatus">,
): "complete" | "active" | "pending" | "skipped" {
  const stageNum = index + 1;
  if (stageNum < doc.currentStage) return "complete";
  if (stageNum === doc.currentStage) return "active";
  if (index === 1 && doc.aiCheckStatus === "skipped") return "skipped";
  return "pending";
}

export function StageTimeline({ document: doc }: { document: DocumentRecord }) {
  return (
    <div className="panel p-6 space-y-4">
      <h3 className="text-lg font-semibold">Этапы обработки</h3>
      <ol className="space-y-4">
        {STAGES.map((s, i) => {
          const state = stageState(i, doc);
          const isAccent = state === "active";
          return (
            <li
              key={s.title}
              className="flex gap-3 border-l pl-4"
              style={{
                borderColor: isAccent ? "var(--accent)" : "var(--border)",
              }}
            >
              <div className="-ml-[21px] mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border bg-[var(--background)]"
                style={{ borderColor: "var(--border)" }}
              >
                {state === "complete" && (
                  <Check className="h-4 w-4" style={{ color: "var(--success)" }} />
                )}
                {state === "active" && (
                  <CircleDot className="h-4 w-4" style={{ color: "var(--accent)" }} />
                )}
                {state === "pending" && (
                  <Circle className="h-4 w-4 text-[var(--muted)]" />
                )}
                {state === "skipped" && (
                  <SkipForward className="h-4 w-4 text-[var(--muted)]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {i + 1}. {s.title}
                  </span>
                  {s.optional && (
                    <span className="rounded-[6px] border px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      Скоро
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted)]">{s.description}</p>
                {i === 0 && doc.hashPreview && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Хэш: {doc.hashPreview}…
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
