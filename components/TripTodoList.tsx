import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Check, Trash2, Plus } from 'lucide-react'

export const TripTodoList = ({ tripId }: { tripId: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [todos, setTodos] = useState<any[]>([])
  const [newTodo, setNewTodo] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [tripId])

  async function fetchTodos() {
    const { data } = await supabase
      .from('trip_todos')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })
    setTodos(data || [])
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!newTodo.trim()) return
    
    const { data, error } = await supabase
      .from('trip_todos')
      .insert([{ trip_id: tripId, text: newTodo }])
      .select()
    
    if (!error && data) {
      setTodos([...todos, data[0]])
      setNewTodo('')
    }
  }

  async function toggleTodo(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('trip_todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id)
    
    if (!error) {
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t))
    }
  }

  async function deleteTodo(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    
    const { error } = await supabase
      .from('trip_todos')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setTodos(todos.filter(t => t.id !== id))
    }
  }

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Check className="text-green-500" size={24} /> Список справ
      </h3>
      
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input 
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Що потрібно зробити?"
          className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        <button type="submit" className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          <Plus size={24} />
        </button>
      </form>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4 text-sm">Список порожній. Час планувати!</p>
        ) : (
          todos.map(todo => (
            <div 
              key={todo.id}
              onClick={() => toggleTodo(todo.id, todo.is_completed)}
              className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.is_completed ? 'bg-green-500 border-green-500' : 'border-slate-200'}`}>
                  {todo.is_completed && <Check size={14} className="text-white" />}
                </div>
                <span className={`font-medium transition-all ${todo.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {todo.text}
                </span>
              </div>

              <button 
                onClick={(e) => deleteTodo(e, todo.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}