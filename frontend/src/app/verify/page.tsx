import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

export default function VerifyPage() {
  return (
    <Suspense fallback={<main className="p-10 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0a0a0a] min-h-screen">Загрузка…</main>}>
      <VerifyClient />
    </Suspense>
  );
}
