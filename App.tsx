import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import { SessionProvider } from './contexts/SessionContext'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/HomePage'
import { NewTripPage } from './pages/NewTripPage'
import { TripDetailsPage } from './pages/TripDetailsPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans text-slate-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium">Завантаження…</p>
        </div>
      </div>
    )
  }

  return (
    <SessionProvider session={session}>
      <Routes>
        {!session ? (
          <Route path="*" element={<AuthPage />} />
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips/new" element={<NewTripPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/trip/:id" element={<TripDetailsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        )}
      </Routes>
    </SessionProvider>
  )
}

export default App
