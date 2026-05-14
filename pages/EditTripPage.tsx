import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../contexts/SessionContext'
import { uploadTripCover } from '../lib/tripCoverUpload'

interface TripRow {
  id: string
  title: string
  description: string | null
  image_url: string | null
  start_date: string | null
  end_date: string | null
}

export function EditTripPage() {
  const session = useSession()
  const navigate = useNavigate()
  const { id: tripId } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateRangeError, setDateRangeError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const uid = session?.user?.id
    if (!tripId || !uid) {
      setLoading(false)
      setNotFound(!tripId)
      return
    }

    let cancelled = false
    setLoading(true)
    setNotFound(false)

    supabase
      .from('trips')
      .select('id, title, description, image_url, start_date, end_date')
      .eq('id', tripId)
      .eq('user_id', uid)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const row = data as TripRow
        setTitle(row.title)
        setDescription(row.description || '')
        setImageUrl(row.image_url || '')
        setStartDate(row.start_date ?? '')
        setEndDate(row.end_date ?? '')
        setCoverFile(null)
        if (coverInputRef.current) coverInputRef.current.value = ''
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tripId, session?.user?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tripId) return

    setDateRangeError('')
    setSaveError('')
    if (startDate && endDate && startDate > endDate) {
      setDateRangeError('Дата завершення не може бути раніше за дату початку.')
      return
    }

    const uid = session?.user?.id
    if (!uid) return

    setIsSubmitting(true)
    const start_date = startDate.trim() || null
    const end_date = endDate.trim() || null

    let finalImageUrl = coverFile ? null : imageUrl.trim() || null
    if (coverFile) {
      const up = await uploadTripCover(uid, tripId, coverFile)
      if ('error' in up) {
        setSaveError(up.error)
        setIsSubmitting(false)
        return
      }
      finalImageUrl = up.publicUrl
    }

    const { error } = await supabase
      .from('trips')
      .update({ title, description, image_url: finalImageUrl, start_date, end_date })
      .eq('id', tripId)
      .eq('user_id', uid)

    setIsSubmitting(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    navigate(`/trip/${tripId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (notFound || !tripId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-black text-slate-900">Подорож не знайдена</h1>
        <Link to="/" className="font-bold text-blue-600 hover:underline">
          На головну
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-20 text-slate-900">
      <main className="mx-auto max-w-3xl px-4 pt-8 md:px-6 md:pt-12">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Link
            to={`/trip/${tripId}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            До деталей поїздки
          </Link>
        </div>

        <div className="rounded-[2rem] border-2 border-blue-500 bg-white p-6 shadow-xl shadow-blue-100 md:p-8">
          <div className="mb-8 flex items-center gap-3">
            <Pencil className="text-blue-500" size={28} />
            <h1 className="text-2xl font-bold md:text-3xl">Редагувати подорож</h1>
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
              placeholder="Або URL фото (якщо без файлу)"
              className="col-span-1 rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 md:col-span-2"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={!!coverFile}
            />
            <div className="col-span-full flex flex-col gap-2">
              <label htmlFor="edit-page-cover" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Нова обкладинка (файл)
              </label>
              <input
                ref={coverInputRef}
                id="edit-page-cover"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setCoverFile(f)
                  if (f) setImageUrl('')
                }}
              />
              {coverFile && (
                <p className="text-xs font-medium text-slate-500">Обрано: {coverFile.name}</p>
              )}
            </div>
            <textarea
              placeholder="Опишіть ваші плани..."
              className="col-span-full h-28 rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="col-span-full flex flex-col gap-2 md:col-span-1">
              <label htmlFor="edit-page-start" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Початок поїздки
              </label>
              <input
                id="edit-page-start"
                type="date"
                className="rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-span-full flex flex-col gap-2 md:col-span-1">
              <label htmlFor="edit-page-end" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Завершення поїздки
              </label>
              <input
                id="edit-page-end"
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
            {saveError && (
              <p className="col-span-full text-sm font-semibold text-red-600" role="alert">
                {saveError}
              </p>
            )}
            <div className="col-span-full flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting ? 'Збереження...' : 'Зберегти й повернутися'}
              </button>
              <Link
                to={`/trip/${tripId}`}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Скасувати
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
