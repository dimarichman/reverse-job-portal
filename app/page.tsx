'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const check = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(data.session?.user ?? null)
        if (data.session) await loadCandidates()
      } catch (e: any) {
        setError(e.message)
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
    const { data, error } = await supabase.from('candidates').select('*').limit(20)
    if (error) console.error(error)
    setCandidates(data || [])
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { role: 'candidate' } }
    })
    if (error) setError(error.message)
    else alert('Registriert! Bitte anmelden.')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setCandidates([])
  }

  if (loading) return <div className="p-8 text-center">Lade...</div>

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Job Heroes</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={signIn} className="space-y-4">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-medium">
            Anmelden
          </button>
          <button type="button" onClick={signUp} className="w-full bg-gray-500 text-white p-3 rounded">
            Registrieren
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Job Heroes</h1>
        <div className="flex items-center gap-4">
          <span>{user.email}</span>
          <button onClick={signOut} className="bg-gray-500 text-white px-4 py-2 rounded">Abmelden</button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Kandidaten</h2>
      <div className="space-y-4">
        {candidates.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-medium">{c.full_name || 'Unbekannt'}</h3>
            <p className="text-gray-600">{c.title || ''} · {c.location || ''}</p>
            {c.experience_years && <p>{c.experience_years} Jahre Berufserfahrung</p>}
          </div>
        ))}
        {candidates.length === 0 && <p className="text-gray-500">Keine Kandidaten gefunden.</p>}
      </div>
    </div>
  )
}
