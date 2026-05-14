import { Link } from 'react-router-dom'
import { User, Mail, Calendar, ArrowLeft } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'

export function ProfilePage() {
  const session = useSession()
  const user = session?.user

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        До подорожей
      </Link>

      <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-12 text-white">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black backdrop-blur">
            {(user?.email?.[0] ?? '?').toUpperCase()}
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">Ваш профіль</h1>
          <p className="mt-2 text-sm font-medium text-blue-100">
            Дані з Supabase Auth — тут видно, під яким акаунтом ви в системі.
          </p>
        </div>

        <div className="space-y-1 p-6 md:p-8">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <Mail className="mt-0.5 shrink-0 text-blue-500" size={22} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</p>
              <p className="mt-1 break-all font-semibold text-slate-800">{user?.email ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <User className="mt-0.5 shrink-0 text-blue-500" size={22} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ID користувача</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-600">{user?.id ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <Calendar className="mt-0.5 shrink-0 text-blue-500" size={22} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Зареєстровано
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleString('uk-UA')
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
