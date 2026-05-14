import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../contexts/SessionContext'

export function NewTripPage() {
  const session = useSession()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateRangeError, setDateRangeError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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

    const { data, error } = await supabase
      .from('trips')
      .insert([{ title, description, image_url: imageUrl, user_id: uid, start_date, end_date }])
      .select('id')
      .single()

    setIsSubmitting(false)

    if (error) {
      setSaveError(error.message || 'Не вдалося зберегти поїздку.')
      return
    }
    if (data?.id) {
      navigate(`/trip/${data.id}`)
    }
  }

  return (
    <div className="pb-20 text-slate-900">
      <main className="mx-auto max-w-3xl px-4 pt-8 md:px-6 md:pt-12">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          До моїх подорожей
        </Link>

        <div className="rounded-[2rem] border-2 border-transparent bg-white p-6 shadow-xl shadow-blue-900/5 md:p-8">
          <div className="mb-8 flex items-center gap-3">
            <PlusCircle className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold md:text-3xl">Нова подорож</h1>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <input
              placeholder="Назва локації"
              className="col-span-full md:col-span-1 rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              placeholder="URL фотографії"
              className="col-span-full md:col-span-1 rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
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
              <label htmlFor="new-trip-start" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Початок поїздки
              </label>
              <input
                id="new-trip-start"
                type="date"
                className="rounded-2xl border-none bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-span-full flex flex-col gap-2 md:col-span-1">
              <label htmlFor="new-trip-end" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Завершення поїздки
              </label>
              <input
                id="new-trip-end"
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
                {isSubmitting ? 'Збереження...' : 'Створити й відкрити деталі'}
              </button>
              <Link
                to="/"
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
