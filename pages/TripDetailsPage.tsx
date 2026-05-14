import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../contexts/SessionContext'
import { ArrowLeft, Calendar, MapPin, Info, CheckCircle2, Pencil } from 'lucide-react'
import { TripTodoList } from '../components/TripTodoList'
import { TripTimeline } from '../components/TripTimeline'
import { MapComponent } from '../components/Map'

interface Trip {
  id: string
  title: string
  description: string | null
  image_url: string | null
  created_at: string
  start_date: string | null
  end_date: string | null
}

function formatTripDetailDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function tripRangeLabel(trip: Trip) {
  if (trip.start_date && trip.end_date) {
    return `${formatTripDetailDate(trip.start_date)} — ${formatTripDetailDate(trip.end_date)}`
  }
  if (trip.start_date) return `З ${formatTripDetailDate(trip.start_date)}`
  if (trip.end_date) return `До ${formatTripDetailDate(trip.end_date)}`
  return null
}

export function TripDetailsPage() {
  const session = useSession()
  const { id } = useParams<{ id: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [steps, setSteps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && session?.user?.id) {
      loadAllData()
    }
  }, [id, session?.user?.id])

  async function loadAllData() {
    const uid = session?.user?.id
    setLoading(true)
    setTrip(null)
    setSteps([])
    if (!id || !uid) {
      setLoading(false)
      return
    }

    try {
      const { data: tripRow, error: tripErr } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .eq('user_id', uid)
        .single()

      if (tripErr || !tripRow) {
        setTrip(null)
        setSteps([])
        setLoading(false)
        return
      }

      setTrip(tripRow)

      const { data: stepsData, error: stepsErr } = await supabase
        .from('trip_steps')
        .select('*')
        .eq('trip_id', id)
        .order('step_time', { ascending: true })

      if (stepsErr) throw stepsErr
      setSteps(stepsData || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Помилка завантаження:', error.message)
      setTrip(null)
      setSteps([])
    }
    setLoading(false)
  }

  async function fetchSteps() {
    if (!id) return
    const { data, error } = await supabase
      .from('trip_steps')
      .select('*')
      .eq('trip_id', id)
      .order('step_time', { ascending: true })
    if (!error) setSteps(data || [])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Подорож не знайдена 🧐</h2>
          <Link to="/" className="text-blue-600 font-bold hover:underline">На головну</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <div className="relative h-[45vh] w-full overflow-hidden">
        {trip.image_url ? (
          <img src={trip.image_url} className="w-full h-full object-cover" alt={trip.title} />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            <MapPin size={80} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute left-6 right-6 top-6 z-20 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 p-3 text-white backdrop-blur-md transition-all hover:bg-white/40"
          >
            <ArrowLeft size={24} />
          </Link>
          <Link
            to={`/trip/${trip.id}/edit`}
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/30 bg-white/20 px-4 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/40"
          >
            <Pencil size={18} />
            <span className="hidden sm:inline">Редагувати</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-[0.2em] mb-3">
                <CheckCircle2 size={18} />
                Ваш план подорожі
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                {trip.title}
              </h1>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-stretch">
              <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50 px-6 py-4">
                <Calendar className="text-blue-500" size={28} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Дати поїздки
                  </p>
                  <p className="font-bold text-slate-700">
                    {tripRangeLabel(trip) ?? '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50 px-6 py-4">
                <Calendar className="text-slate-400" size={28} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Створено
                  </p>
                  <p className="font-bold text-slate-700">
                    {new Date(trip.created_at).toLocaleDateString('uk-UA')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            <section>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <MapPin size={24} className="text-blue-500" />
                Мапа маршруту
              </h3>
              <MapComponent steps={steps} />
            </section>

            <hr className="border-slate-50" />
            <section>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Info size={24} className="text-blue-500" />
                Про локацію
              </h3>
              <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 leading-relaxed text-lg text-slate-600 whitespace-pre-wrap">
                {trip.description || "Опис поки що порожній..."}
              </div>
            </section>

            <hr className="border-slate-50" />
            <section>
              <TripTimeline 
                tripId={trip.id} 
                steps={steps} 
                onUpdate={fetchSteps} 
              />
            </section>

            <hr className="border-slate-50" />
            <section>
              <TripTodoList tripId={trip.id} />
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}