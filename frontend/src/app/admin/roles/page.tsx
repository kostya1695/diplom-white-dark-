"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, authHeaders } from "@/lib/api";
import { RequireAdmin } from "@/components/RequireAdmin";

const ASSIGNABLE_ROLES = ["STUDENT", "KAFEDRA", "DEKANAT"] as const;

type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/** Совпадает с backend enum University */
const UNIVERSITIES = ["KBTU", "UIB", "ENERGO", "SATBAYEV"] as const;

type UniversityId = (typeof UNIVERSITIES)[number];

type UserRow = {
  id: string;
  email: string;
  fullName: string;
  role: string | null;
  university: string | null;
  createdAt: string;
};

function roleLabel(r: string) {
  switch (r) {
    case "STUDENT":
      return "Студент";
    case "KAFEDRA":
      return "Кафедра";
    case "DEKANAT":
      return "Деканат";
    case "ADMIN":
      return "Администратор";
    default:
      return r;
  }
}

function universityLabel(u: string): string {
  switch (u) {
    case "KBTU":
      return "KBTU";
    case "UIB":
      return "UIB";
    case "ENERGO":
      return "Energo University";
    case "SATBAYEV":
      return "Satbayev University";
    default:
      return u;
  }
}

function isUniversityId(v: string): v is UniversityId {
  return (UNIVERSITIES as readonly string[]).includes(v);
}

/** Пустой университет в БД → null; для сравнений */
function normUni(v: string | null | undefined): string | null {
  if (v == null || v === "") return null;
  return v;
}

function displayCurrentRole(role: string | null): string {
  if (role == null || role === "") return "Не назначена";
  return roleLabel(role);
}

function displayCurrentUniversity(u: string | null, isAdminRow: boolean): string {
  if (isAdminRow) return "—";
  const n = normUni(u);
  if (n == null) return "Не задан";
  return universityLabel(n);
}

