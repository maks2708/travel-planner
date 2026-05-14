import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../contexts/SessionContext'
import { TripCard } from '../components/TripCard'
import { PlusCircle } from 'lucide-react'

interface Trip {
  id: string
  title: string
  created_at: string
  description: string | null
  image_url: string | null
  start_date: string | null
  end_date: string | null
}

export function HomePage() {
  const session = useSession()
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchTrips()
    }
  }, [session?.user?.id])

  async function fetchTrips() {
    const uid = session?.user?.id
    if (!uid) return
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (!error) setTrips(data || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const uid = session?.user?.id
    if (!uid) return
    if (!window.confirm('Ви впевнені, що хочете видалити цю подорож?')) return
    const { error } = await supabase.from('trips').delete().eq('id', id).eq('user_id', uid)
    if (!error) setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="pb-20 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-12">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Мої подорожі</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Оберіть поїздку або додайте нову</p>
          </div>
          <Link
            to="/trips/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
          >
            <PlusCircle size={20} />
            Нова подорож
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-20 text-center text-xl font-medium text-slate-400 animate-pulse">
              Шукаємо ваші квитки...
            </div>
          ) : trips.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border border-dashed border-slate-200 bg-white/80 py-16 text-center">
              <p className="text-lg font-semibold text-slate-600">Поки що немає подорожей</p>
              <p className="mt-2 text-sm text-slate-400">Створіть першу — і з’явиться на цій сторінці</p>
              <Link
                to="/trips/new"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                <PlusCircle size={20} />
                Нова подорож
              </Link>
            </div>
          ) : (
            trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDelete}
                onEdit={() => {
                  navigate(`/trip/${trip.id}/edit`)
                }}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
