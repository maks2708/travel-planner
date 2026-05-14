import { useEffect, useState } from 'react'
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
  /** Values for `<input type="date">` — empty string means «not set» (we send `null` to Supabase). */
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

    if (editingId) {
      const { error } = await supabase
        .from('trips')
        .update({ title, description, image_url: imageUrl, start_date, end_date })
        .eq('id', editingId)
        .eq('user_id', uid)

      if (!error) {
        setTrips(
          trips.map((t) =>
            t.id === editingId
              ? { ...t, title, description, image_url: imageUrl, start_date, end_date }
              : t,
          ),
        )
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('trips')
        .insert([{ title, description, image_url: imageUrl, user_id: uid, start_date, end_date }])
        .select()
      if (!error && data) {
        setTrips([data[0] as Trip, ...trips])
        resetForm()
      }
    }
    setIsSubmitting(false)
  }

  async function handleDelete(id: string) {
    const uid = session?.user?.id
    if (!uid) return
    if (!window.confirm('Ви впевнені, що хочете видалити цю подорож?')) return
    const { error } = await supabase.from('trips').delete().eq('id', id).eq('user_id', uid)
    if (!error) setTrips(trips.filter(t => t.id !== id))
  }

  return (
    <div className="pb-20 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-12">
        <section className="mb-16">
          <div className={`bg-white p-6 md:p-8 rounded-[2rem] shadow-xl transition-all border-2 ${editingId ? 'border-blue-500 shadow-blue-100' : 'border-transparent shadow-blue-900/5'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <PlusCircle className={editingId ? 'text-blue-500' : 'text-blue-600'} />
                <h2 className="text-xl md:text-2xl font-bold">{editingId ? 'Редагувати подорож' : 'Нова подорож'}</h2>
              </div>
              {editingId && (
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                  <X size={18} /> Скасувати
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <input 
                placeholder="Назва локації" 
                className="col-span-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={title} onChange={e => setTitle(e.target.value)} required
              />
              <input 
                placeholder="URL фотографії" 
                className="col-span-1 md:col-span-2 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              />
              <textarea 
                placeholder="Опишіть ваші плани..." 
                className="col-span-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none h-28"
                value={description} onChange={e => setDescription(e.target.value)}
              />
              <div className="col-span-full md:col-span-1 flex flex-col gap-2">
                <label htmlFor="trip-start" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Початок поїздки
                </label>
                <input
                  id="trip-start"
                  type="date"
                  className="p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-span-full md:col-span-1 flex flex-col gap-2">
                <label htmlFor="trip-end" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Завершення поїздки
                </label>
                <input
                  id="trip-end"
                  type="date"
                  className="p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
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
                type="submit" disabled={isSubmitting}
                className={`col-start-1 md:col-start-3 p-4 rounded-2xl font-bold text-white transition-all shadow-lg ${editingId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? 'Збереження...' : (editingId ? 'Зберегти зміни' : 'Додати у список')}
              </button>
            </form>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-400 animate-pulse font-medium text-xl">Шукаємо ваші квитки...</div>
          ) : (
            trips.map(trip => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onDelete={handleDelete} 
                onEdit={startEditing} 
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}