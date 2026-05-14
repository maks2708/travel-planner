import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../contexts/SessionContext'
import { TripCard } from '../components/TripCard'
import { PlusCircle, X } from 'lucide-react'

interface Trip {
  id: string
  title: string
  created_at: string
  description: string | null
  image_url: string | null
  /** ISO date `YYYY-MM-DD` from Postgres `date`, or null */
  start_date: string | null
  end_date: string | null
}

export function HomePage() {
  const session = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateRangeError, setDateRangeError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)

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

  function startEditing(trip: Trip) {
    setEditingId(trip.id)
    setTitle(trip.title)
    setDescription(trip.description || '')
    setImageUrl(trip.image_url || '')
    setStartDate(trip.start_date ?? '')
    setEndDate(trip.end_date ?? '')
    setDateRangeError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setImageUrl('')
    setStartDate('')
    setEndDate('')
    setDateRangeError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return

    setDateRangeError('')
    if (startDate && endDate && startDate > endDate) {
      setDateRangeError('Дата завершення не може бути раніше за дату початку.')
      return
    }

    setIsSubmitting(true)

    const uid = session?.user?.id
    if (!uid) {
      setIsSubmitting(false)
      return
    }

    const start_date = startDate.trim() || null
    const end_date = endDate.trim() || null

    const { error } = await supabase
      .from('trips')
      .update({ title, description, image_url: imageUrl, start_date, end_date })
      .eq('id', editingId)
      .eq('user_id', uid)

    if (!error) {
      setTrips(
        trips.map((t) =>
          t.id === editingId ? { ...t, title, description, image_url: imageUrl, start_date, end_date } : t,
        ),
      )
      resetForm()
    }
    setIsSubmitting(false)
  }

  async function handleDelete(id: string) {
    const uid = session?.user?.id
    if (!uid) return
    if (!window.confirm('Ви впевнені, що хочете видалити цю подорож?')) return
    const { error } = await supabase.from('trips').delete().eq('id', id).eq('user_id', uid)
    if (!error) setTrips(trips.filter((t) => t.id !== id))
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

        {editingId && (
          <section className="mb-16">
            <div className="rounded-[2rem] border-2 border-blue-500 bg-white p-6 shadow-xl shadow-blue-100 md:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlusCircle className="text-blue-500" />
                  <h2 className="text-xl font-bold md:text-2xl">Редагувати подорож</h2>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-slate-600"
                >
                  <X size={18} /> Скасувати
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                <input
                  placeholder="Назва локації"
                  className="col-span-1 rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <input
                  placeholder="URL фотографії"
                  className="col-span-1 rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <textarea
                  placeholder="Опишіть ваші плани..."
                  className="col-span-full h-28 rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="col-span-full flex flex-col gap-2 md:col-span-1">
                  <label htmlFor="trip-start" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Початок поїздки
                  </label>
                  <input
                    id="trip-start"
                    type="date"
                    className="rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-span-full flex flex-col gap-2 md:col-span-1">
                  <label htmlFor="trip-end" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Завершення поїздки
                  </label>
                  <input
                    id="trip-end"
                    type="date"
                    className="rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                {dateRangeError && (
                  <p className="col-span-full text-sm font-semibold text-red-600" role="alert">
                    {dateRangeError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="col-start-1 rounded-2xl bg-blue-500 p-4 font-bold text-white shadow-lg transition-all hover:bg-blue-600 disabled:opacity-60 md:col-start-3"
                >
                  {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              </form>
            </div>
          </section>
        )}

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
              <TripCard key={trip.id} trip={trip} onDelete={handleDelete} onEdit={startEditing} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
