/** Локальна дата `YYYY-MM-DD` без зсуву часового поясу. */
function todayISO(): string {
  const n = new Date()
  const y = n.getFullYear()
  const m = String(n.getMonth() + 1).padStart(2, '0')
  const d = String(n.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export type TripStatusKind = 'upcoming' | 'ongoing' | 'past' | 'nodates'

/** Статус поїздки для бейджа: порівняння рядків `YYYY-MM-DD` коректне лексикографічно. */
export function getTripStatus(start_date: string | null, end_date: string | null): TripStatusKind {
  const today = todayISO()
  if (!start_date && !end_date) return 'nodates'

  if (start_date && end_date) {
    if (today < start_date) return 'upcoming'
    if (today > end_date) return 'past'
    return 'ongoing'
  }

  if (start_date) {
    return today < start_date ? 'upcoming' : 'ongoing'
  }

  /* лише end_date */
  return today > end_date! ? 'past' : 'ongoing'
}

export const tripStatusLabels: Record<TripStatusKind, string> = {
  upcoming: 'Майбутня',
  ongoing: 'Зараз',
  past: 'Минула',
  nodates: 'Без дат',
}
