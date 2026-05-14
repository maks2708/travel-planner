import { Outlet, NavLink } from 'react-router-dom'
import { Plane, LayoutGrid, User, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../contexts/SessionContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
    isActive
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
      : 'text-slate-600 hover:bg-slate-100'
  }`

export function AppLayout() {
  const session = useSession()
  const email = session?.user?.email ?? ''

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <Plane size={22} />
            </div>
            <span className="text-lg font-black tracking-tight uppercase md:text-xl">
              Travel<span className="text-blue-600">.ua</span>
            </span>
          </NavLink>

          <nav className="flex flex-1 items-center justify-center gap-1 md:gap-2">
            <NavLink to="/" end className={navClass}>
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">Мої подорожі</span>
              <span className="sm:hidden">Головна</span>
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              <User size={18} />
              <span className="hidden sm:inline">Профіль</span>
              <span className="sm:hidden">Я</span>
            </NavLink>
          </nav>

          <div className="flex max-w-[40%] shrink-0 flex-col items-end gap-0.5 md:max-w-none">
            <span className="truncate text-xs font-medium text-slate-500" title={email}>
              {email}
            </span>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 md:text-sm"
            >
              <LogOut size={14} />
              Вийти
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
