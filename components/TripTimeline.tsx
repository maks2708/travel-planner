import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Clock, Plus, Trash2, MapPin } from 'lucide-react'

interface TimelineProps {
  tripId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps: any[];
  onUpdate: () => void;
}

export const TripTimeline = ({ tripId, steps, onUpdate }: TimelineProps) => {
  const [time, setTime] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function addStep(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    const { error } = await supabase
      .from('trip_steps')
      .insert([{ 
        trip_id: tripId, 
        step_time: time, 
        content: content 
      }])

    if (!error) {
      onUpdate()
      setTime('')
      setContent('')
    }
    setIsSubmitting(false)
  }

  async function deleteStep(id: string) {
    const { error } = await supabase
      .from('trip_steps')
      .delete()
      .eq('id', id)
    
    if (!error) {
      onUpdate()
    }
  }

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <MapPin className="text-blue-500" size={24} /> 
        План маршруту
      </h3>
      <form 
        onSubmit={addStep} 
        className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-10 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-sm"
      >
        <div className="relative">
          <Clock className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <input 
          type="text" 
          placeholder="Куди прямуємо?" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="md:col-span-2 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          <Plus size={20} /> {isSubmitting ? '...' : 'Додати'}
        </button>
      </form>
      <div className="relative border-l-2 border-blue-100 ml-6 pl-10 space-y-8">
        {steps.length === 0 ? (
          <div className="text-slate-400 italic py-4">
            Ваш маршрут порожній. Додайте першу локацію!
          </div>
        ) : (
          steps.map((step) => (
            <div key={step.id} className="relative group">
              <div className="absolute -left-[51px] top-1.5 w-5 h-5 bg-white border-4 border-blue-500 rounded-full z-10 transition-transform group-hover:scale-125" />
              
              <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm group-hover:border-blue-200 group-hover:shadow-md transition-all flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold mb-1 text-sm">
                    <Clock size={14} />
                    {step.step_time || "Час не вказано"}
                  </div>
                  <p className="text-slate-800 font-semibold text-lg">{step.content}</p>
                  {(step.lat && step.lng) && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      GPS: {step.lat.toFixed(4)}, {step.lng.toFixed(4)}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => deleteStep(step.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}