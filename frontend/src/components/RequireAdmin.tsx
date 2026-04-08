"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { ready, user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [ready, user, isAdmin, router]);

  if (!ready || !user || !isAdmin) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[var(--muted)]">
        Проверка доступа…
      </main>
    );
  }

  return <>{children}</>;
}
