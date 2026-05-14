import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 rounded-3xl bg-slate-100 p-6 text-slate-400">
        <Compass size={56} strokeWidth={1.25} />
      </div>
      <h1 className="text-3xl font-black text-slate-900">Сторінку не знайдено</h1>
      <p className="mt-3 text-slate-500">
        Маршрут не існує або був перенесений. Поверніться на головну й оберіть подорож.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
      >
        На головну
      </Link>
    </main>
  )
}
