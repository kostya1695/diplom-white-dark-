import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

export default function VerifyPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-10 text-sm text-gray-500 dark:text-gray-400">Загрузка…</main>}>
      <VerifyClient />
    </Suspense>
  );
}
