import type { DocumentRecord } from "./stageTypes";

const LABELS: Record<string, string> = {
  PENDING: "Ожидает",
  KAFEDRA_APPROVED: "Кафедра",
  DEKANAT_APPROVED: "Деканат",
  REJECTED: "Отклонён",
};

export function DocumentStatusBadge({ status }: { status: DocumentRecord["status"] }) {
  const label = LABELS[status] ?? status;
  const statusClass =
    status === "PENDING"
      ? "border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] text-[#3b82f6] dark:bg-[rgba(59,130,246,0.15)] dark:text-[#60a5fa]"
      : status === "KAFEDRA_APPROVED"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        : status === "DEKANAT_APPROVED"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";

  return <span className={`text-[13px] font-medium px-[10px] py-1 rounded-full ${statusClass}`}>{label}</span>;
}