function RolesPageInner() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  /** Отличие от сервера: роль может быть null (снять роль) */
  const [pendingRole, setPendingRole] = useState<Record<string, AssignableRole | null>>({});
  const [pendingUniversity, setPendingUniversity] = useState<Record<string, UniversityId | null>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get<UserRow[]>("/users", { headers: authHeaders() });
      setUsers(res.data);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setLoadError(typeof msg === "string" ? msg : "Не удалось загрузить пользователей");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, search]);

  const hasChanges = useMemo(() => {
    for (const u of users) {
      if (u.role === "ADMIN") continue;
      const pr = pendingRole[u.id];
      const pu = pendingUniversity[u.id];
      if (pr !== undefined && pr !== u.role) return true;
      if (pu !== undefined && normUni(pu) !== normUni(u.university)) return true;
    }
    return false;
  }, [pendingRole, pendingUniversity, users]);

  function setDraftRole(user: UserRow, raw: string) {
    if (user.role === "ADMIN") return;
    const next: AssignableRole | null = raw === "" ? null : (raw as AssignableRole);
    setPendingRole((prev) => {
      const nextMap = { ...prev };
      if (next === user.role) {
        delete nextMap[user.id];
      } else {
        nextMap[user.id] = next;
      }
      return nextMap;
    });
  }

  function setDraftUniversity(user: UserRow, raw: string) {
    if (user.role === "ADMIN") return;
    const next: UniversityId | null = raw === "" ? null : (raw as UniversityId);
    setPendingUniversity((prev) => {
      const nextMap = { ...prev };
      if (normUni(next) === normUni(user.university)) {
        delete nextMap[user.id];
      } else {
        nextMap[user.id] = next;
      }
      return nextMap;
    });
  }

  function selectRoleValue(user: UserRow): string {
    const p = pendingRole[user.id];
    if (p !== undefined) return p === null ? "" : p;
    if (user.role == null || user.role === "") return "";
    return user.role as AssignableRole;
  }

  function selectUniversityValue(user: UserRow): string {
    const p = pendingUniversity[user.id];
    if (p !== undefined) return p === null ? "" : p;
    const raw = user.university;
    if (raw == null || raw === "") return "";
    if (isUniversityId(raw)) return raw;
    return "";
  }

  function rowChanged(u: UserRow): boolean {
    if (u.role === "ADMIN") return false;
    const pr = pendingRole[u.id];
    const pu = pendingUniversity[u.id];
    if (pr !== undefined && pr !== u.role) return true;
    if (pu !== undefined && normUni(pu) !== normUni(u.university)) return true;
    return false;
  }

  async function save() {
    if (!hasChanges) return;

    const updates: {
      userId: string;
      role?: AssignableRole | null;
      university?: UniversityId | null;
    }[] = [];

    for (const u of users) {
      if (u.role === "ADMIN") continue;
      const pr = pendingRole[u.id];
      const pu = pendingUniversity[u.id];
      const roleChanged = pr !== undefined && pr !== u.role;
      const uniChanged = pu !== undefined && normUni(pu) !== normUni(u.university);
      if (!roleChanged && !uniChanged) continue;

      const item: {
        userId: string;
        role?: AssignableRole | null;
        university?: UniversityId | null;
      } = { userId: u.id };
      if (roleChanged) item.role = pr!;
      if (uniChanged) item.university = pu!;
      updates.push(item);
    }

    if (updates.length === 0) {
      setPendingRole({});
      setPendingUniversity({});
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      await api.patch("/users/roles", { updates }, { headers: authHeaders() });
      setNotice({ kind: "ok", text: "Изменения сохранены" });
      setPendingRole({});
      setPendingUniversity({});
      await loadUsers();
    } catch (e: unknown) {
      const data = e && typeof e === "object" && "response" in e ? (e as { response?: { data?: unknown } }).response?.data : undefined;
      let text = "Не удалось сохранить";
      if (data && typeof data === "object" && "message" in data) {
        const m = (data as { message?: string | string[] }).message;
        text = Array.isArray(m) ? m.join(", ") : (m as string) ?? text;
      }
      setNotice({ kind: "err", text });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!notice || notice.kind !== "ok") return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const selectClassName =
    "w-full max-w-[220px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-600 dark:bg-[#1a1a1a] dark:text-white dark:focus:border-blue-500";

  return (
    <main className="relative mx-auto min-h-screen max-w-6xl px-6 pb-28 pt-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Роли</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Назначение ролей и университетов. Изменения применяются после нажатия «Сохранить».
        </p>
      </div>

      <div className="mb-6">
        <label className="sr-only" htmlFor="role-search">
          Поиск по email
        </label>
        <input
          id="role-search"
          type="search"
          autoComplete="off"
          placeholder="Поиск по email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#141414] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500"
        />
      </div>

      {loadError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {loadError}
        </p>
      )}

      {notice && (
        <div
          className={`mb-4 rounded-md border px-4 py-3 text-sm ${
            notice.kind === "ok"
              ? "border-blue-200 bg-blue-50/80 text-gray-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-gray-100"
              : "border-red-200 bg-red-50/80 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          }`}
          role="status"
        >
          {notice.text}
        </div>
      )}

      <div className="surface overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full min-w-[900px] table-fixed text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-4 py-3.5 font-medium">Email</th>
              <th className="w-36 px-4 py-3.5 font-medium">Текущая роль</th>
              <th className="w-56 px-4 py-3.5 font-medium">Новая роль</th>
              <th className="w-44 px-4 py-3.5 font-medium">Текущий университет</th>
              <th className="w-56 px-4 py-3.5 font-medium">Новый университет</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                  Загрузка…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                  {users.length === 0 ? "Нет пользователей" : "Ничего не найдено"}
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isAdmin = u.role === "ADMIN";
                const changed = rowChanged(u);
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-100 transition-colors last:border-0 dark:border-gray-800/80 ${
                      changed ? "bg-blue-50/40 dark:bg-blue-950/20" : "hover:bg-gray-50/80 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="px-4 py-3.5 align-middle">
                      <span className="block truncate text-gray-900 dark:text-white" title={u.email}>
                        {u.email}
                      </span>
                      {u.fullName ? (
                        <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-500" title={u.fullName}>
                          {u.fullName}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-gray-700 dark:text-gray-300">
                      {displayCurrentRole(u.role)}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      {isAdmin ? (
                        <span className="text-xs text-gray-500 dark:text-gray-500">Изменение недоступно</span>
                      ) : (
                        <select
                          value={selectRoleValue(u)}
                          onChange={(e) => setDraftRole(u, e.target.value)}
                          disabled={saving}
                          className={selectClassName}
                        >
                          <option value="">Не назначена</option>
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {roleLabel(r)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-gray-700 dark:text-gray-300">
                      {displayCurrentUniversity(u.university, isAdmin)}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      {isAdmin ? (
                        <span className="text-xs text-gray-500 dark:text-gray-500">Изменение недоступно</span>
                      ) : (
                        <select
                          value={selectUniversityValue(u)}
                          onChange={(e) => setDraftUniversity(u, e.target.value)}
                          disabled={saving}
                          className={selectClassName}
                        >
                          <option value="">Не задан</option>
                          {UNIVERSITIES.map((uni) => (
                            <option key={uni} value={uni}>
                              {universityLabel(uni)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={!hasChanges || saving || loading}
          className="min-w-[140px] rounded-md border border-blue-600 bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 dark:border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:border-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </main>
  );
}

export default function AdminRolesPage() {
  return (
    <RequireAdmin>
      <RolesPageInner />
    </RequireAdmin>
  );
}
