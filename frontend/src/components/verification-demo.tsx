"use client";
import { useState } from "react";
import { UploadCloud } from "lucide-react";

export function VerificationDemo() {
  const [result, setResult] = useState<string>("");

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 p-6">
      <label className="flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-300 dark:border-zinc-700 p-8 cursor-pointer text-center">
        <UploadCloud size={28} />
        <span>Перетащите PDF или нажмите для загрузки</span>
        <input
          className="hidden"
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setResult(`Файл «${file.name}» принят. Хэш проверяется в реестре...`);
          }}
        />
      </label>
      {result && <p className="mt-4 text-sm">{result}</p>}
    </div>
  );
}
