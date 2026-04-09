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

function circleBorderClass(state: ReturnType<typeof stageState>) {
  if (state === "active") return "border-[var(--accent)]";
  return "border-[var(--border)]";
}

function titleClass(state: ReturnType<typeof stageState>) {
  if (state === "active") return "text-[var(--accent)]";
  if (state === "complete") return "text-[var(--foreground)]";
  return "text-[var(--muted)]";
}

export function StageTimeline({ document: doc }: { document: DocumentRecord }) {
  const lastIndex = STAGES.length - 1;

  return (
    <div className="panel p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Этапы обработки</h3>
      <ol className="mt-4 list-none p-0">
        {STAGES.map((s, i) => {
          const state = stageState(i, doc);
          const showConnector = i < lastIndex;

          return (
            <li
              key={s.title}
              className="grid grid-cols-[2rem_minmax(0,1fr)] items-stretch gap-x-3"
            >
              {/* Левая колонка: кружок + вертикальная линия по центру дорожки */}
              <div
                className={
                  showConnector
                    ? "flex h-full min-h-0 min-w-0 flex-col items-center"
                    : "flex min-w-0 flex-col items-center self-start"
                }
              >
                <div
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-[var(--background)] ${circleBorderClass(state)}`}
                >
                  {state === "complete" && (
                    <Check className="h-4 w-4 shrink-0" style={{ color: "var(--success)" }} />
                  )}
                  {state === "active" && (
                    <CircleDot className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
                  )}
                  {state === "pending" && <Circle className="h-4 w-4 shrink-0 text-[var(--muted)]" />}
                  {state === "skipped" && <SkipForward className="h-4 w-4 shrink-0 text-[var(--muted)]" />}
                </div>
                {showConnector && (
                  <div
                    className="mt-0 w-px flex-1 min-h-[0.75rem] bg-[var(--border)]"
                    aria-hidden
                  />
                )}
              </div>

              {/* Правая колонка: заголовок, бейдж, описание, опционально хэш */}
              <div
                className={`flex min-w-0 flex-col gap-1.5 ${i < lastIndex ? "pb-6" : ""}`}
              >
                <div className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className={`min-w-0 text-sm font-semibold leading-tight ${titleClass(state)}`}>
                    {i + 1}. {s.title}
                  </span>
                  {s.optional && (
                    <span className="inline-flex shrink-0 items-center rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium uppercase leading-none tracking-wide text-[var(--muted)]">
                      Скоро
                    </span>
                  )}
                </div>
                <p className="text-sm leading-snug text-[var(--muted)]">{s.description}</p>
                {i === 0 && doc.hashPreview && (
                  <p className="text-xs leading-snug text-[var(--muted)]">
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
