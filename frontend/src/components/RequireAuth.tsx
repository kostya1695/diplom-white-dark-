"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[var(--muted)]">
        Проверка авторизации…
      </main>
    );
  }

  return <>{children}</>;
}
