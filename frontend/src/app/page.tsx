import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl min-h-screen px-6 pt-16">
      <section className="space-y-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">Верификация дипломов</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Децентрализованное подтверждение учёных степеней
        </h1>
        <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400 mt-1">
          Минималистичный интерфейс для загрузки PDF, согласования и проверки по хэшу и блокчейн-реестру.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/verify" className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-medium rounded-md py-2 px-4 transition-colors inline-flex">
            Проверить документ
          </Link>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Вход и регистрация — в правом верхнем углу. Администратор входит тем же способом (учётная
          запись выдаётся отдельно).
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        <div className="surface rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <div className="text-blue-600 dark:text-blue-400">🛡️</div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3 mb-1">Фиксация и хэш SHA-256</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Файл диплома сохраняется в хранилище, вычисляется SHA-256 хэш — неизменяемый цифровой отпечаток документа.</p>
        </div>
        <div className="surface rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <div className="text-blue-600 dark:text-blue-400">👥</div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3 mb-1">Согласование кафедра → деканат</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Документ последовательно подтверждается ответственными лицами. Каждый шаг фиксируется в блокчейне с временной меткой.</p>
        </div>
        <div className="surface rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <div className="text-blue-600 dark:text-blue-400">⛓️</div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3 mb-1">Финальная запись в реестр</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">После полного согласования хэш и метаданные записываются в смарт-контракт. Документ становится публично верифицируемым.</p>
        </div>
      </section>
    </main>
  );
}
