import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plane, Mail, Lock, ArrowRight } from 'lucide-react'

export function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
    } else if (isSignUp) {
      alert('Перевірте пошту для підтвердження реєстрації!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex bg-blue-600 p-4 rounded-2xl text-white mb-4 shadow-lg shadow-blue-200">
            <Plane size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            Travel<span className="text-blue-600">.ua</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            {isSignUp ? 'Створіть свій кабінет мандрівника' : 'Вітаємо з поверненням!'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="email" placeholder="Ваш Email" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="password" placeholder="Пароль" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Обробка...' : (isSignUp ? 'Зареєструватися' : 'Увійти')}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-500 font-bold hover:text-blue-600 transition-all text-sm"
          >
            {isSignUp ? 'Вже є аккаунт? Увійти' : 'Немає аккаунту? Створити'}
          </button>
        </div>
      </div>
    </div>
  )
}