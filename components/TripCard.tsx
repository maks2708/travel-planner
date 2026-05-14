import { Trash2, MapPin, Calendar, ArrowRight, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getTripStatus, tripStatusLabels, type TripStatusKind } from '../lib/tripStatus'

const statusBadgeClass: Record<TripStatusKind, string> = {
  upcoming: 'bg-blue-600 text-white shadow-md shadow-blue-200',
  ongoing: 'bg-emerald-600 text-white shadow-md shadow-emerald-200',
  past: 'bg-slate-500 text-white shadow-md shadow-slate-300',
  nodates: 'bg-slate-200 text-slate-700',
}

/** Postgres `date` → `YYYY-MM-DD`; avoid midnight UTC shift in local calendar. */
function formatTripFootnoteDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function tripDatesCaption(trip: {
  start_date: string | null
  end_date: string | null
  created_at: string
}) {
  if (trip.start_date && trip.end_date) {
    return `${formatTripFootnoteDate(trip.start_date)} — ${formatTripFootnoteDate(trip.end_date)}`
  }
  if (trip.start_date) return `З ${formatTripFootnoteDate(trip.start_date)}`
  if (trip.end_date) return `До ${formatTripFootnoteDate(trip.end_date)}`
  return new Date(trip.created_at).toLocaleDateString('uk-UA')
}

interface TripCardProps {
  trip: {
    id: string
    title: string
    description: string | null
    image_url: string | null
    created_at: string
    start_date: string | null
    end_date: string | null
  }
  onDelete: (id: string) => void
  onEdit: (trip: TripCardProps['trip']) => void
}

export const TripCard = ({ trip, onDelete, onEdit }: TripCardProps) => {
  const status = getTripStatus(trip.start_date, trip.end_date)

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
      <div className="h-64 overflow-hidden relative">
        <span
          className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${statusBadgeClass[status]}`}
        >
          {tripStatusLabels[status]}
        </span>
        {trip.image_url ? (
          <img 
            src={trip.image_url} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={trip.title}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
             <MapPin size={48} />
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => onEdit(trip)}
            className="p-3 bg-white/90 backdrop-blur-md text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-xl"
            title="Редагувати"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => onDelete(trip.id)}
            className="p-3 bg-white/90 backdrop-blur-md text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl"
            title="Видалити"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
          {trip.title}
        </h3>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10 italic">
          {trip.description || "Маршрут ще не сплановано..."}
        </p>
        
        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2 text-gray-800 text-xs font-bold uppercase tracking-widest">
              <Calendar size={14} className="shrink-0 text-blue-500" />
              <span className="truncate normal-case font-semibold tracking-normal">
                {tripDatesCaption(trip)}
              </span>
            </div>
            {(trip.start_date || trip.end_date) && (
              <p className="pl-6 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Створено {new Date(trip.created_at).toLocaleDateString('uk-UA')}
              </p>
            )}
          </div>
         <Link 
  to={`/trip/${trip.id}`} 
  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all"
>
  Деталі <ArrowRight size={16} />
</Link>
        </div>
      </div>
    </div>
  );
};