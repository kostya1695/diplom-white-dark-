/** Единые классы для форм входа и регистрации */
export const authFieldClass =
  "border border-gray-300 rounded-md px-3 py-2 w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500";

export const authCardClass =
  "mx-auto w-full max-w-2xl border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-[#111111] space-y-6";

export const authTitleClass = "text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white";

export const authTabBtn = (active: boolean) =>
  [
    "flex-1 py-2.5 text-sm font-medium transition-colors",
    active
      ? "border-b-2 border-blue-600 dark:border-blue-500 text-gray-900 dark:text-white font-semibold"
      : "border-b-2 border-transparent text-gray-400",
  ].join(" ");
