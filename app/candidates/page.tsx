'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Candidate = {
  id: string
  full_name: string
  title: string | null
  skills: string[] | null
  location: string | null
  experience_years: number | null
  bio: string | null
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCandidates()
  }, [])

  async function fetchCandidates() {
    setLoading(true)
    const { data, error } = await supabase
      .from('candidates')
      .select('id, full_name, title, skills, location, experience_years, bio')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setCandidates(data || [])
    }
    setLoading(false)
  }

  const filtered = candidates.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    (c.location || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Kandidaten suchen</h1>
      
      <input
        type="text"
        placeholder="Suche nach Name, Titel, Skill oder Ort..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <p>Lade Kandidaten...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Keine Kandidaten gefunden. Lege zuerst Profile an.</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold">{c.full_name}</h2>
              <p className="text-gray-600">
                {c.title || 'Kein Titel'} · {c.location || 'Kein Ort'} · {c.experience_years ?? '?'} Jahre
              </p>
              {c.bio && <p className="mt-2 text-sm text-gray-700">{c.bio}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {(c.skills || []).map(s => (
                  <span key={s} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{s}</span>
                ))}
              </div>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Kontakt aufnehmen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
