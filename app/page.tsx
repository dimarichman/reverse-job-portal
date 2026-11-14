'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('candidate')
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(data.session?.user ?? null)
        if (data.session) await loadCandidates()
      } catch (e: any) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    check()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session) await loadCandidates()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadCandidates() {
    const { data } = await supabase.from('candidates').select('*').order('created_at', { ascending: false }).limit(30)
    setCandidates(data || [])
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role } }
        })
        if (error) throw error
        alert('Registriert! Du kannst dich jetzt anmelden.')
        setIsLogin(true)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setCandidates([])
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Lade...</div>

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Job Heroes</h1>
        <p className="text-center text-gray-500 mb-6">Umgekehrtes Job-Portal</p>
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" required />
          <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" required />
          {!isLogin && (
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg">
              <option value="candidate">Ich bin Kandidat</option>
              <option value="recruiter">Ich bin Arbeitgeber / Recruiter</option>
            </select>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium">
            {isLogin ? 'Anmelden' : 'Registrieren'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-gray-500">
          {isLogin ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
        </button>
      </div>
    )
  }

  const isRecruiter = (user.user_metadata?.role || 'candidate') === 'recruiter'

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Job Heroes</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email} · {isRecruiter ? 'Recruiter' : 'Kandidat'}</span>
          <button onClick={signOut} className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">Abmelden</button>
        </div>
      </header>

      {isRecruiter ? (
        <>
          <h2 className="text-2xl font-semibold mb-6">Kandidaten-Übersicht</h2>
          <div className="space-y-4">
            {candidates.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-xl font-semibold">{c.full_name || 'Unbekannt'}</h3>
                <p className="text-gray-600">{c.title || ''} · {c.location || ''}</p>
                {c.experience_years != null && <p className="text-sm text-gray-500">{c.experience_years} Jahre Berufserfahrung</p>}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Mein Profil</h2>
          <p className="text-gray-600">Profil-Editor kommt als Nächstes.</p>
        </div>
      )}
    </div>
  )
}
