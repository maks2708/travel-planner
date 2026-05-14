import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({
  session,
  children,
}: {
  session: Session | null
  children: React.ReactNode
}) {
  return (
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const session = useContext(SessionContext)
  return session
}
